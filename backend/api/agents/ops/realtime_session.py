"""Sesión OpenAI Realtime (voz tipo ChatGPT) para el asistente de oficina.

El navegador habla por WebRTC con una clave efímera; las tools se ejecutan
en Django (nunca send_* directo: pending + confirm).
"""

from __future__ import annotations

import hashlib
import json
import os
from typing import Any

import requests

from api.igeo.config import get_igeo_settings, is_igeo_enabled
from api.igeo.ingest import format_mirror_hits, mirror_counts, search_mirror
from api.openwa import OpenWaClient, OpenWaError, format_contacts, is_openwa_enabled, status_summary
from api.ops_actions import (
    execute_confirmed_action,
    human_pending_dest,
    pending_action_dict,
)
from api.ops_email import email_status_summary, is_smtp_ready

REALTIME_MODEL = os.getenv("OPS_REALTIME_MODEL", "gpt-realtime")
REALTIME_VOICE = os.getenv("OPS_REALTIME_VOICE", "marin")
CLIENT_SECRETS_URL = "https://api.openai.com/v1/realtime/client_secrets"


class RealtimeSessionError(ValueError):
    pass


def _instructions(language: str = "ca") -> str:
    lang = (language or "ca").strip().lower()
    igeo_on = "actiu" if is_igeo_enabled() else "desactivat"
    wa_on = "actiu" if is_openwa_enabled() else "desactivat"
    mail_on = "actiu" if is_smtp_ready() else "desactivat"
    if lang.startswith("es"):
        return (
            "Eres el asistente administrativo interno de CECSA Control de Plagas. "
            "Hablas por voz con personal de oficina, NUNCA con el cliente final. "
            "Sé breve (1–3 frases), operativo y claro. "
            "FRENO: NUNCA envíes WhatsApp, email ni leads sin confirmación. "
            "Usa prepare_whatsapp / prepare_email / prepare_igeo_lead y pide que digan «sí». "
            "Cuando digan sí/vale/confirmo → confirm_pending_action. "
            "cancel·la/no → cancel_pending_action. "
            "PRIVACIDAD: habla solo con nombre y teléfono (+…). "
            "NUNCA digas @lid, @c.us ni ids técnicos. "
            f"WhatsApp={wa_on}. Email={mail_on}. iGEO={igeo_on}. "
            "Para WhatsApp por nombre: search_whatsapp_contacts y luego prepare_whatsapp "
            "con telefono=REF_INTERNA (id) y nombre humano. "
            "Datos de clientes → CRM o espejo iGEO, no inventes."
        )
    return (
        "Ets l'assistent administratiu intern de CECSA Control de Plagues. "
        "Parles per veu amb personal d'oficina, MAI amb el client final. "
        "Sigues breu (1–3 frases), operatiu i clar. "
        "FRE: MAI enviïs WhatsApp, email ni leads sense confirmació. "
        "Fes servir prepare_whatsapp / prepare_email / prepare_igeo_lead i demana «sí». "
        "Quan diguin sí/d'acord/confirmo → confirm_pending_action. "
        "cancel·la/no → cancel_pending_action. "
        "UX: parla només amb nom i telèfon (+…). "
        "MAI diguis @lid, @c.us ni ids tècnics. "
        f"WhatsApp={wa_on}. Email={mail_on}. iGEO={igeo_on}. "
        "Per WhatsApp per nom: search_whatsapp_contacts i després prepare_whatsapp "
        "amb telefono=REF_INTERNA (id) i nombre humà. "
        "Dades de clients → CRM o espill iGEO, no inventis."
    )


def _tool(name: str, description: str, properties: dict, required: list[str] | None = None) -> dict:
    props = dict(properties)
    req = list(required or [])
    return {
        "type": "function",
        "name": name,
        "description": description,
        "parameters": {
            "type": "object",
            "strict": True,
            "properties": props,
            "required": req,
            "additionalProperties": False,
        },
    }


