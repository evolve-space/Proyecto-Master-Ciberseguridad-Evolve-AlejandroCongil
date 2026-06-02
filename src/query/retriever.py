from typing import Dict, List, Optional

from src.store.vectorstore import VectorStore


class Retriever:
    def __init__(self, store: VectorStore):
        self.store = store

    def retrieve(
        self,
        query: str,
        n_results: int = 5,
        category: Optional[str] = None,
        source_type: Optional[str] = None,
        session_date: Optional[str] = None,
    ) -> List[Dict]:
        where: Dict = {}
        filters = []
        if category:
            filters.append({"category": {"$eq": category}})
        if source_type:
            filters.append({"source_type": {"$eq": source_type}})
        if session_date:
            filters.append({"session_date": {"$eq": session_date}})

        if len(filters) == 1:
            where = filters[0]
        elif len(filters) > 1:
            where = {"$and": filters}

        results = self.store.query(
            query_text=query,
            n_results=n_results,
            where=where if where else None,
        )

        chunks = []
        for i, doc in enumerate(results["documents"][0]):
            chunks.append(
                {
                    "text": doc,
                    "metadata": results["metadatas"][0][i],
                    "distance": results["distances"][0][i],
                }
            )
        # Sort by relevance (lower cosine distance = more relevant)
        chunks.sort(key=lambda c: c["distance"])
        return chunks
