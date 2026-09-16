"""Sincronización del corpus operativo (oficina / iGEO) → TechnicalKnowledge.

audience=ops. No indexa PII ni filas del espejo iGEO.
"""

from __future__ import annotations

import hashlib
import re
from pathlib import Path
from typing import Callable

from knowledge.models import TechnicalKnowledge
from knowledge.sync import set_skip_embeddings, upsert_knowledge

# Repo root: backend/knowledge/ops_sync.py → parents[2]
_BACKEND_DIR = Path(__file__).resolve().parents[1]
_REPO_ROOT = _BACKEND_DIR.parent
_OPS_CORPUS_DIR = Path(__file__).resolve().parent / "ops_corpus"
_SKILL_DIR = _REPO_ROOT / ".agents" / "skills" / "igeo_pdi"

# ~800–1200 tokens ≈ 2800–4200 chars; usamos ~3200 con overlap.
_CHUNK_SIZE = 3200
_CHUNK_OVERLAP = 400

ProgressCb = Callable[[str, str], None] | None


def _slug(text: str, max_len: int = 80) -> str:
    raw = (text or "").strip().lower()
    raw = re.sub(r"[^a-z0-9àèéíïòóúüç\-_\s]+", "", raw, flags=re.I)
    raw = re.sub(r"[\s_]+", "-", raw).strip("-")
    return (raw or "chunk")[:max_len]


