"""Cola persistente de acciones ops confirmadas.

Al confirmar un lote se crean OpsJob y se ejecutan en serie (sin pausa).
Cada ítem deja un mensaje en el chat; al final, un resumen.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any

from django.utils import timezone

from api.models import AdminMessage, OpsJob
from api.ops_actions import execute_confirmed_action, pending_items


def _idem_key(conversation_id: int, item: dict[str, Any]) -> str:
    blob = json.dumps(item, ensure_ascii=False, sort_keys=True, default=str)
    digest = hashlib.sha1(blob.encode("utf-8")).hexdigest()[:20]
    return f"ops:{conversation_id}:{digest}"


def _looks_failed(result: str) -> bool:
    low = (result or "").casefold()
    return (
        "no enviat" in low
        or "no s'ha enviat" in low
        or low.startswith("error ")
        or "deshabilitat" in low
        or "falt" in low
        or "no vàlid" in low
        or "no valid" in low
    )


def enqueue_confirmed_items(*, conversation, user, action: Any) -> list[OpsJob]:
    """Crea jobs en cola (idempotentes) a partir de una acción o lote confirmado."""
    items = pending_items(action)
    created: list[OpsJob] = []
    for index, item in enumerate(items):
        key = _idem_key(conversation.pk, item)
        job, was_created = OpsJob.objects.get_or_create(
            idempotency_key=key,
            defaults={
                "conversation": conversation,
                "user": user,
                "kind": item.get("kind") or "",
                "summary": (item.get("summary") or "")[:500],
                "payload": item,
                "position": index,
                "status": OpsJob.Status.QUEUED,
            },
        )
        if was_created:
            created.append(job)
        elif job.status == OpsJob.Status.FAILED:
            job.status = OpsJob.Status.QUEUED
            job.result = ""
            job.started_at = None
            job.finished_at = None
            job.save(update_fields=["status", "result", "started_at", "finished_at"])
            created.append(job)
    return created


def process_queued_jobs(*, conversation=None, limit: int = 20, post_feedback: bool = False) -> list[OpsJob]:
    """Ejecuta jobs queued en orden. Si post_feedback, deja un mensaje por ítem (worker)."""
    qs = OpsJob.objects.filter(status=OpsJob.Status.QUEUED).order_by("conversation_id", "position", "id")
    if conversation is not None:
        qs = qs.filter(conversation=conversation)
    jobs = list(qs[:limit])
    done: list[OpsJob] = []
    for job in jobs:
        job.status = OpsJob.Status.RUNNING
        job.started_at = timezone.now()
        job.save(update_fields=["status", "started_at"])
        try:
            result = execute_confirmed_action(job.payload, conversation_id=job.conversation_id)
            job.result = (result or "")[:4000]
            job.status = OpsJob.Status.FAILED if _looks_failed(job.result) else OpsJob.Status.DONE
        except Exception as exc:
            job.result = f"Error: {exc}"[:4000]
            job.status = OpsJob.Status.FAILED
        job.finished_at = timezone.now()
        job.save(update_fields=["status", "result", "finished_at"])
        if post_feedback:
            AdminMessage.objects.create(
                conversation=job.conversation,
                role=AdminMessage.Role.ASSISTANT,
                content=f"[{job.position + 1}] {job.summary or job.kind}: {job.result}",
                source="queue",
            )
        done.append(job)
    return done


def run_confirmed_queue(*, conversation, user, action: Any) -> str:
    """Encola el lote confirmado, lo ejecuta sin pausa y devuelve el resumen para el chat."""
    enqueue_confirmed_items(conversation=conversation, user=user, action=action)
    processed = process_queued_jobs(conversation=conversation, limit=50, post_feedback=False)
    conversation.pending_action = None
    conversation.save(update_fields=["pending_action", "updated_at"])
    if not processed:
        return "No hi havia tasques noves a la cua (ja executades o buides)."
    ok = sum(1 for job in processed if job.status == OpsJob.Status.DONE)
    lines = [f"Cua completada: {ok}/{len(processed)} correctes."]
    for job in processed:
        mark = "OK" if job.status == OpsJob.Status.DONE else "ERROR"
        lines.append(f"- {mark} {job.summary or job.kind}: {job.result}")
    return "\n".join(lines)
