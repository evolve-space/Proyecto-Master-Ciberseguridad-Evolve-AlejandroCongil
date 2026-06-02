import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from src.store.vectorstore import VectorStore
import yaml
from pathlib import Path

cfg = yaml.safe_load(Path('config/settings.yaml').read_text(encoding='utf-8'))
store = VectorStore(db_path=cfg['paths']['chroma_db'], collection_name=cfg['chromadb']['collection_name'])

results = store.collection.get(
    where={"$and": [{"session_date": {"$eq": "2026-04-29"}}, {"source_type": {"$eq": "notes"}}]},
    include=['documents','metadatas']
)
for doc, meta in zip(results['documents'], results['metadatas']):
    print(f"[{meta['file_name']}]")
    print(doc[:800])
    print('---')
