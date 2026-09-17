"""Orquestación d'un torn d'oficina (text/veu): pending, agent i persistència."""

from __future__ import annotations

from typing import Any

from django.db.models import Q
from django.utils import timezone
from pydantic_ai.exceptions import UsageLimitExceeded

from api.agents.config import resolve_ops_model
from api.models import AdminMemoryNote, AdminMessage
from api.serializers_ops import AdminMemoryNoteSerializer, AdminMessageSerializer


def title_from_message(text: str) -> str:
    cleaned = " ".join((text or "").strip().split())
    if not cleaned:
        return "Nova conversa"
    return cleaned[:72]


def request_dict(data: dict[str, Any] | list[Any]) -> dict[str, Any]:
    """DRF tipa ``request.data`` com ``dict | list``; aquestes vistes esperen objecte JSON."""
    return data if isinstance(data, dict) else {}


def wants_speech(data: dict[str, Any] | list[Any]) -> bool:
    payload = request_dict(data)
    raw = str(payload.get("speak") or payload.get("tts") or "").strip().lower()
    return raw in ("1", "true", "yes", "on")


def user_asked_to_save_note(text: str) -> bool:
    low = (text or "").casefold()
    keys = (
        "desa nota",
        "desar nota",
        "guarda nota",
        "guardar nota",
        "recorda",
        "recordar",
        "desa com a nota",
        "guarda como nota",
        "guardar como nota",
        "pinnea",
        "pinna",
    )
    return any(k in low for k in keys)


def is_chat_confirmation(text: str) -> bool:
    low = " ".join((text or "").casefold().strip().split())
    if not low:
        return False
    exact = {
        "sí",
        "si",
        "yes",
        "ok",
        "vale",
        "confirmo",
        "confirmado",
        "confirmado.",
        "envia",
        "enviar",
        "d'acord",
        "de acuerdo",
        "forward",
        "ok envia",
        "ok, envia",
        "sí envia",
        "si envia",
        "sí, envia",
        "si, envia",
    }
    if low in exact:
        return True
    return low.startswith("confirmo") or low.startswith("sí,") or low.startswith("si,")


def is_chat_cancel(text: str) -> bool:
    low = " ".join((text or "").casefold().strip().split())
    return low in {
        "cancel",
        "cancel·la",
        "cancela",
        "cancelar",
        "no",
        "discard",
        "descarta",
        "mejor no",
        "millor no",
    }


def persist_turn(
    *,
    conv,
    user_msg,
    reply: str,
    source: str,
    speak: bool,
    language: str,
    model,
    notes=None,
    pending=None,
) -> dict[str, Any]:
    assistant_msg = AdminMessage.objects.create(
        conversation=conv,
        role=AdminMessage.Role.ASSISTANT,
        content=reply,
        source=source,
    )
    conv.updated_at = timezone.now()
    conv.save(update_fields=["title", "updated_at", "pending_action"])
    audio_b64 = None
    if speak:
        try:
            from api.agents.ops.voice import synthesize_speech, text_for_tts

            audio_b64 = synthesize_speech(text_for_tts(reply), language=language)
        except Exception:
            audio_b64 = None
    return {
        "conversation_id": conv.id,
        "title": conv.title,
        "user_message": AdminMessageSerializer(user_msg).data,
        "assistant_message": AdminMessageSerializer(assistant_msg).data,
        "notes": AdminMemoryNoteSerializer(notes or [], many=True).data,
        "pending_action": None,  # confirmació només per xat, sense modal
        "via_voice": source == "voice",
        "assistant_audio_base64": audio_b64,
        "model": resolve_ops_model(model) if model is not None else None,
    }