def realtime_tools_schema() -> list[dict]:
    """Schemas de tools para la sesión Realtime (sin send_*)."""
    empty = {
        "type": "object",
        "strict": True,
        "properties": {},
        "required": [],
        "additionalProperties": False,
    }
    return [
        _tool(
            "search_ops_knowledge",
            "Cerca procediments interns (PDI, SOPs, iGEO). No substitueix clients.",
            {
                "query": {"type": "string", "description": "Consulta"},
                "category": {"type": "string", "description": "Categoria opcional"},
            },
            ["query", "category"],
        ),
        _tool(
            "search_crm_cliente",
            "Busca clients/leads al CRM per nom, telèfon o email.",
            {"query": {"type": "string"}},
            ["query"],
        ),
        _tool(
            "search_igeo_espejo",
            "Busca a l'espill local iGEO (clients, seus, OT…).",
            {
                "query": {"type": "string"},
                "tipo_entidad": {"type": "string", "description": "Tipus opcional"},
            },
            ["query", "tipo_entidad"],
        ),
        {
            "type": "function",
            "name": "igeo_espejo_status",
            "description": "Comptadors de l'espill iGEO.",
            "parameters": empty,
        },
        {
            "type": "function",
            "name": "igeo_status",
            "description": "Estat connexió PDI iGEO (sense secrets).",
            "parameters": empty,
        },
        {
            "type": "function",
            "name": "whatsapp_status",
            "description": "Estat OpenWA / WhatsApp.",
            "parameters": empty,
        },
        _tool(
            "search_whatsapp_contacts",
            "Cerca contactes WhatsApp (xats recents + agenda). deep=true només si cal.",
            {
                "query": {"type": "string"},
                "deep": {"type": "boolean"},
            },
            ["query", "deep"],
        ),
        {
            "type": "function",
            "name": "email_status",
            "description": "Estat SMTP del correu d'oficina.",
            "parameters": empty,
        },
        _tool(
            "prepare_whatsapp",
            "Prepara un WhatsApp pendent de confirmació verbal («sí»). "
            "telefono = REF_INTERNA/id o mòbil; nombre = nom humà. "
            "NO enviïs encara.",
            {
                "telefono": {"type": "string"},
                "nombre": {"type": "string"},
                "mensaje": {"type": "string"},
                "summary": {"type": "string"},
            },
            ["telefono", "nombre", "mensaje", "summary"],
        ),
        _tool(
            "prepare_email",
            "Prepara un email pendent de confirmació («sí»). NO enviïs encara.",
            {
                "to_email": {"type": "string"},
                "subject": {"type": "string"},
                "body": {"type": "string"},
                "cc": {"type": "string"},
                "summary": {"type": "string"},
            },
            ["to_email", "subject", "body", "cc", "summary"],
        ),
        _tool(
            "prepare_igeo_lead",
            "Prepara un lead iGEO pendent de confirmació («sí»).",
            {
                "nombre": {"type": "string"},
                "telefono": {"type": "string"},
                "email": {"type": "string"},
                "direccion": {"type": "string"},
                "observaciones": {"type": "string"},
                "summary": {"type": "string"},
            },
            ["nombre", "telefono", "email", "direccion", "observaciones", "summary"],
        ),
        {
            "type": "function",
            "name": "confirm_pending_action",
            "description": "Executa l'acció pendent quan l'operari confirma («sí»).",
            "parameters": empty,
        },
        {
            "type": "function",
            "name": "cancel_pending_action",
            "description": "Cancel·la l'acció pendent sense enviar res.",
            "parameters": empty,
        },
    ]


def build_session_config(*, language: str = "ca") -> dict[str, Any]:
    return {
        "session": {
            "type": "realtime",
            "model": REALTIME_MODEL,
            "instructions": _instructions(language),
            "audio": {
                "input": {
                    "transcription": {"model": "gpt-4o-mini-transcribe"},
                    "turn_detection": {"type": "server_vad"},
                },
                "output": {"voice": REALTIME_VOICE},
            },
            "tools": realtime_tools_schema(),
            "tool_choice": "auto",
        }
    }


