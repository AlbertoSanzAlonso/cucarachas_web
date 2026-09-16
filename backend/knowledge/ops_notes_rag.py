"""Notas globales del admin → TechnicalKnowledge (audience=ops).

Solo notas pinneadas SIN conversación. Las de hilo quedan en el prompt, no en vectores.
"""

from __future__ import annotations

from knowledge.models import TechnicalKnowledge
from knowledge.sync import delete_knowledge, upsert_knowledge


def admin_note_source_key(note_id: int) -> str:
    return f"ops:note:{int(note_id)}"


def should_index_admin_note(note) -> bool:
    """Global + pinned + con contenido."""
    if note is None:
        return False
    if getattr(note, "conversation_id", None):
        return False
    if not getattr(note, "pinned", False):
        return False
    title = (getattr(note, "title", None) or "").strip()
    content = (getattr(note, "content", None) or "").strip()
    return bool(title or content)


def sync_admin_note_to_rag(note) -> TechnicalKnowledge | None:
    """Upsert o borra el chunk según reglas globales."""
    key = admin_note_source_key(note.pk)
    if not should_index_admin_note(note):
        delete_knowledge(key)
        return None

    title = (note.title or "").strip() or f"Instrucció admin #{note.pk}"
    body = (note.content or "").strip() or title
    content = (
        "Instrucció operativa guardada per l'admin (nota global / RAG):\n"
        f"Títol: {title}\n"
        f"Contingut:\n{body}"
    )
    return upsert_knowledge(
        source_key=key,
        title=f"Nota admin: {title}"[:255],
        content=content,
        category=TechnicalKnowledge.Category.OPS_FAQ,
        source=f"admin_note/{note.pk}",
        audience=TechnicalKnowledge.Audience.OPS,
    )


def delete_admin_note_from_rag(note_id: int) -> int:
    return delete_knowledge(admin_note_source_key(note_id))
