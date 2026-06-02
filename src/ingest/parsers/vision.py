"""
Claude Vision parser for Kali Linux screenshots and practice captures.
Produces descriptive text suitable for ingestion — not OCR, but semantic interpretation.
"""
import base64
import logging
from pathlib import Path

import anthropic

logger = logging.getLogger(__name__)

_MEDIA_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/png",  # Pillow will convert BMP to PNG bytes if needed
}

_PROMPT = """\
Esta es una captura de pantalla de material de estudio de un máster de ciberseguridad ofensiva.{context}

La imagen puede ser cualquiera de estos casos — analiza cuál es y actúa en consecuencia:

A) Terminal / consola (Kali Linux, Windows cmd, etc.):
   - Herramienta usada (nombre exacto)
   - Comandos ejecutados — transcríbelos literalmente
   - Output completo y qué significa técnicamente
   - Fase del ataque: reconocimiento / escaneo / explotación / post-explotación / otro

B) Respuesta escrita a un ejercicio (texto, documento, navegador web):
   - Transcribe el contenido completo del texto visible
   - Concepto de seguridad al que responde
   - Si hay código o comandos, transcríbelos exactamente

C) Diagrama, mapa mental o esquema:
   - Describe la estructura y todos los nodos / elementos visibles
   - Relaciones y jerarquías presentes

D) Cualquier otro contenido técnico:
   - Describe con detalle lo que muestra y su relevancia en ciberseguridad

Sé específico y técnico. Si hay texto visible, transcríbelo completo. Responde en español."""


def interpret_image(
    file_path: Path,
    client: anthropic.Anthropic,
    vision_model: str,
    session_date: str = "",
    image_context: str = "",
) -> str:
    """
    image_context: optional hint for Claude, e.g. 'respuesta de ejercicio' vs 'captura de terminal'.
    """
    ext = file_path.suffix.lower()
    media_type = _MEDIA_TYPES.get(ext, "image/png")

    image_bytes = _read_image(file_path, ext)
    if not image_bytes:
        logger.warning("No se pudo leer la imagen: %s", file_path.name)
        return ""

    # Claude vision accepts up to ~5 MB base64
    if len(image_bytes) > 5 * 1024 * 1024:
        image_bytes = _resize_image(image_bytes)

    b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
    context_parts = []
    if session_date:
        context_parts.append(f"La imagen corresponde a la sesión del {session_date}.")
    if image_context:
        context_parts.append(f"Contexto adicional: {image_context}.")
    context = (" " + " ".join(context_parts)) if context_parts else ""

    try:
        response = client.messages.create(
            model=vision_model,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": _PROMPT.format(context=context),
                        },
                    ],
                }
            ],
        )
        return response.content[0].text
    except Exception as exc:
        logger.error("Error interpretando imagen %s: %s", file_path.name, exc)
        return f"[Error al interpretar imagen {file_path.name}: {exc}]"


def _read_image(file_path: Path, ext: str) -> bytes:
    try:
        if ext == ".bmp":
            # Convert BMP to PNG via Pillow so the API accepts it
            from PIL import Image
            import io
            with Image.open(file_path) as img:
                buf = io.BytesIO()
                img.save(buf, format="PNG")
                return buf.getvalue()
        return file_path.read_bytes()
    except Exception as exc:
        logger.error("No se pudo leer %s: %s", file_path.name, exc)
        return b""


def _resize_image(data: bytes) -> bytes:
    """Resize image to fit under the 5 MB API limit."""
    try:
        from PIL import Image
        import io
        with Image.open(io.BytesIO(data)) as img:
            img.thumbnail((1920, 1080))
            buf = io.BytesIO()
            img.save(buf, format="PNG", optimize=True)
            return buf.getvalue()
    except Exception:
        return data
