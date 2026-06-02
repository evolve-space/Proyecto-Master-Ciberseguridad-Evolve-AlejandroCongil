from typing import List


def chunk_text(text: str, chunk_size: int = 1500, overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks, breaking on natural boundaries.
    Handles both paragraph-style text (\n\n) and line-by-line transcripts (\n).
    chunk_size and overlap are measured in characters.
    """
    # Try double newlines first (proper paragraphs)
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    # Otter.ai transcripts use single newlines — fall back when double-newline
    # splitting gives too few pieces for the amount of text
    if len(paragraphs) <= 2 and len(text) > chunk_size:
        paragraphs = [s.strip() for s in text.split("\n") if s.strip()]

    # Last resort: character-based split (no natural breaks at all)
    if not paragraphs or (len(paragraphs) == 1 and len(text) > chunk_size):
        return _char_split(text, chunk_size, overlap)

    chunks: List[str] = []
    current: List[str] = []
    current_size = 0

    for para in paragraphs:
        para_size = len(para)

        if current_size + para_size > chunk_size and current:
            chunks.append("\n".join(current))

            # Carry over the last few lines as overlap
            overlap_parts: List[str] = []
            overlap_acc = 0
            for p in reversed(current):
                if overlap_acc + len(p) <= overlap:
                    overlap_parts.insert(0, p)
                    overlap_acc += len(p)
                else:
                    break
            current = overlap_parts
            current_size = overlap_acc

        current.append(para)
        current_size += para_size

    if current:
        chunks.append("\n".join(current))

    return chunks if chunks else [text]


def _char_split(text: str, chunk_size: int, overlap: int) -> List[str]:
    """Pure character-based fallback for texts with no line breaks."""
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start += chunk_size - overlap
    return chunks
