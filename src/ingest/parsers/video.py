"""
Video parser: audio transcription (faster-whisper, local) + visual frame analysis (Claude Vision).

For each video, the pipeline:
  1. Transcribes audio with timestamps via Whisper (free, local).
  2. Extracts one frame every `frame_interval` seconds via ffmpeg.
  3. Skips frames that are visually near-identical to the previous one (dedup).
  4. Sends unique frames to Claude Vision to describe slide/terminal/diagram content.
  5. Weaves audio segments and visual descriptions into one timestamped document.

Requires: ffmpeg in PATH (winget install ffmpeg).
Optional: Pillow for frame dedup (pip install Pillow).
"""
import logging
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import List, Optional, Tuple

logger = logging.getLogger(__name__)

_VIDEO_EXTS = {".mp4", ".avi", ".mkv", ".mov", ".wmv", ".webm", ".m4v", ".flv",
               ".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".wma"}

_AUDIO_ONLY_EXTS = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".wma"}

# Module-level Whisper model cache
_model = None
_loaded_size: Optional[str] = None


def is_video(file_path: Path) -> bool:
    return file_path.suffix.lower() in _VIDEO_EXTS


# ── Public entry point ────────────────────────────────────────────────────────

def transcribe_video(
    file_path: Path,
    model_size: str = "base",
    language: Optional[str] = "es",
    device: str = "cpu",
    client=None,
    vision_model: str = "",
    session_date: str = "",
    frame_interval: int = 90,
) -> str:
    """
    Full video analysis. Returns a timestamped document combining:
      - Audio transcript (always, via Whisper)
      - Visual frame descriptions (when client + vision_model are provided and file has video stream)
    """
    if not _check_ffmpeg():
        return "[Sin transcripcion: ffmpeg no encontrado. Instala con: winget install ffmpeg]"

    is_audio_only = file_path.suffix.lower() in _AUDIO_ONLY_EXTS
    use_vision = (client is not None and vision_model and not is_audio_only)

    segments_with_ts = _transcribe_with_timestamps(file_path, model_size, language, device)
    if not segments_with_ts:
        return f"[Sin contenido de audio en {file_path.name}]"

    if not use_vision:
        # Audio-only path (original behaviour)
        return "\n".join(text for _, _, text in segments_with_ts)

    # Full audio + visual path
    return _build_combined_document(
        file_path, segments_with_ts, client, vision_model, session_date, frame_interval
    )


# ── Audio transcription ───────────────────────────────────────────────────────

def _transcribe_with_timestamps(
    file_path: Path,
    model_size: str,
    language: Optional[str],
    device: str,
) -> List[Tuple[float, float, str]]:
    """
    Returns list of (start_seconds, end_seconds, text) tuples.
    """
    global _model, _loaded_size
    try:
        _model, _loaded_size = _load_model(model_size, device, _model, _loaded_size)
    except Exception as exc:
        logger.error("No se pudo cargar Whisper: %s", exc)
        return []

    logger.info("  Transcribiendo audio: %s", file_path.name)
    try:
        segments, info = _model.transcribe(
            str(file_path),
            beam_size=5,
            language=language,
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 500},
        )
        result = [(seg.start, seg.end, seg.text.strip()) for seg in segments if seg.text.strip()]
        logger.info(
            "  Audio: %d segmentos, %.0fs totales (idioma: %s)",
            len(result), info.duration, info.language if language is None else language,
        )
        return result
    except Exception as exc:
        logger.error("Error transcribiendo '%s': %s", file_path.name, exc)
        return []


# ── Frame extraction & dedup ─────────────────────────────────────────────────

def _extract_frames(
    video_path: Path,
    out_dir: Path,
    interval: int,
) -> List[Tuple[float, Path]]:
    """
    Extract one frame every `interval` seconds using ffmpeg.
    Returns list of (timestamp_seconds, frame_path).
    """
    pattern = str(out_dir / "frame_%05d.jpg")
    cmd = [
        "ffmpeg", "-i", str(video_path),
        "-vf", f"fps=1/{interval},scale=1280:-2",
        "-q:v", "4",
        pattern,
        "-y", "-loglevel", "error",
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True)
    except subprocess.CalledProcessError as exc:
        logger.error("ffmpeg frame extraction failed: %s", exc.stderr.decode(errors="replace"))
        return []

    frames = sorted(out_dir.glob("frame_*.jpg"))
    return [(i * interval, f) for i, f in enumerate(frames)]


def _is_duplicate(frame_path: Path, prev_path: Optional[Path], threshold: float = 0.97) -> bool:
    """
    Returns True if frame is visually near-identical to prev_path.
    Uses tiny thumbnail pixel comparison (no external deps beyond Pillow).
    """
    if prev_path is None:
        return False
    try:
        from PIL import Image
        import math

        def _load_thumb(p: Path):
            with Image.open(p) as img:
                return img.convert("L").resize((64, 36))

        a = list(_load_thumb(frame_path).getdata())
        b = list(_load_thumb(prev_path).getdata())
        if len(a) != len(b):
            return False
        diff = sum(abs(x - y) for x, y in zip(a, b))
        max_diff = 255 * len(a)
        similarity = 1.0 - (diff / max_diff)
        return similarity >= threshold
    except Exception:
        return False


# ── Vision analysis of a single frame ────────────────────────────────────────

