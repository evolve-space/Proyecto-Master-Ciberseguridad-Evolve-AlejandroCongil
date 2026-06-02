"""
File system watcher for data/inbox/.
Automatically ingests any new .zip file dropped into the folder.
"""
import logging
import time
from pathlib import Path
from typing import Dict

from watchdog.events import FileCreatedEvent, FileSystemEventHandler
from watchdog.observers import Observer

from src.ingest.zip_handler import process_zip

logger = logging.getLogger(__name__)


class _InboxHandler(FileSystemEventHandler):
    def __init__(self, config: Dict):
        self.config = config
        self._seen: set[str] = set()

    def on_created(self, event: FileCreatedEvent) -> None:
        if event.is_directory:
            return
        path = Path(event.src_path)
        if path.suffix.lower() != ".zip":
            return
        if str(path) in self._seen:
            return

        self._seen.add(str(path))
        logger.info("📦  Nuevo ZIP detectado: %s", path.name)

        # Brief delay so the OS finishes writing the file before we open it
        time.sleep(1)

        try:
            process_zip(path, self.config)
        except Exception as exc:
            logger.error("Error procesando '%s': %s", path.name, exc)
        finally:
            self._seen.discard(str(path))


def start_watcher(config: Dict) -> None:
    inbox = Path(config["paths"]["inbox"])
    inbox.mkdir(parents=True, exist_ok=True)

    # Process any ZIPs already waiting in inbox/ on startup
    existing = list(inbox.glob("*.zip"))
    if existing:
        logger.info("Procesando %d ZIP(s) pendientes en inbox/…", len(existing))
        for zip_path in existing:
            try:
                process_zip(zip_path, config)
            except Exception as exc:
                logger.error("Error procesando '%s': %s", zip_path.name, exc)

    handler = _InboxHandler(config)
    observer = Observer()
    observer.schedule(handler, str(inbox), recursive=False)
    observer.start()
    logger.info("👁  Vigilando '%s' — pulsa Ctrl+C para detener.", inbox)

    try:
        while True:
            time.sleep(2)
    except KeyboardInterrupt:
        logger.info("Deteniendo watcher…")
    finally:
        observer.stop()
        observer.join()
