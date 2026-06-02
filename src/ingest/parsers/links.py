"""
Parser for RECURSOS COMPARTIDOS/ text files.
Extracts GitHub tool links and their surrounding description context.
"""
import re
from pathlib import Path


_GITHUB_RE = re.compile(r"https?://github\.com/[\w.\-]+/[\w.\-]+\S*")


def parse_links(file_path: Path) -> str:
    text = _read_text(file_path)
    if not text:
        return ""

    output_lines: list[str] = []

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue

        urls = _GITHUB_RE.findall(line)
        if not urls:
            output_lines.append(line)
            continue

        for url in urls:
            url_clean = url.rstrip("/.,;)")
            parts = url_clean.rstrip("/").split("/")
            if len(parts) >= 5:
                author = parts[3]
                repo = parts[4]
                description = line.replace(url, "").strip(" -:–|")
                output_lines.append(f"Herramienta: {repo} (autor: {author})")
                output_lines.append(f"URL: {url_clean}")
                if description:
                    output_lines.append(f"Descripción: {description}")
                output_lines.append("")

    return "\n".join(output_lines)


def _read_text(file_path: Path) -> str:
    for enc in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
        try:
            return file_path.read_text(encoding=enc)
        except (UnicodeDecodeError, ValueError):
            continue
    return ""