def handle_pending_chat_flow(
    *,
    conv,
    user_msg,
    text: str,
    source: str,
    speak: bool,
    language: str,
    model,
) -> dict[str, Any] | None:
    """Confirmación / cancelación / captura de texto por chat (sin modal ni LLM)."""
    from api.ops_actions import (
        execute_confirmed_action,
        first_incomplete_whatsapp,
        format_pending_preview,
        human_pending_dest,
        pending_action_dict,
        set_item_mensaje,
    )

    pending = pending_action_dict(getattr(conv, "pending_action", None))
    if not pending:
        return None

    if is_chat_cancel(text):
        conv.pending_action = None
        return persist_turn(
            conv=conv,
            user_msg=user_msg,
            reply="Acció cancel·lada. No s'ha enviat res.",
            source=source,
            speak=speak,
            language=language,
            model=model,
        )

    if is_chat_confirmation(text):
        incomplete = first_incomplete_whatsapp(pending)
        if incomplete is not None:
            dest = human_pending_dest(incomplete[1])
            return persist_turn(
                conv=conv,
                user_msg=user_msg,
                reply=(
                    f"Encara falta el text del WhatsApp per a {dest}. "
                    "Escriu el missatge a enviar (una línia) i després digues «sí»."
                ),
                source=source,
                speak=speak,
                language=language,
                model=model,
            )
        reply = execute_confirmed_action(pending, conversation_id=conv.pk)
        conv.pending_action = None
        return persist_turn(
            conv=conv,
            user_msg=user_msg,
            reply=reply,
            source=source,
            speak=speak,
            language=language,
            model=model,
        )

    # Si falta el cos d'algun WhatsApp, el missatge de l'operari és el text a enviar.
    incomplete = first_incomplete_whatsapp(pending)
    if incomplete is not None:
        idx, item = incomplete
        body = (text or "").strip()
        if len(body) >= 2:
            updated = set_item_mensaje(pending, idx, body)
            if updated:
                conv.pending_action = updated
                dest = human_pending_dest(item)
                preview = body if len(body) <= 280 else body[:277] + "…"
                still = first_incomplete_whatsapp(updated)
                if still is not None:
                    next_dest = human_pending_dest(still[1])
                    reply = (
                        f"Missatge preparat per a {dest}:\n«{preview}»\n\n"
                        f"Ara escriu el text del WhatsApp per a {next_dest}."
                    )
                else:
                    tail = format_pending_preview(updated)
                    reply = (
                        f"Missatge preparat per a {dest}:\n«{preview}»\n\n"
                        + (tail or "Escriu «sí» per enviar o «cancel·la» per descartar.")
                    )
                return persist_turn(
                    conv=conv,
                    user_msg=user_msg,
                    reply=reply,
                    source=source,
                    speak=speak,
                    language=language,
                    model=model,
                )

    return None


def _coalesce_agent_pending(output) -> dict[str, Any] | None:
    """Uneix pending_action + pending_actions de l'output de l'agent."""
    from api.ops_actions import coalesce_pending_actions, pending_action_dict

    raw_list: list[Any] = []
    multi = getattr(output, "pending_actions", None) or []
    if multi:
        raw_list.extend(list(multi))
    single = getattr(output, "pending_action", None)
    if single is not None:
        raw_list.append(single)
    if not raw_list:
        return None
    # Si només hi ha un pending_action clàssic, manté el dict normalitzat.
    if len(raw_list) == 1:
        return pending_action_dict(raw_list[0])
    return coalesce_pending_actions(raw_list)


