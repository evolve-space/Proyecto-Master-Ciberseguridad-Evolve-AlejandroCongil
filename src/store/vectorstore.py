import logging
from typing import Dict, List, Optional

import chromadb

logger = logging.getLogger(__name__)


class VectorStore:
    def __init__(self, db_path: str, collection_name: str = "cybersec_knowledge"):
        self.client = chromadb.PersistentClient(path=db_path)
        # ChromaDB uses its built-in ONNX embedding model by default (no external calls)
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            "Colección '%s' lista — %d fragmentos existentes",
            collection_name,
            self.collection.count(),
        )

    def add_chunks(
        self,
        chunks: List[str],
        metadatas: List[Dict],
        ids: List[str],
    ) -> None:
        if not chunks:
            return
        # Sanitise: ChromaDB requires all metadata values to be str/int/float/bool
        clean_meta = [_sanitise_metadata(m) for m in metadatas]
        self.collection.add(documents=chunks, metadatas=clean_meta, ids=ids)

    def query(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[Dict] = None,
    ) -> Dict:
        # Guard against querying an empty collection
        total = self.collection.count()
        if total == 0:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

        n = min(n_results, total)
        kwargs: Dict = {
            "query_texts": [query_text],
            "n_results": n,
            "include": ["documents", "metadatas", "distances"],
        }
        if where:
            kwargs["where"] = where
        return self.collection.query(**kwargs)

    def get_stats(self) -> Dict:
        count = self.collection.count()
        sessions: set = set()
        categories: Dict[str, int] = {}

        if count > 0:
            results = self.collection.get(include=["metadatas"])
            for meta in results["metadatas"]:
                date = meta.get("session_date", "")
                if date:
                    sessions.add(date)
                cat = meta.get("category", "")
                if cat:
                    categories[cat] = categories.get(cat, 0) + 1

        return {
            "total_chunks": count,
            "total_sessions": len(sessions),
            "categories": categories,
            "collection_name": self.collection.name,
        }


def _sanitise_metadata(meta: Dict) -> Dict:
    clean = {}
    for k, v in meta.items():
        if isinstance(v, (str, int, float, bool)):
            clean[k] = v
        else:
            clean[k] = str(v)
    return clean
