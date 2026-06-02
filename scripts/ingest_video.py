"""
Ingesta un video MP4 suelto en ChromaDB vinculandolo a una sesion existente.
Uso: python scripts/ingest_video.py <ruta_video> <session_date YYYY-MM-DD>
Ejemplo: python scripts/ingest_video.py 20-04.mp4 2025-04-20
"""
import sys
import re
import logging
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import yaml
import anthropic

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def main():
    if len(sys.argv) < 3:
        print("Uso: python scripts/ingest_video.py <ruta_video> <YYYY-MM-DD>")
        sys.exit(1)

    video_path = Path(sys.argv[1])
    session_date = sys.argv[2]

    if not video_path.exists():
        logger.error("No se encuentra el archivo: %s", video_path)
        sys.exit(1)

    cfg = yaml.safe_load(open("config/settings.yaml", encoding="utf-8"))
    whisper_cfg = cfg.get("whisper", {})

    from src.store.vectorstore import VectorStore
    from src.ingest.chunker import chunk_text
    from src.ingest.parsers.video import transcribe_video

    store = VectorStore(cfg["paths"]["chroma_db"], cfg["chromadb"]["collection_name"])
    client = anthropic.Anthropic()

    logger.info("Iniciando ingesta de: %s (sesion: %s)", video_path.name, session_date)
    logger.info("frame_interval: %ds | modelo Whisper: %s | Vision: %s",
                whisper_cfg.get("frame_interval", 15),
                whisper_cfg.get("model_size", "base"),
                cfg["claude"]["vision_model"])

    text = transcribe_video(
        video_path,
        model_size=whisper_cfg.get("model_size", "base"),
        language=whisper_cfg.get("language", "es") or None,
        device=whisper_cfg.get("device", "cpu"),
        client=client,
        vision_model=cfg["claude"]["vision_model"],
        session_date=session_date,
        frame_interval=whisper_cfg.get("frame_interval", 15),
    )

    if not text or not text.strip():
        logger.error("No se obtuvo contenido del video.")
        sys.exit(1)

    logger.info("Contenido generado: %d caracteres", len(text))

    chunks = chunk_text(text, cfg["ingestion"]["chunk_size"], cfg["ingestion"]["chunk_overlap"])
    safe_stem = re.sub(r"[^a-zA-Z0-9_\-]", "_", video_path.stem)[:40]
    base_id = f"{session_date}__{safe_stem}__video_transcript"
    ids   = [f"{base_id}__{i}" for i in range(len(chunks))]
    metas = [
        {
            "session_date":  session_date,
            "zip_name":      video_path.name,
            "source_type":   "video_transcript",
            "category":      "knowledge",
            "file_name":     video_path.name,
            "chunk_index":   i,
            "total_chunks":  len(chunks),
            "tool_name":     "",
            "attack_phase":  "",
            "platform":      "",
        }
        for i in range(len(chunks))
    ]

    store.add_chunks(chunks, metas, ids)

    total = store.get_stats()["total_chunks"]
    logger.info("COMPLETADO — %d fragmentos añadidos. Total en ChromaDB: %d", len(chunks), total)


if __name__ == "__main__":
    main()
