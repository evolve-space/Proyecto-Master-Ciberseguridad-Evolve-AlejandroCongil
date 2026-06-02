"""
Orchestrates the full ingestion of a single ZIP file.
Handles decompression, routing each file to the correct parser,
chunking, metadata tagging, and persistence into ChromaDB.
"""
import hashlib
import json
import logging
import re
import shutil
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

import anthropic

from src.ingest.chunker import chunk_text
from src.ingest.parsers.links import parse_links
from src.ingest.parsers.text import parse_text
from src.ingest.parsers.video import is_video, transcribe_video
from src.ingest.parsers.vision import interpret_image
from src.ingest.parsers.xmind import parse_xmind
from src.store.vectorstore import VectorStore

logger = logging.getLogger(__name__)

_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"}


# ── Public entry point ───────────────────────────────────────────────────────

def process_zip(zip_path: Path, config: Dict) -> int:
    """
    Ingest a ZIP file. Returns the number of chunks added.
    Skips silently if the ZIP was already processed (hash-based dedup).
    """
    log_path = Path(config["paths"]["processed_log"])
    processed = _load_log(log_path)

    file_hash = _hash_file(zip_path)
    if file_hash in processed:
        logger.info("'%s' ya fue procesado — omitiendo.", zip_path.name)
        return 0

    session_date = _parse_date(zip_path.name)
    logger.info("Procesando '%s'  (sesión: %s)", zip_path.name, session_date)

    client = anthropic.Anthropic()
    store = VectorStore(
        db_path=config["paths"]["chroma_db"],
        collection_name=config["chromadb"]["collection_name"],
    )

    extract_dir = Path(config["paths"]["processed"]) / zip_path.stem
    extract_dir.mkdir(parents=True, exist_ok=True)

    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(extract_dir)

        chunks_added = _process_directory(
            extract_dir, session_date, zip_path.name, config, client, store
        )
    except Exception:
        shutil.rmtree(extract_dir, ignore_errors=True)
        raise

    # Move ZIP to processed/ only if configured to do so (default: keep in place)
    if config["ingestion"].get("move_after_ingest", True):
        dest = Path(config["paths"]["processed"]) / zip_path.name
        if zip_path.resolve() != dest.resolve():
            shutil.move(str(zip_path), str(dest))

    # Record in log
    processed[file_hash] = {
        "zip_name": zip_path.name,
        "session_date": session_date,
        "processed_at": datetime.now().isoformat(),
        "chunks_added": chunks_added,
    }
    _save_log(log_path, processed)

    logger.info("✓ '%s' — %d fragmentos añadidos.", zip_path.name, chunks_added)
    return chunks_added


# ── Directory traversal ──────────────────────────────────────────────────────

def _process_directory(
    directory: Path,
    session_date: str,
    zip_name: str,
    config: Dict,
    client: anthropic.Anthropic,
    store: VectorStore,
) -> int:
    total = 0
    for file_path in sorted(directory.rglob("*")):
        if file_path.is_dir():
            continue
        added = _process_file(file_path, directory, session_date, zip_name, config, client, store)
        total += added
    return total


