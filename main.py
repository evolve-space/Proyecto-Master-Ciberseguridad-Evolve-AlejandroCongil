"""
CyberSec RAG — entry point

Commands:
  python main.py              # Start web interface (default)
  python main.py web          # Same as above
  python main.py watch        # Watch data/inbox/ for new ZIPs
  python main.py ingest <f>   # Ingest a specific ZIP file
  python main.py ingest-all   # Process all ZIPs in data/inbox/
"""
import logging
import os
import sys
from pathlib import Path

import yaml

import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


def load_config() -> dict:
    cfg_path = Path(__file__).parent / "config" / "settings.yaml"
    with open(cfg_path, encoding="utf-8") as f:
        config = yaml.safe_load(f)

    # Resolve paths: absolute paths are used as-is; relative ones are anchored to project root
    root = Path(__file__).parent
    for key in config["paths"]:
        p = Path(config["paths"][key])
        config["paths"][key] = str(p) if p.is_absolute() else str(root / p)

    # Ensure directories exist
    for key in ("inbox", "processed", "chroma_db"):
        Path(config["paths"][key]).mkdir(parents=True, exist_ok=True)

    return config


def check_api_key() -> None:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print(
            "\n[ERROR] Variable de entorno ANTHROPIC_API_KEY no encontrada.\n"
            "Configúrala ejecutando (en una terminal nueva):\n\n"
            '  setx ANTHROPIC_API_KEY "sk-ant-TU_CLAVE"\n\n'
            "Luego cierra y reabre esta terminal.\n"
        )
        sys.exit(1)


def cmd_web(config: dict) -> None:
    import uvicorn
    from src.interface.web import create_app

    app = create_app(config)
    host = config["web"]["host"]
    port = config["web"]["port"]
    logger.info("Iniciando servidor web en http://%s:%s", host, port)
    uvicorn.run(app, host=host, port=port, log_level="warning")


def cmd_watch(config: dict) -> None:
    from src.ingest.watcher import start_watcher
    start_watcher(config)


def cmd_ingest(zip_path: Path, config: dict) -> None:
    from src.ingest.zip_handler import process_zip
    if not zip_path.exists():
        print(f"[ERROR] Archivo no encontrado: {zip_path}")
        sys.exit(1)
    added = process_zip(zip_path, config)
    print(f"✓ Ingestado: {added} fragmentos añadidos.")


def cmd_ingest_all(config: dict) -> None:
    from src.ingest.zip_handler import process_zip
    inbox = Path(config["paths"]["inbox"])
    zips = sorted(inbox.glob("*.zip"))
    if not zips:
        print(f"No hay ZIPs en {inbox}")
        return
    print(f"Procesando {len(zips)} archivo(s)…")
    total = 0
    for z in zips:
        try:
            total += process_zip(z, config)
        except Exception as exc:
            logger.error("Error con '%s': %s", z.name, exc)
    print(f"✓ Total: {total} fragmentos añadidos.")


def main() -> None:
    check_api_key()
    config = load_config()

    args = sys.argv[1:]
    cmd = args[0] if args else "web"

    if cmd in ("web", ""):
        cmd_web(config)
    elif cmd == "watch":
        cmd_watch(config)
    elif cmd == "ingest":
        if len(args) < 2:
            print("Uso: python main.py ingest <ruta/al/archivo.zip>")
            sys.exit(1)
        cmd_ingest(Path(args[1]), config)
    elif cmd == "ingest-all":
        cmd_ingest_all(config)
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
