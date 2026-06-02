"""
Synchronous reasoner — used by CLI and one-shot scripts.
The async version lives in web.py (FastAPI streaming endpoint).
"""
from typing import List, Dict

import anthropic

SYSTEM_PROMPT = """\
Eres un asistente especializado en ciberseguridad ofensiva.
Tu función es responder preguntas basándote exclusivamente en el material de estudio proporcionado.
El material proviene de transcripciones de conferencias, notas, mapas mentales y ejercicios prácticos
de un estudiante de un máster en ciberseguridad ofensiva.

Responde siempre en español. Sé técnico y preciso. Cuando cites información, menciona la fuente
(fecha de sesión y tipo de documento). Si no encuentras suficiente información en el contexto,
indícalo explícitamente en lugar de inventar información.\
"""


def reason(query: str, chunks: List[Dict], client: anthropic.Anthropic, model: str) -> str:
    if not chunks:
        return "No se encontraron fragmentos relevantes en la base de conocimiento."

    context = _format_context(chunks)

    response = client.messages.create(
        model=model,
        max_tokens=4096,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": f"CONTEXTO RECUPERADO:\n{context}\n\nPREGUNTA: {query}",
            }
        ],
    )
    return response.content[0].text


def _format_context(chunks: List[Dict]) -> str:
    parts = []
    for i, chunk in enumerate(chunks, 1):
        meta = chunk["metadata"]
        source = (
            f"[Sesión {meta.get('session_date', '?')} | "
            f"{meta.get('source_type', '?')} | "
            f"{meta.get('file_name', '?')}]"
        )
        parts.append(f"--- Fragmento {i} {source} ---\n{chunk['text']}")
    return "\n\n".join(parts)
