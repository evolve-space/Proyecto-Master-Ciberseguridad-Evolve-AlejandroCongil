import sys, io
sys.path.insert(0, '.')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from src.store.vectorstore import VectorStore
from src.query.retriever import Retriever
import yaml
from pathlib import Path

cfg = yaml.safe_load(Path('config/settings.yaml').read_text(encoding='utf-8'))
store = VectorStore(db_path=cfg['paths']['chroma_db'], collection_name=cfg['chromadb']['collection_name'])
retriever = Retriever(store)

queries = [
    "como correlacionar herramientas OSINT para investigar un objetivo",
    "roadmap herramientas reconocimiento repositorio github",
    "que herramientas tengo para investigar un dominio o correo",
]

for q in queries:
    print(f"\n{'='*60}")
    print(f"QUERY: {q}")
    print('='*60)
    results = retriever.retrieve(q, n_results=3)
    for i, chunk in enumerate(results):
        meta = chunk['metadata']
        print(f"\n[{i+1}] source={meta['source_type']} | date={meta['session_date']} | dist={chunk['distance']:.3f}")
        print(chunk['text'][:350])
        print('...')