def run_ops_turn(
    *,
    conv,
    user,
    text: str,
    language: str,
    source: str = "text",
    speak: bool = False,
    model: str | None = None,
) -> dict[str, Any]:
    user_msg = AdminMessage.objects.create(
        conversation=conv,
        role=AdminMessage.Role.USER,
        content=text,
        source=source,
    )
    if not conv.title:
        conv.title = title_from_message(text)
        conv.save(update_fields=["title", "updated_at"])

    handled = handle_pending_chat_flow(
        conv=conv,
        user_msg=user_msg,
        text=text,
        source=source,
        speak=speak,
        language=language,
        model=model,
    )
    if handled is not None:
        return handled

    history = list(conv.messages.exclude(pk=user_msg.pk).values("role", "content"))

    pinned_qs = (
        AdminMemoryNote.objects.filter(user=user, pinned=True)
        .filter(Q(conversation=conv) | Q(conversation__isnull=True))
        .order_by("-pinned", "-updated_at")[:12]
    )
    memory_notes: list[str] = []
    for n in pinned_qs:
        title = (n.title or "").strip()
        content = (n.content or "").strip()
        if title and content:
            memory_notes.append(content if content.startswith(title) else f"{title}: {content}")
        elif content:
            memory_notes.append(content)
        elif title:
            memory_notes.append(title)
    notes_created = []
    pending = None
    try:
        from api.agents.ops.agent import run_ops_agent
        from api.ops_actions import first_incomplete_whatsapp, format_pending_preview, pending_items

        output = run_ops_agent(
            user_message=text,
            history=history,
            user_id=user.pk,
            conversation_id=conv.pk,
            language=language,
            model=model,
            memory_notes=memory_notes,
            source=source,
        )
        reply = (output.message or "").strip() or "Sense resposta."
        if output.suggested_title and not conv.title:
            conv.title = output.suggested_title.strip()[:200]
        pending = _coalesce_agent_pending(output)
        if pending:
            # Si demanen un salut i no hi ha text, posem un cos per defecte (primer WA sense cos).
            low = (text or "").casefold()
            if any(k in low for k in ("salut", "saludo", "hola", "greeting")):
                incomplete = first_incomplete_whatsapp(pending)
                if incomplete is not None:
                    from api.ops_actions import set_item_mensaje

                    pending = set_item_mensaje(
                        pending,
                        incomplete[0],
                        "Hola! Et saluda CECSA Control de Plagues.",
                    ) or pending
            conv.pending_action = pending
            preview = format_pending_preview(pending)
            if preview:
                reply = f"{reply.rstrip()}\n\n{preview}"
            elif pending_items(pending):
                reply = (
                    f"{reply.rstrip()}\n\n"
                    "Escriu «sí» per confirmar o «cancel·la»."
                )
        else:
            conv.pending_action = None
        if user_asked_to_save_note(text):
            for note_text in output.important_notes or []:
                body = (note_text or "").strip()
                if not body:
                    continue
                note = AdminMemoryNote.objects.create(
                    user=user,
                    conversation=conv,
                    title=body[:80],
                    content=body,
                    pinned=True,
                )
                notes_created.append(note)
    except Exception as exc:
        err = str(exc)
        err_low = err.lower()
        is_usage = (
            isinstance(exc, UsageLimitExceeded)
            or "request_limit" in err_low
            or "usage limit" in err_low
            or "usage_limits" in err_low
            or "tool_calls_limit" in err_low
        )
        if is_usage:
            openwa_related = "openwa" in err_low or "whatsapp" in err_low
            if openwa_related:
                reply = (
                    "No s'ha pogut completar l'acció de WhatsApp (límit de passos amb errors OpenWA). "
                    "Comprova a Coolify que OpenWA està en marxa, sessió ready (QR) i "
                    f"OPENWA_API_URL al hostname intern. Detall: {exc}"
                )
            else:
                reply = (
                    "No s'ha pogut acabar l'acció: massa passos en un sol torn. "
                    "Torna-ho a provar amb una ordre més concreta "
                    "(ex.: «envia WhatsApp a +34… amb aquest text»). "
                    f"Detall: {exc}"
                )
        elif "openwa" in err_low or "whatsapp" in err_low:
            reply = (
                "No s'ha pogut completar l'acció de WhatsApp. "
                "Comprova a Coolify que OpenWA està en marxa, amb sessió ready (QR escanejat) "
                f"i OPENWA_API_URL al hostname intern. Detall: {exc}"
            )
        else:
            reply = (
                f"No s'ha pogut completar la petició ({exc}). "
                "Revisa la clau d'OpenAI o torna-ho a provar."
            )

    return persist_turn(
        conv=conv,
        user_msg=user_msg,
        reply=reply,
        source=source,
        speak=speak,
        language=language,
        model=model,
        notes=notes_created,
        pending=pending,
    )