def safety_identifier_for_user(user_id: int) -> str:
    raw = f"cecsa-ops-{user_id}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:64]


def create_ephemeral_client_secret(*, language: str = "ca", user_id: int | None = None) -> dict[str, Any]:
    """Mint ephemeral key via OpenAI. Never returns the master OPENAI_API_KEY."""
    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        raise RealtimeSessionError("Falta OPENAI_API_KEY per al mode veu Realtime.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if user_id is not None:
        headers["OpenAI-Safety-Identifier"] = safety_identifier_for_user(user_id)

    payload = build_session_config(language=language)
    try:
        resp = requests.post(CLIENT_SECRETS_URL, headers=headers, json=payload, timeout=30)
    except requests.RequestException as exc:
        raise RealtimeSessionError(f"No s'ha pogut contactar OpenAI Realtime: {exc}") from exc

    data = {}
    try:
        data = resp.json() if resp.content else {}
    except Exception:
        data = {"raw": (resp.text or "")[:500]}

    if resp.status_code >= 400:
        detail = data.get("error", data) if isinstance(data, dict) else data
        raise RealtimeSessionError(f"OpenAI client_secrets HTTP {resp.status_code}: {detail}")

    # GA: { "value": "ek_…", "expires_at": … } o nested { "client_secret": { "value": … } }
    value = data.get("value")
    expires_at = data.get("expires_at")
    if not value and isinstance(data.get("client_secret"), dict):
        value = data["client_secret"].get("value")
        expires_at = data["client_secret"].get("expires_at") or expires_at
    if not value:
        raise RealtimeSessionError(f"Resposta client_secrets sense clau efímera: {data}")

    return {
        "client_secret": value,
        "expires_at": expires_at,
        "model": REALTIME_MODEL,
        "voice": REALTIME_VOICE,
    }


def _parse_args(arguments: Any) -> dict[str, Any]:
    if arguments is None:
        return {}
    if isinstance(arguments, dict):
        return arguments
    if isinstance(arguments, str):
        raw = arguments.strip()
        if not raw:
            return {}
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return {}
        return parsed if isinstance(parsed, dict) else {}
    return {}


def execute_realtime_tool(
    name: str,
    arguments: Any,
    *,
    conversation,
) -> str:
    """Ejecuta una tool Realtime y devuelve texto para function_call_output."""
    tool = (name or "").strip()
    args = _parse_args(arguments)

    if tool == "search_ops_knowledge":
        from knowledge.retriever import retrieve_ops_knowledge

        q = str(args.get("query") or "").strip()
        if len(q) < 3:
            return "Cal una consulta d'almenys 3 caràcters."
        cat = str(args.get("category") or "").strip() or None
        return retrieve_ops_knowledge(q, limit=5, category=cat)

    if tool == "search_crm_cliente":
        from api.agents.ops.agent import lookup_crm_clientes

        return lookup_crm_clientes(str(args.get("query") or ""))

    if tool == "search_igeo_espejo":
        rows = search_mirror(
            str(args.get("query") or ""),
            entity_type=str(args.get("tipo_entidad") or "") or None,
        )
        return format_mirror_hits(rows)

    if tool == "igeo_espejo_status":
        return mirror_counts()

    if tool == "igeo_status":
        s = get_igeo_settings()
        return (
            f"enabled={s.enabled} dry_run={s.dry_run} credentials={s.credentials_ready} "
            f"host={s.host or '—'} vhost={s.vhost or '—'} "
            f"delegacion={s.default_delegacion or '—'} gestor={s.default_gestor or '—'}"
        )

    if tool == "whatsapp_status":
        return status_summary()

    if tool == "search_whatsapp_contacts":
        q = str(args.get("query") or "").strip()
        deep = bool(args.get("deep"))
        try:
            hits = OpenWaClient().search_contacts(q, deep=deep)
        except OpenWaError as exc:
            return f"OpenWA: {exc}"
        except Exception as exc:
            return f"Error OpenWA: {exc}"
        return format_contacts(hits)

    if tool == "email_status":
        return email_status_summary()

    if tool == "prepare_whatsapp":
        telefono = str(args.get("telefono") or "").strip()
        nombre = str(args.get("nombre") or "").strip()
        mensaje = str(args.get("mensaje") or "").strip()
        summary = str(args.get("summary") or "").strip()
        if not telefono:
            return "Cal telefono (REF_INTERNA o mòbil) per preparar el WhatsApp."
        dest_label = human_pending_dest(
            {"telefono": telefono, "nombre": nombre, "summary": summary}
        )
        pending = pending_action_dict(
            {
                "kind": "whatsapp",
                "summary": summary or f"WhatsApp a {dest_label}",
                "telefono": telefono,
                "nombre": nombre,
                "mensaje": mensaje,
            }
        )
        if not pending:
            return "No s'ha pogut preparar l'acció WhatsApp."
        conversation.pending_action = pending
        conversation.save(update_fields=["pending_action", "updated_at"])
        if mensaje:
            return (
                f"WhatsApp preparat per a {dest_label}. "
                f"Text: «{mensaje[:200]}». Digues «sí» per enviar o «cancel·la»."
            )
        return (
            f"Destinatari {dest_label} preparat. "
            "Digues el text del missatge i després «sí», o crida prepare_whatsapp amb mensaje."
        )

    if tool == "prepare_email":
        to_email = str(args.get("to_email") or "").strip()
        subject = str(args.get("subject") or "").strip()
        body = str(args.get("body") or "").strip()
        cc = str(args.get("cc") or "").strip()
        summary = str(args.get("summary") or "").strip()
        if not to_email or not subject or not body:
            return "Cal to_email, subject i body per preparar el correu."
        pending = pending_action_dict(
            {
                "kind": "email",
                "summary": summary or f"Email a {to_email}: {subject[:60]}",
                "to_email": to_email,
                "subject": subject,
                "body": body,
                "cc": cc,
            }
        )
        if not pending:
            return "No s'ha pogut preparar el correu."
        conversation.pending_action = pending
        conversation.save(update_fields=["pending_action", "updated_at"])
        return f"Correu preparat per a {to_email}. Digues «sí» per enviar o «cancel·la»."

    if tool == "prepare_igeo_lead":
        nombre = str(args.get("nombre") or "").strip()
        if len(nombre) < 2:
            return "Cal un nom vàlid per al lead."
        summary = str(args.get("summary") or "").strip()
        pending = pending_action_dict(
            {
                "kind": "igeo_lead",
                "summary": summary or f"Lead iGEO: {nombre}",
                "nombre": nombre,
                "telefono": str(args.get("telefono") or "").strip(),
                "email": str(args.get("email") or "").strip(),
                "direccion": str(args.get("direccion") or "").strip(),
                "observaciones": str(args.get("observaciones") or "").strip(),
            }
        )
        if not pending:
            return "No s'ha pogut preparar el lead."
        conversation.pending_action = pending
        conversation.save(update_fields=["pending_action", "updated_at"])
        return f"Lead «{nombre}» preparat. Digues «sí» per enviar a iGEO o «cancel·la»."

    if tool == "confirm_pending_action":
        pending = pending_action_dict(getattr(conversation, "pending_action", None))
        if not pending:
            return "No hi ha cap acció pendent per confirmar."
        if pending.get("kind") == "whatsapp" and not (pending.get("mensaje") or "").strip():
            return "Encara falta el text del WhatsApp. Digues el missatge i torna a confirmar."
        reply = execute_confirmed_action(pending, conversation_id=conversation.pk)
        conversation.pending_action = None
        conversation.save(update_fields=["pending_action", "updated_at"])
        return reply

    if tool == "cancel_pending_action":
        conversation.pending_action = None
        conversation.save(update_fields=["pending_action", "updated_at"])
        return "Acció cancel·lada. No s'ha enviat res."

    return f"Eina desconeguda o no permesa en mode veu: {tool}"
