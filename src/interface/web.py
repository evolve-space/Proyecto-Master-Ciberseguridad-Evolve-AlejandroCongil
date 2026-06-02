"""
FastAPI web interface with SSE streaming for Claude responses.
"""
import json
import logging
import re
import tempfile
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import anthropic
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel

from src.ingest.chunker import chunk_text
from src.ingest.zip_handler import process_zip
from src.query.reasoner import SYSTEM_PROMPT, _format_context
from src.query.retriever import Retriever
from src.store.vectorstore import VectorStore

logger = logging.getLogger(__name__)

_STATIC = Path(__file__).parent.parent.parent / "static"


class QueryRequest(BaseModel):
    query: str
    category: Optional[str] = None
    n_results: int = 5


class LabCompleteRequest(BaseModel):
    tool_id: str
    tool_name: str
    phase: int
    category: str
    attack_phase: str
    description: str
    tasks_completed: List[str]
    commands_used: List[str]
    findings: str
    connections: str


def create_app(config: dict) -> FastAPI:
    app = FastAPI(title="CyberSec RAG", docs_url=None, redoc_url=None)

    async_client = anthropic.AsyncAnthropic()
    store = VectorStore(
        db_path=config["paths"]["chroma_db"],
        collection_name=config["chromadb"]["collection_name"],
    )
    retriever = Retriever(store)

    # ── Static pages ──────────────────────────────────────────────────────────

    @app.get("/", response_class=HTMLResponse)
    async def index():
        return (_STATIC / "index.html").read_text(encoding="utf-8")

    @app.get("/lab", response_class=HTMLResponse)
    async def lab():
        return (_STATIC / "osint_lab.html").read_text(encoding="utf-8")

    @app.get("/framework", response_class=HTMLResponse)
    async def framework():
        return (_STATIC / "osint_framework.html").read_text(encoding="utf-8")

    # ── API endpoints ─────────────────────────────────────────────────────────

    _ROOT = Path(__file__).parent.parent.parent
    _ARF_CACHE = next(
        (p for p in [_ROOT / "arf.json", _ROOT / "data" / "arf.json"] if p.exists()),
        _ROOT / "data" / "arf.json"
    )
    _ARF_URLS = [
        "https://raw.githubusercontent.com/lockfale/osint-framework/main/arf.json",
        "https://raw.githubusercontent.com/lockfale/osint-framework/master/arf.json",
        "https://raw.githubusercontent.com/lockfale/OSINT-Framework/main/arf.json",
    ]

    @app.get("/api/arf")
    async def get_arf():
        """Serve OSINT Framework JSON, downloading and caching it locally on first request."""
        if _ARF_CACHE.exists():
            return json.loads(_ARF_CACHE.read_text(encoding="utf-8"))

        last_err = None
        for url in _ARF_URLS:
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "CyberSecRAG/1.0"})
                with urllib.request.urlopen(req, timeout=15) as resp:
                    raw = resp.read()
                _ARF_CACHE.parent.mkdir(parents=True, exist_ok=True)
                _ARF_CACHE.write_bytes(raw)
                logger.info("arf.json descargado y cacheado en %s", _ARF_CACHE)
                return json.loads(raw)
            except Exception as exc:
                last_err = exc
                logger.warning("Fallo descargando %s: %s", url, exc)

        raise HTTPException(status_code=502, detail=f"No se pudo descargar arf.json: {last_err}")

    @app.get("/api/stats")
    async def get_stats():
        return store.get_stats()

    @app.post("/api/query")
    async def query_endpoint(request: QueryRequest):
        if not request.query.strip():
            raise HTTPException(status_code=400, detail="La consulta no puede estar vacía.")

        chunks = retriever.retrieve(
            query=request.query,
            n_results=request.n_results,
            category=request.category or None,
        )

        # Deduplicated source list for the UI badges
        seen: set = set()
        sources = []
        for c in chunks:
            key = (c["metadata"].get("session_date", "?"), c["metadata"].get("source_type", "?"))
            if key not in seen:
                seen.add(key)
                sources.append({"date": key[0], "type": key[1]})

        async def generate():
            # First event: source badges
            yield f"data: {json.dumps({'sources': sources})}\n\n"

            if not chunks:
                yield f"data: {json.dumps({'text': 'No se encontraron fragmentos relevantes en la base de conocimiento.'})}\n\n"
                yield "data: [DONE]\n\n"
                return

            context = _format_context(chunks)

            try:
                async with async_client.messages.stream(
                    model=config["claude"]["model"],
                    max_tokens=config["claude"]["max_tokens"],
                    system=[
                        {
                            "type": "text",
                            "text": SYSTEM_PROMPT,
                            # Cache the system prompt — saves input tokens on every query
                            "cache_control": {"type": "ephemeral"},
                        }
                    ],
                    messages=[
                        {
                            "role": "user",
                            "content": (
                                f"CONTEXTO RECUPERADO:\n{context}"
                                f"\n\nPREGUNTA: {request.query}"
                            ),
                        }
                    ],
                ) as stream:
                    async for text in stream.text_stream:
                        yield f"data: {json.dumps({'text': text})}\n\n"
            except Exception as exc:
                logger.error("Error en streaming de Claude: %s", exc)
                yield f"data: {json.dumps({'text': f'[Error: {exc}]'})}\n\n"

            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    @app.post("/api/lab/complete")
    async def lab_complete(req: LabCompleteRequest):
        """
        Receives a completed lab exercise and ingests it into ChromaDB
        as a tool_exercise document with full methodology documentation.
        """
        now = datetime.now().isoformat(timespec="seconds")
        tasks_block = "\n".join(f"  - {t}" for t in req.tasks_completed) or "  (ninguna registrada)"
        cmds_block  = "\n".join(f"  $ {c}" for c in req.commands_used)   or "  (ningun comando registrado)"

        doc = (
            f"HERRAMIENTA OSINT: {req.tool_name}\n"
            f"CATEGORIA: {req.category}\n"
            f"FASE: {req.phase} -- Reconocimiento / {req.attack_phase}\n"
            f"FECHA DE PRACTICA: {now}\n"
            f"TOOL_ID: {req.tool_id}\n\n"
            f"DESCRIPCION:\n{req.description}\n\n"
            f"TAREAS COMPLETADAS:\n{tasks_block}\n\n"
            f"COMANDOS UTILIZADOS:\n{cmds_block}\n\n"
            f"HALLAZGOS Y RESULTADOS:\n{req.findings}\n\n"
            f"CONEXIONES CON OTRAS HERRAMIENTAS:\n{req.connections}\n"
        )

        chunks = chunk_text(doc, chunk_size=1500, overlap=150)
        safe_id = re.sub(r"[^a-zA-Z0-9_-]", "_", req.tool_id)[:40]
        base_id = f"lab__{safe_id}__{now[:10]}"
        ids   = [f"{base_id}__{i}" for i in range(len(chunks))]
        metas = [
            {
                "session_date":  now[:10],
                "zip_name":      "lab_exercise",
                "source_type":   "tool_exercise",
                "category":      "methodology",
                "file_name":     f"{req.tool_id}_exercise.txt",
                "chunk_index":   i,
                "total_chunks":  len(chunks),
                "tool_name":     req.tool_name,
                "attack_phase":  req.attack_phase,
                "platform":      "",
            }
            for i in range(len(chunks))
        ]

        store.add_chunks(chunks, metas, ids)
        logger.info("Lab exercise '%s' ingested: %d chunks", req.tool_name, len(chunks))

        return {
            "ok": True,
            "tool": req.tool_name,
            "chunks_added": len(chunks),
            "total_chunks": store.get_stats()["total_chunks"],
        }

    @app.post("/api/ingest")
    async def ingest_zip(file: UploadFile = File(...)):
        if not (file.filename or "").endswith(".zip"):
            raise HTTPException(status_code=400, detail="Solo se aceptan archivos .zip")

        tmp_dir = Path(tempfile.mkdtemp())
        tmp_path = tmp_dir / (file.filename or "upload.zip")
        try:
            content = await file.read()
            tmp_path.write_bytes(content)

            before = store.get_stats()["total_chunks"]
            process_zip(tmp_path, config)
            after = store.get_stats()["total_chunks"]

            return {
                "ok": True,
                "zip_name": file.filename,
                "chunks_added": after - before,
            }
        except Exception as exc:
            logger.error("Error ingestando '%s': %s", file.filename, exc)
            raise HTTPException(status_code=500, detail=str(exc))
        finally:
            if tmp_path.exists():
                tmp_path.unlink()
            try:
                tmp_dir.rmdir()
            except OSError:
                pass

    return app
