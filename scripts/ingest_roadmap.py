import sys, io
sys.path.insert(0, '.')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from src.store.vectorstore import VectorStore
from src.ingest.chunker import chunk_text
import yaml, re
from pathlib import Path
from datetime import datetime

cfg = yaml.safe_load(Path('config/settings.yaml').read_text(encoding='utf-8'))
store = VectorStore(db_path=cfg['paths']['chroma_db'], collection_name=cfg['chromadb']['collection_name'])

text = Path('data/osint_roadmap.txt').read_text(encoding='utf-8')
chunks = chunk_text(text, chunk_size=1500, overlap=200)

session_date = datetime.now().strftime('%Y-%m-%d')
safe_stem = 'osint_roadmap_correlaciones'
source_type = 'methodology'
category = 'methodology'

ids = [f"{session_date}__{safe_stem}__{i}" for i in range(len(chunks))]
metas = [
    {
        'session_date': session_date,
        'zip_name': 'manual_ingest',
        'source_type': source_type,
        'category': category,
        'file_name': 'osint_roadmap.txt',
        'chunk_index': i,
        'total_chunks': len(chunks),
        'tool_name': '',
        'attack_phase': 'reconnaissance',
        'platform': '',
    }
    for i in range(len(chunks))
]

store.add_chunks(chunks, metas, ids)
print(f"[OK] {len(chunks)} fragmentos ingresados con source_type='{source_type}'")
print(f"     session_date={session_date}, attack_phase=reconnaissance")
stats = store.get_stats()
print(f"     Total en ChromaDB: {stats['total_chunks']} fragmentos")