_FRAME_PROMPT = """\
Eres un asistente analizando un fotograma de una clase de master de ciberseguridad ofensiva.
{context}

Describe con precision tecnica lo que aparece en pantalla. Posibilidades:

A) Diapositiva / presentacion:
   - Titulo exacto de la diapositiva
   - Todos los puntos, conceptos y texto visible (transcribelos literalmente)
   - Si hay diagramas o esquemas, describe su estructura

B) Terminal / consola (Kali, Windows, etc.):
   - Comando exacto ejecutado
   - Output visible completo
   - Herramienta utilizada y que fase del ataque representa

C) Navegador / interfaz web:
   - URL si es visible
   - Contenido relevante de la pagina (herramienta OSINT, plataforma, etc.)

D) Codigo o editor:
   - Lenguaje de programacion
   - Transcribe el codigo visible

E) Otro contenido tecnico:
   - Describe detalladamente

Si la pantalla esta en negro, identica a la anterior, o no tiene contenido relevante, responde solo: [SIN CONTENIDO NUEVO]

Responde en espanol. Se especifico y tecnico."""


def _describe_frame(
    frame_path: Path,
    timestamp: float,
    session_date: str,
    client,
    vision_model: str,
) -> str:
    import base64
    try:
        img_bytes = frame_path.read_bytes()
        # Resize if over 5MB
        if len(img_bytes) > 5 * 1024 * 1024:
            from PIL import Image
            import io
            with Image.open(io.BytesIO(img_bytes)) as img:
                img.thumbnail((1280, 720))
                buf = io.BytesIO()
                img.save(buf, format="JPEG", quality=85)
                img_bytes = buf.getvalue()

        b64 = base64.standard_b64encode(img_bytes).decode()
        context = f"Sesion del {session_date}. " if session_date else ""
        context += f"Fotograma extraido en el minuto {int(timestamp // 60)}:{int(timestamp % 60):02d}."

        response = client.messages.create(
            model=vision_model,
            max_tokens=800,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64}},
                    {"type": "text", "text": _FRAME_PROMPT.format(context=context)},
                ],
            }],
        )
        return response.content[0].text.strip()
    except Exception as exc:
        logger.error("Error analizando fotograma %s: %s", frame_path.name, exc)
        return ""


# ── Document assembly ─────────────────────────────────────────────────────────

def _fmt_ts(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    return f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def _build_combined_document(
    video_path: Path,
    audio_segments: List[Tuple[float, float, str]],
    client,
    vision_model: str,
    session_date: str,
    frame_interval: int,
) -> str:
    """
    Extracts frames, describes them, then weaves visual + audio into one document.
    """
    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        logger.info("  Extrayendo fotogramas (cada %ds)...", frame_interval)
        raw_frames = _extract_frames(video_path, tmp_dir, frame_interval)

        if not raw_frames:
            logger.warning("  No se pudieron extraer fotogramas. Solo audio.")
            return "\n".join(text for _, _, text in audio_segments)

        # Deduplicate consecutive similar frames
        unique_frames: List[Tuple[float, Path]] = []
        prev_path: Optional[Path] = None
        for ts, fp in raw_frames:
            if not _is_duplicate(fp, prev_path):
                unique_frames.append((ts, fp))
                prev_path = fp

        logger.info(
            "  %d fotogramas unicos de %d extraidos — enviando a Vision...",
            len(unique_frames), len(raw_frames),
        )

        # Describe each unique frame
        visual_events: List[Tuple[float, str]] = []
        for ts, fp in unique_frames:
            desc = _describe_frame(fp, ts, session_date, client, vision_model)
            if desc and "[SIN CONTENIDO NUEVO]" not in desc:
                visual_events.append((ts, desc))
                logger.debug("  [%s] fotograma descrito (%d chars)", _fmt_ts(ts), len(desc))

        logger.info("  %d eventos visuales utiles capturados.", len(visual_events))

    # Merge audio segments and visual events into timeline
    events: List[Tuple[float, str, str]] = []  # (timestamp, kind, content)
    for ts, desc in visual_events:
        events.append((ts, "VISUAL", desc))
    for start, end, text in audio_segments:
        events.append((start, "AUDIO", f"[{_fmt_ts(start)} - {_fmt_ts(end)}] {text}"))

    events.sort(key=lambda x: x[0])

    lines = [
        f"CLASE EN VIDEO: {video_path.name}",
        f"Sesion: {session_date}" if session_date else "",
        f"Segmentos de audio: {len(audio_segments)} | Eventos visuales: {len(visual_events)}",
        "=" * 60,
        "",
    ]

    current_visual: Optional[str] = None
    for ts, kind, content in events:
        if kind == "VISUAL":
            # Print new visual block
            lines.append(f"[{_fmt_ts(ts)}] [PANTALLA]")
            lines.append(content)
            lines.append("")
            current_visual = content
        else:
            lines.append(content)

    return "\n".join(line for line in lines if line is not None)


# ── Internal helpers ──────────────────────────────────────────────────────────

def _load_model(size: str, device: str, current_model, current_size):
    if current_model is not None and current_size == size:
        return current_model, current_size
    from faster_whisper import WhisperModel
    logger.info("Cargando modelo Whisper '%s' en %s...", size, device)
    compute = "int8" if device == "cpu" else "float16"
    model = WhisperModel(size, device=device, compute_type=compute)
    logger.info("Modelo Whisper listo.")
    return model, size


def _check_ffmpeg() -> bool:
    ok = shutil.which("ffmpeg") is not None
    if not ok:
        logger.error("ffmpeg no encontrado. Instala con: winget install ffmpeg")
    return ok
