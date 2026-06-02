"""
Native XMind parser.
.xmind files are ZIP archives. Modern versions store the map in content.json;
older versions use content.xml. Both formats are handled here.
"""
import json
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


def parse_xmind(file_path: Path) -> str:
    try:
        with zipfile.ZipFile(file_path, "r") as zf:
            names = zf.namelist()
            if "content.json" in names:
                return _parse_json(zf)
            if "content.xml" in names:
                return _parse_xml(zf)
    except Exception as exc:
        return f"[Error parseando XMind: {exc}]"
    return ""


# ── JSON format (XMind 2020+) ────────────────────────────────────────────────

def _parse_json(zf: zipfile.ZipFile) -> str:
    with zf.open("content.json") as f:
        data = json.load(f)

    lines: list[str] = []
    for sheet in data:
        title = sheet.get("title", "Mapa Mental")
        lines.append(f"=== {title} ===")
        root = sheet.get("rootTopic", {})
        _traverse_json(root, lines, level=0)
        lines.append("")
    return "\n".join(lines)


def _traverse_json(topic: dict, lines: list, level: int) -> None:
    title = (topic.get("title") or "").strip()
    if not title:
        return

    indent = "  " * level
    prefix = "◆ " if level == 0 else "▸ " if level == 1 else "• " if level == 2 else "  – "
    lines.append(f"{indent}{prefix}{title}")

    # Inline notes
    note_content = (
        topic.get("notes", {})
        .get("plain", {})
        .get("content", "")
        .strip()
    )
    if note_content:
        lines.append(f"{indent}  [Nota: {note_content}]")

    for child in topic.get("children", {}).get("attached", []):
        _traverse_json(child, lines, level + 1)


# ── XML format (XMind legacy) ────────────────────────────────────────────────

def _parse_xml(zf: zipfile.ZipFile) -> str:
    with zf.open("content.xml") as f:
        raw = f.read()

    root = ET.fromstring(raw)
    lines: list[str] = []

    for element in root.iter():
        local = _local(element.tag)
        if local == "sheet":
            _process_sheet(element, lines)

    return "\n".join(lines)


def _process_sheet(sheet_el: ET.Element, lines: list) -> None:
    title_el = _find_first(sheet_el, "title")
    sheet_title = (title_el.text or "Mapa Mental") if title_el is not None else "Mapa Mental"
    lines.append(f"=== {sheet_title} ===")

    root_topic = _find_first(sheet_el, "topic")
    if root_topic is not None:
        _traverse_xml(root_topic, lines, level=0)
    lines.append("")


def _traverse_xml(element: ET.Element, lines: list, level: int) -> None:
    if _local(element.tag) != "topic":
        return

    title_el = _find_first(element, "title")
    title = (title_el.text or "").strip() if title_el is not None else ""

    if title:
        indent = "  " * level
        prefix = "◆ " if level == 0 else "▸ " if level == 1 else "• " if level == 2 else "  – "
        lines.append(f"{indent}{prefix}{title}")

    for child in element:
        if _local(child.tag) == "children":
            for topic_child in child:
                _traverse_xml(topic_child, lines, level + 1)
        elif _local(child.tag) == "topic":
            _traverse_xml(child, lines, level + 1)


def _local(tag: str) -> str:
    """Strip XML namespace from a tag."""
    return tag.split("}")[-1] if "}" in tag else tag


def _find_first(element: ET.Element, local_name: str):
    for child in element:
        if _local(child.tag) == local_name:
            return child
    return None