def _process_file(
    file_path: Path,
    root_dir: Path,
    session_date: str,
    zip_name: str,
    config: Dict,
    client: anthropic.Anthropic,
    store: VectorStore,
) -> int:
    rel = file_path.relative_to(root_dir)
    parts_upper = [p.upper() for p in rel.parts[:-1]]
    stem_upper = file_path.stem.upper()
    ext = file_path.suffix.lower()

    # Determine logical folder context
    in_apuntes = any("APUNTES" in p for p in parts_upper)
    # RECURSOS can be its own folder OR a txt file named RECURSOS inside APUNTES
    in_recursos = (
        any("RECURSOS" in p for p in parts_upper)
        or "RECURSOS" in stem_upper
    )

    text: str = ""
    source_type: str = "notes"
    category: str = "knowledge"

    if ext in _IMAGE_EXTS:
        if not in_apuntes:
            return 0  # Only interpret images inside APUNTES/
        logger.info("  🖼  Interpretando imagen: %s", file_path.name)

        # Detect exercise answers by filename OR parent folder name
        # e.g. "EJERCICIOS PRACTICOS SEGUNDA PREGUNTA.../" contains "1.png", "2.png"...
        _EXERCISE_KEYWORDS = ("EJERCICIO", "PREGUNTA", "RESPUESTA", "ANSWER")
        is_exercise_answer = any(kw in stem_upper for kw in _EXERCISE_KEYWORDS) or any(
            kw in p for p in parts_upper for kw in _EXERCISE_KEYWORDS
        )
        if is_exercise_answer:
            # Use filename + closest parent folder as natural-language context for Claude
            context_label = file_path.stem
            if context_label.isdigit() and len(rel.parts) >= 2:
                # Generic name like "1.png" — use parent folder for context
                context_label = f"{rel.parts[-2]} (imagen {context_label})"
            img_ctx = (
                f"Esta imagen es la respuesta visual al ejercicio: '{context_label}'. "
                "Describe el contenido completo: comandos ejecutados, outputs de terminal, "
                "texto escrito o cualquier información técnica visible."
            )
            source_type = "answer"
        else:
            img_ctx = (
                "Es una captura de práctica en Kali Linux o entorno de ciberseguridad. "
                "Describe herramienta, comandos, output y concepto demostrado."
            )
            source_type = "screenshot"

        text = interpret_image(
            file_path,
            client,
            config["claude"]["vision_model"],
            session_date,
            image_context=img_ctx,
        )

    elif is_video(file_path):
        whisper_cfg = config.get("whisper", {})
        text = transcribe_video(
            file_path,
            model_size=whisper_cfg.get("model_size", "base"),
            language=whisper_cfg.get("language", "es") or None,
            device=whisper_cfg.get("device", "cpu"),
            client=client,
            vision_model=config["claude"].get("vision_model", ""),
            session_date=session_date,
            frame_interval=whisper_cfg.get("frame_interval", 90),
        )
        source_type = "video_transcript"
        category = "knowledge"

    elif ext == ".xmind":
        text = parse_xmind(file_path)
        source_type = "mindmap"
        category = "methodology"

    elif ext in (".txt", ".md", ".docx", ".doc"):
        if in_recursos:
            text = parse_links(file_path)
            source_type = "external_tool"
            category = "external-tool"
        else:
            text = parse_text(file_path)
            source_type = _classify_txt(stem_upper, in_apuntes)

    else:
        return 0

    if not text or not text.strip():
        logger.debug("  Sin contenido: %s", file_path.name)
        return 0

    chunks, ids, metas = _build_chunks(
        text, source_type, category, session_date, zip_name, file_path, config
    )

    store.add_chunks(chunks, metas, ids)
    logger.info("  ✓ %s → %d fragmentos (%s)", file_path.name, len(chunks), source_type)
    return len(chunks)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _classify_txt(stem_upper: str, in_apuntes: bool) -> str:
    if "TRANSCRIPCI" in stem_upper:
        return "transcript"
    if "RESUMEN" in stem_upper:
        return "summary"
    if in_apuntes:
        if any(k in stem_upper for k in ("EJERCICIO", "PRACTICA", "TASK", "LAB")):
            return "exercise"
        if any(k in stem_upper for k in ("RESPUESTA", "SOLUCION", "ANSWER")):
            return "answer"
    return "notes"


def _build_chunks(
    text: str,
    source_type: str,
    category: str,
    session_date: str,
    zip_name: str,
    file_path: Path,
    config: Dict,
) -> Tuple[List[str], List[str], List[Dict]]:
    chunk_size = config["ingestion"]["chunk_size"]
    overlap = config["ingestion"]["chunk_overlap"]

    if source_type in ("summary", "screenshot", "external_tool"):
        # Keep these as single chunks — they're already concise
        raw_chunks = [text]
    else:
        raw_chunks = chunk_text(text, chunk_size, overlap)

    # Stable IDs: session_date + filename stem + type + index
    safe_stem = re.sub(r"[^a-zA-Z0-9_\-]", "_", file_path.stem)[:40]
    base_id = f"{session_date}__{safe_stem}__{source_type}"

    ids = [f"{base_id}__{i}" for i in range(len(raw_chunks))]
    metas = [
        {
            "session_date": session_date,
            "zip_name": zip_name,
            "source_type": source_type,
            "category": category,
            "file_name": file_path.name,
            "chunk_index": i,
            "total_chunks": len(raw_chunks),
            # Reserved for future phases
            "tool_name": "",
            "attack_phase": "",
            "platform": "",
        }
        for i in range(len(raw_chunks))
    ]
    return raw_chunks, ids, metas


def _parse_date(zip_name: str) -> str:
    """
    Parse session date from ZIP filename.
    Supports: 15-01.zip, 15.01.zip, 15_01.zip, 15-01-2025.zip
    Returns ISO format YYYY-MM-DD.
    """
    stem = Path(zip_name).stem
    parts = re.split(r"[-._]", stem)
    if len(parts) >= 2 and parts[0].isdigit() and parts[1].isdigit():
        day = parts[0].zfill(2)
        month = parts[1].zfill(2)
        year = int(parts[2]) if len(parts) >= 3 and parts[2].isdigit() else datetime.now().year
        return f"{year}-{month}-{day}"
    return stem  # Fallback: use the stem as-is


def _hash_file(path: Path) -> str:
    sha = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(65536), b""):
            sha.update(block)
    return sha.hexdigest()


def _load_log(path: Path) -> Dict:
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def _save_log(path: Path, data: Dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