def _chunk_text(text: str, *, size: int = _CHUNK_SIZE, overlap: int = _CHUNK_OVERLAP) -> list[str]:
    body = (text or "").strip()
    if not body:
        return []
    if len(body) <= size:
        return [body]
    chunks: list[str] = []
    start = 0
    while start < len(body):
        end = min(start + size, len(body))
        # Preferir corte en párrafo
        if end < len(body):
            cut = body.rfind("\n\n", start + size // 2, end)
            if cut == -1:
                cut = body.rfind("\n", start + size // 2, end)
            if cut > start:
                end = cut
        piece = body[start:end].strip()
        if piece:
            chunks.append(piece)
        if end >= len(body):
            break
        start = max(end - overlap, start + 1)
    return chunks


def _split_markdown_sections(text: str) -> list[tuple[str, str]]:
    """Divide por encabezados # / ##. Devuelve (título, cuerpo)."""
    lines = (text or "").splitlines()
    sections: list[tuple[str, str]] = []
    title = "Document"
    buf: list[str] = []
    for line in lines:
        if re.match(r"^#{1,3}\s+", line):
            if buf:
                sections.append((title, "\n".join(buf).strip()))
            title = re.sub(r"^#{1,3}\s+", "", line).strip() or title
            buf = [line]
        else:
            buf.append(line)
    if buf:
        sections.append((title, "\n".join(buf).strip()))
    return [(t, c) for t, c in sections if c]


def _upsert_chunks(
    *,
    prefix: str,
    title_base: str,
    body: str,
    category: str,
    source: str,
    on_progress: ProgressCb = None,
) -> int:
    count = 0
    sections = _split_markdown_sections(body) if body.lstrip().startswith("#") else [(title_base, body)]
    for sec_title, sec_body in sections:
        pieces = _chunk_text(sec_body)
        for i, piece in enumerate(pieces):
            digest = hashlib.sha1(piece.encode("utf-8")).hexdigest()[:10]
            key = f"{prefix}:{_slug(sec_title)}:{i}:{digest}"[:180]
            title = f"{title_base}: {sec_title}" if sec_title != title_base else title_base
            if len(pieces) > 1:
                title = f"{title} ({i + 1}/{len(pieces)})"
            upsert_knowledge(
                source_key=key,
                title=title[:255],
                content=piece,
                category=category,
                source=source,
                audience=TechnicalKnowledge.Audience.OPS,
            )
            count += 1
            if on_progress:
                on_progress(category, key)
    return count


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def _find_pdi_pdf() -> Path | None:
    patterns = (
        "Import Export Programmers Guide PDI*.pdf",
        "*PDI*English*.pdf",
        "*Programmers*Guide*PDI*.pdf",
    )
    for pat in patterns:
        matches = sorted(_REPO_ROOT.glob(pat))
        if matches:
            return matches[0]
    return None


def _extract_pdf_text(path: Path) -> str:
    """Extrae texto del PDF PDI. Intenta pypdf; si falla, cadena vacía."""
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader  # type: ignore
        except ImportError:
            print("WARNING: pypdf/PyPDF2 no instalado; se omite el PDF PDI.")
            return ""

    try:
        reader = PdfReader(str(path))
        parts: list[str] = []
        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text() or ""
            except Exception:
                text = ""
            text = text.strip()
            if text:
                parts.append(f"## Página {i + 1}\n\n{text}")
        return "\n\n".join(parts)
    except Exception as exc:
        print(f"WARNING: no se pudo leer PDF PDI ({path.name}): {exc}")
        return ""


def sync_ops_corpus_markdown(*, dry_run: bool = False, on_progress: ProgressCb = None) -> int:
    if not _OPS_CORPUS_DIR.is_dir():
        return 0
    n = 0
    for path in sorted(_OPS_CORPUS_DIR.glob("*.md")):
        body = _read_text(path)
        if dry_run:
            n += max(1, len(_chunk_text(body)))
            continue
        stem = path.stem
        cat = TechnicalKnowledge.Category.OPS_SOP
        if "maestro" in stem or "campos" in stem or "payload" in stem:
            cat = TechnicalKnowledge.Category.OPS_MAESTRO
        elif "faq" in stem or "ack" in stem or "error" in stem:
            cat = TechnicalKnowledge.Category.OPS_FAQ
        elif "pdi" in stem or "cola" in stem:
            cat = TechnicalKnowledge.Category.IGEO_PDI
        n += _upsert_chunks(
            prefix=f"ops:sop:{stem}",
            title_base=stem.replace("_", " ").title(),
            body=body,
            category=cat,
            source=f"ops_corpus/{path.name}",
            on_progress=on_progress,
        )
    return n


def sync_ops_skills(*, dry_run: bool = False, on_progress: ProgressCb = None) -> int:
    files = [
        (_SKILL_DIR / "SKILL.md", "igeo_pdi_skill", TechnicalKnowledge.Category.IGEO_PDI),
        (
            _SKILL_DIR / "plan_asistente_admin.md",
            "plan_asistente_admin",
            TechnicalKnowledge.Category.OPS_SOP,
        ),
    ]
    n = 0
    for path, slug, cat in files:
        if not path.is_file():
            continue
        body = _read_text(path)
        if dry_run:
            n += max(1, len(_chunk_text(body)))
            continue
        n += _upsert_chunks(
            prefix=f"ops:skill:{slug}",
            title_base=slug.replace("_", " "),
            body=body,
            category=cat,
            source=str(path.relative_to(_REPO_ROOT)),
            on_progress=on_progress,
        )
    return n


def sync_ops_pdi_pdf(*, dry_run: bool = False, on_progress: ProgressCb = None) -> int:
    pdf = _find_pdi_pdf()
    if not pdf:
        print("WARNING: PDF PDI no encontrado en la raíz del repo.")
        return 0
    text = _extract_pdf_text(pdf)
    if not text.strip():
        return 0
    if dry_run:
        return max(1, len(_chunk_text(text)))
    return _upsert_chunks(
        prefix="ops:pdi:guide",
        title_base="PDI Import Export Guide",
        body=text,
        category=TechnicalKnowledge.Category.IGEO_PDI,
        source=pdf.name,
        on_progress=on_progress,
    )


def sync_all_ops(
    *,
    dry_run: bool = False,
    skip_embeddings: bool = False,
    skip_pdf: bool = False,
    on_progress: ProgressCb = None,
) -> dict[str, int]:
    set_skip_embeddings(skip_embeddings)
    counts = {
        "ops_corpus": sync_ops_corpus_markdown(dry_run=dry_run, on_progress=on_progress),
        "skills": sync_ops_skills(dry_run=dry_run, on_progress=on_progress),
        "pdi_pdf": 0 if skip_pdf else sync_ops_pdi_pdf(dry_run=dry_run, on_progress=on_progress),
    }
    return counts
