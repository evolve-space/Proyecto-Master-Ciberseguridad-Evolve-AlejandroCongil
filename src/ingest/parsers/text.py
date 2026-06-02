from pathlib import Path


def parse_text(file_path: Path) -> str:
    ext = file_path.suffix.lower()
    if ext in (".txt", ".md"):
        return _read_txt(file_path)
    if ext in (".docx", ".doc"):
        return _read_docx(file_path)
    return ""


def _read_txt(file_path: Path) -> str:
    for encoding in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
        try:
            return file_path.read_text(encoding=encoding)
        except (UnicodeDecodeError, ValueError):
            continue
    return ""


def _read_docx(file_path: Path) -> str:
    try:
        from docx import Document  # python-docx
        doc = Document(str(file_path))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception:
        return _read_txt(file_path)
