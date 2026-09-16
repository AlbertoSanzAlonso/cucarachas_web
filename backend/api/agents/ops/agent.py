"""Asistente interno del backoffice. No comparte grafo ni sesión con el Bio-Assistent público."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional

from pydantic import BaseModel, Field
from pydantic_ai import Agent, AgentRetries, RunContext
from pydantic_ai.exceptions import UsageLimitExceeded
from pydantic_ai.usage import UsageLimits

from api.igeo.config import get_igeo_settings, is_igeo_enabled
from api.igeo.payloads import build_cliente_potencial
from api.igeo.sync import publish_entity
from api.openwa import OpenWaClient, OpenWaError, format_contacts, is_openwa_enabled, status_summary
from api.ops_email import email_status_summary, is_smtp_ready, send_ops_email
from api.phone_utils import normalize_phone

from api.agents import bootstrap  # noqa: F401
from api.agents.config import AGENT_MODEL, resolve_ops_model, setup_ai_keys

# Límites estrictos: si OpenWA falla, el LLM tiende a reintentar hasta agotar el default (50).
_OPS_USAGE_LIMITS = UsageLimits(request_limit=12, tool_calls_limit=8)


@dataclass
class OpsAgentDeps:
    user_id: int
    conversation_id: int
    language: str = "ca"
    # Cortocircuito por turno: un fallo OpenWA bloquea más llamadas en la misma petición.
    openwa_failed: bool = False
    openwa_fail_reason: str = ""
    email_failed: bool = False
    email_fail_reason: str = ""


class OpsAgentOutput(BaseModel):
    message: str = Field(description="Resposta per a l'operari, en català o castellà segons el missatge.")
    suggested_title: Optional[str] = Field(
        default=None,
        description="Títol curt de la conversa (màx 60 caràcters) si encara no en té.",
    )
    important_notes: List[str] = Field(
        default_factory=list,
        description="Fets que cal recordar (telèfon, codi iGEO, excepció). Buit si no n'hi ha.",
    )


ops_agent = Agent(
    AGENT_MODEL,
    deps_type=OpsAgentDeps,
    output_type=OpsAgentOutput,
    # Sin reintentos automáticos de tools: devolvemos el error al operario en una sola pasada.
    retries=AgentRetries(tools=0, output=1),
)


def _mark_openwa_failed(deps: OpsAgentDeps | None, reason: str) -> str:
    msg = (reason or "").strip() or "Error OpenWA desconegut."
    if deps is not None:
        deps.openwa_failed = True
        deps.openwa_fail_reason = msg
    return msg


def _openwa_guard(deps: OpsAgentDeps | None) -> str | None:
    if deps is not None and deps.openwa_failed:
        return (
            "OpenWA ja ha fallat EN AQUEST TORN — NO reintentis send_whatsapp / "
            f"search_whatsapp_contacts / whatsapp_status. Motiu: {deps.openwa_fail_reason}"
        )
    return None


def _mark_email_failed(deps: OpsAgentDeps | None, reason: str) -> str:
    msg = (reason or "").strip() or "Error email desconegut."
    if deps is not None:
        deps.email_failed = True
        deps.email_fail_reason = msg
    return msg


def _email_guard(deps: OpsAgentDeps | None) -> str | None:
    if deps is not None and deps.email_failed:
        return (
            "Email ja ha fallat EN AQUEST TORN — NO reintentis send_email / email_status. "
            f"Motiu: {deps.email_fail_reason}"
        )
    return None


@ops_agent.system_prompt
def _ops_prompt(ctx: RunContext[OpsAgentDeps]) -> str:
    lang = (ctx.deps.language if ctx.deps else "ca") or "ca"
    igeo_on = "actiu" if is_igeo_enabled() else "desactivat (IGEO_PDI_ENABLED=false)"
    wa_on = "actiu" if is_openwa_enabled() else "desactivat (OPENWA_ENABLED=false)"
    mail_on = "actiu" if is_smtp_ready() else "desactivat (falta EMAIL_HOST / SMTP)"
    if lang.startswith("es"):
        return (
            "Eres el asistente administrativo interno de CECSA Control de Plagas. "
            "Hablas con personal de oficina, NUNCA con el cliente final. "
            "No uses el tono comercial del Bio-Assistent web. Sé claro, operativo y breve. "
            f"iGEO PDI está {igeo_on}. Si está desactivado, puedes preparar la acción pero no finjas que iGEO ya se actualizó. "
            f"WhatsApp (OpenWA) está {wa_on}. Puedes buscar contactos de la agenda WhatsApp con "
            "search_whatsapp_contacts. Solo envía un WhatsApp si el operario lo pide de forma explícita; "
            "nunca por iniciativa propia. Confirma teléfono y texto antes de send_whatsapp. "
            "Acepta móviles ES e internacionales con prefijo de país (+54, +52…) o el id `…@c.us` del contacto. "
            "Si no encuentras el nombre completo, busca solo el apellido o el nombre; "
            "sin resultados NO es fallo técnico: pide el móvil internacional y envía con send_whatsapp. "
            "Si whatsapp_status o send_whatsapp fallan (error técnico), cita el texto TAL CUAL "
            "(incluye url= y el error); no lo resumas como 'fallo de conexión' genérico. "
            "Si send_whatsapp falla UNA vez por error técnico, NO reintentes: informa al operario y para. "
            f"Email SMTP está {mail_on}. Solo envía un correo si el operario lo pide de forma explícita; "
            "nunca por iniciativa propia. Si pide un correo de prueba y da el destinatario, "
            "usa un asunto/cuerpo breves y llama send_email (no digas solo 'no puedo'). "
            "Si Email está desactivado o falla, llama email_status y cita el texto TAL CUAL "
            "(incluye ready=, host= y qué variables faltan en Coolify). "
            "Confirma destinatario, asunto y cuerpo antes de send_email solo si faltan datos. "
            "Si email_status o send_email fallan UNA vez, NO reintentes: informa al operario y para. "
            "Usa herramientas para buscar en el CRM local (Cliente) y en el espejo iGEO antes de crear nada. "
            "Datos vivos de clientes/OT/contratos → CRM o espejo SQL, NUNCA el RAG. "
            "Procedimientos iGEO/PDI/campos obligatorios → usa el bloque RAG del prompt o search_ops_knowledge; "
            "no inventes campos ni códigos maestros. "
            "Evita duplicados. Si falta un dato obligatorio, pregúntalo. "
            "No inventes códigos de delegación, técnico ni contrato. "
            "Operaciones sensibles (borrar, facturar, cambiar contrato) requiere que el humano confirme; no las ejecutes por tu cuenta. "
            "Si detectas un dato que hay que recordar (teléfono, código iGEO, excepción de garantía), inclúyelo en important_notes."
        )
    return (
        "Ets l'assistent administratiu intern de CECSA Control de Plagues. "
        "Parles amb personal d'oficina, MAI amb el client final. "
        "No facis servir el to comercial del Bio-Assistent web. Sigues clar, operatiu i breu. "
        f"iGEO PDI està {igeo_on}. Si està desactivat, pots preparar l'acció però no fingis que iGEO ja s'ha actualitzat. "
        f"WhatsApp (OpenWA) està {wa_on}. Pots cercar contactes de l'agenda WhatsApp amb "
        "search_whatsapp_contacts. Només envia un WhatsApp si l'operari ho demana de forma explícita; "
        "mai per iniciativa pròpia. Confirma telèfon i text abans de send_whatsapp. "
        "Accepta mòbils ES i internacionals amb prefix de país (+54, +52…) o l'id `…@c.us` del contacte. "
        "Si no trobes el nom complet, cerca només el cognom o el nom; "
        "sense resultats NO és fallada tècnica: demana el mòbil internacional i envia amb send_whatsapp. "
        "Si whatsapp_status o send_whatsapp fallen (error tècnic), cita el text TAL QUAL "
        "(inclou url= i l'error); no ho resumeixis com a 'fallo de connexió' genèric. "
        "Si send_whatsapp falla UN cop per error tècnic, NO reintentis: informa l'operari i para. "
        f"Email SMTP està {mail_on}. Només envia un correu si l'operari ho demana de forma explícita; "
        "mai per iniciativa pròpia. Si demana un correu de prova i dóna el destinatari, "
        "fes servir un assumpte/cos breus i crida send_email (no diguis només 'no puc'). "
        "Si Email està desactivat o falla, crida email_status i cita el text TAL QUAL "
        "(inclou ready=, host= i quines variables falten a Coolify). "
        "Confirma destinataris, assumpte i cos abans de send_email només si falten dades. "
        "Si email_status o send_email fallen UN cop, NO reintentis: informa l'operari i para. "
        "Fes servir eines per buscar al CRM local (Cliente) i a l'espill iGEO abans de crear res. "
        "Dades vives de clients/OT/contractes → CRM o espill SQL, MAI el RAG. "
        "Procediments iGEO/PDI/camps obligatoris → fes servir el bloc RAG del prompt o search_ops_knowledge; "
        "no inventis camps ni codis mestres. "
        "Evita duplicats. Si falta un dada obligatòria, pregunta-la. "
        "No inventis codis de delegació, tècnic ni contracte. "
        "Operacions sensibles (esborrar, facturar, canviar contracte) cal que l'humà confirmi; no les executis pel teu compte. "
        "Si detectes una dada a recordar (telèfon, codi iGEO, excepció de garantia), posa-la a important_notes."
    )


@ops_agent.tool
def search_ops_knowledge(ctx: RunContext[OpsAgentDeps], query: str, category: str = "") -> str:
    """Cerca procediments interns (PDI, SOPs, camps iGEO). No substitueix la cerca de clients."""
    from knowledge.retriever import retrieve_ops_knowledge

    q = (query or "").strip()
    if len(q) < 3:
        return "Cal una consulta d'almenys 3 caràcters."
    cat = (category or "").strip() or None
    return retrieve_ops_knowledge(q, limit=5, category=cat)


def lookup_crm_clientes(query: str) -> str:
    """Busca clients/leads al CRM CECSA per nom, telèfon o email (no és iGEO en viu)."""
    q = (query or "").strip()
    if len(q) < 2:
        return "Cal un text de cerca d'almenys 2 caràcters."
    from django.db.models import Q

    from api.models import Cliente

    digits = normalize_phone(q)
    tokens = [t for t in re.split(r"\s+", q) if len(t) >= 2]
    filt = Q(nombre__icontains=q) | Q(email__icontains=q) | Q(telefono__icontains=q)
    if len(tokens) >= 2:
        token_filt = Q()
        for tok in tokens:
            token_filt &= Q(nombre__icontains=tok)
        filt = filt | token_filt
    elif tokens:
        filt = filt | Q(nombre__icontains=tokens[0])
    if digits:
        filt = filt | Q(telefono_norm=digits)
    rows = list(Cliente.objects.filter(filt).order_by("-created_at")[:8])
    if not rows:
        return (
            "Cap coincidència al CRM local. "
            "Si el tens al mòbil WhatsApp, cerca-l'hi o passa el telèfon internacional."
        )
    lines = []
    for c in rows:
        igeo = getattr(c, "igeo_codigo", "") or "—"
        lines.append(
            f"id={c.pk} | {c.nombre} | tel={c.telefono} | email={c.email or '—'} "
            f"| estat={c.crm_status} | iGEO={igeo}"
        )
    return "\n".join(lines)


@ops_agent.tool
def search_crm_cliente(ctx: RunContext[OpsAgentDeps], query: str) -> str:
    """Busca clients/leads al CRM CECSA per nom, telèfon o email (no és iGEO en viu)."""
    return lookup_crm_clientes(query)


@ops_agent.tool
def search_igeo_espejo(
    ctx: RunContext[OpsAgentDeps],
    query: str,
    tipo_entidad: str = "",
) -> str:
    """Busca al espill local iGEO (clients, seus, OT…). No consulta iGEO en viu."""
    from api.igeo.ingest import format_mirror_hits, search_mirror

    rows = search_mirror(query, entity_type=tipo_entidad or None)
    return format_mirror_hits(rows)


@ops_agent.tool
def igeo_espejo_status(ctx: RunContext[OpsAgentDeps]) -> str:
    """Comptadors de l'espill iGEO (SQL). Sense embeddings."""
    from api.igeo.ingest import mirror_counts

    return mirror_counts()


@ops_agent.tool
def igeo_status(ctx: RunContext[OpsAgentDeps]) -> str:
    """Estat de la connexió PDI iGEO (sense password)."""
    s = get_igeo_settings()
    return (
        f"enabled={s.enabled} dry_run={s.dry_run} credentials={s.credentials_ready} "
        f"host={s.host or '—'} vhost={s.vhost or '—'} "
        f"delegacion={s.default_delegacion or '—'} gestor={s.default_gestor or '—'}"
    )


@ops_agent.tool
def igeo_create_lead(
    ctx: RunContext[OpsAgentDeps],
    nombre: str,
    telefono: str = "",
    email: str = "",
    direccion: str = "",
    observaciones: str = "",
) -> str:
    """Crea un CLIENTE_POTENCIAL a iGEO via PDI (async). Comprova abans search_crm_cliente."""
    if not is_igeo_enabled():
        return "iGEO PDI deshabilitat. El lead NO s'ha enviat a iGEO."
    settings = get_igeo_settings()
    if not settings.default_delegacion or not settings.default_gestor:
        return "Falten IGEO_DEFAULT_DELEGACION / IGEO_DEFAULT_GESTOR."
    try:
        payload = build_cliente_potencial(
            nombre=nombre,
            codigo_delegacion=settings.default_delegacion,
            codigo_gestionado_por=settings.default_gestor,
            telefono=telefono,
            movil=telefono,
            email=email,
            direccion=direccion,
            observaciones=observaciones,
            codigo_idioma=settings.default_idioma,
            codigo_actividad=settings.default_actividad,
            codigo_zona_comercial=settings.default_zona_comercial,
            remote_operation_id=f"ops-{ctx.deps.conversation_id}" if ctx.deps else None,
        )
    except ValueError as exc:
        return f"Error payload: {exc}"
    result = publish_entity(payload)
    return f"ok={result.ok} dry_run={result.dry_run} — {result.message}"


@ops_agent.tool
def whatsapp_status(ctx: RunContext[OpsAgentDeps]) -> str:
    """Estat del contenidor OpenWA (sense API key ni session id)."""
    blocked = _openwa_guard(ctx.deps)
    if blocked:
        return blocked
    summary = status_summary()
    low = summary.lower()
    if "error de connexió" in low or "desactivat" in low or "falten openwa" in low:
        return _mark_openwa_failed(ctx.deps, summary)
    status_token = ""
    for part in summary.split():
        if part.startswith("status="):
            status_token = part.split("=", 1)[1].strip().lower()
            break
    if status_token and status_token not in ("ready", "—"):
        return _mark_openwa_failed(ctx.deps, summary)
    return summary


@ops_agent.tool
def search_whatsapp_contacts(ctx: RunContext[OpsAgentDeps], query: str) -> str:
    """Cerca contactes a l'agenda WhatsApp vinculada (OpenWA). Només lectura; no envia missatges."""
    blocked = _openwa_guard(ctx.deps)
    if blocked:
        return blocked
    try:
        hits = OpenWaClient().search_contacts(query)
    except OpenWaError as exc:
        return _mark_openwa_failed(ctx.deps, str(exc))
    except Exception as exc:
        return _mark_openwa_failed(ctx.deps, f"Error OpenWA: {exc}")
    return format_contacts(hits)


@ops_agent.tool
def send_whatsapp(ctx: RunContext[OpsAgentDeps], telefono: str, mensaje: str) -> str:
    """Envia un WhatsApp via OpenWA. `telefono`: mòbil ES, internacional (+prefix) o chatId (`…@c.us`)."""
    blocked = _openwa_guard(ctx.deps)
    if blocked:
        return blocked
    try:
        result = OpenWaClient().send_text(telefono, mensaje)
    except OpenWaError as exc:
        return _mark_openwa_failed(ctx.deps, f"No enviat: {exc}")
    except Exception as exc:
        return _mark_openwa_failed(ctx.deps, f"Error OpenWA: {exc}")
    if not result.ok:
        return _mark_openwa_failed(ctx.deps, f"No enviat: {result.message}")
    if result.dry_run:
        return f"DRY-RUN (no enviat de veritat): {result.message}"
    return f"ok={result.ok} dry_run={result.dry_run} chat={result.chat_id} — {result.message}"


@ops_agent.tool
def email_status(ctx: RunContext[OpsAgentDeps]) -> str:
    """Estat del correu SMTP (backend, host, from). Sense passwords."""
    blocked = _email_guard(ctx.deps)
    if blocked:
        return blocked
    return email_status_summary()


@ops_agent.tool
def send_email(
    ctx: RunContext[OpsAgentDeps],
    to_email: str,
    subject: str,
    body: str,
    cc: str = "",
) -> str:
    """Envia un correu de text pla via SMTP Django. Només si l'operari ho ha demanat explícitament."""
    blocked = _email_guard(ctx.deps)
    if blocked:
        return blocked
    result = send_ops_email(to_email=to_email, subject=subject, body=body, cc=cc)
    if not result.ok:
        return _mark_email_failed(ctx.deps, f"No enviat: {result.message}")
    if result.dry_run:
        return f"DRY-RUN (no enviat de veritat): {result.message}"
    return f"ok={result.ok} dry_run={result.dry_run} — {result.message}"


def _history_block(messages: list[dict], *, max_turns: int = 16) -> str:
    recent = messages[-max_turns:]
    lines = []
    for m in recent:
        role = m.get("role") or "user"
        content = (m.get("content") or "").strip()
        if not content:
            continue
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


def _memory_notes_block(notes: list[str] | None, *, max_notes: int = 12) -> str:
    lines = []
    for raw in (notes or [])[:max_notes]:
        text = (raw or "").strip()
        if text:
            lines.append(f"- {text}")
    return "\n".join(lines)


def _ops_rag_block(user_message: str, *, limit: int = 5) -> str:
    q = (user_message or "").strip()
    if len(q) < 3:
        return ""
    try:
        from knowledge.retriever import retrieve_ops_knowledge

        rag = retrieve_ops_knowledge(q, limit=limit)
    except Exception as exc:
        print(f"WARNING: ops RAG inject failed: {exc}")
        return ""
    if not (rag or "").strip():
        return ""
    if "No s'ha trobat" in rag or "No s'ha pogut" in rag:
        return ""
    return rag.strip()


def run_ops_agent(
    *,
    user_message: str,
    history: list[dict],
    user_id: int,
    conversation_id: int,
    language: str = "ca",
    model: str | None = None,
    memory_notes: list[str] | None = None,
) -> OpsAgentOutput:
    """Invoca l'LLM intern. L'historial es passa com a context (no és el xat públic)."""
    prior = _history_block(history)
    notes = _memory_notes_block(memory_notes)
    rag = _ops_rag_block(user_message)
    prompt = user_message.strip()
    parts: list[str] = []
    if rag:
        parts.append(
            "Coneixement intern (RAG — procediments iGEO/PDI; no són dades de clients):\n"
            f"{rag}"
        )
    if notes:
        parts.append(
            "Notes pinnejades d'aquesta conversa / usuari (recordatoris):\n"
            f"{notes}"
        )
    if prior:
        parts.append(
            "Historial d'aquesta conversa interna (no el xat de clients):\n"
            f"{prior}"
        )
    parts.append(f"Missatge nou de l'operari:\n{prompt}")
    prompt = "\n\n".join(parts)
    deps = OpsAgentDeps(
        user_id=user_id,
        conversation_id=conversation_id,
        language=language if language in ("ca", "es") else "ca",
    )
    model_id = resolve_ops_model(model)
    setup_ai_keys(model_id)
    try:
        result = ops_agent.run_sync(
            prompt,
            deps=deps,
            model=model_id,
            usage_limits=_OPS_USAGE_LIMITS,
            retries=AgentRetries(tools=0, output=1),
        )
    except UsageLimitExceeded as exc:
        hint = ""
        if deps.openwa_failed:
            hint = f" OpenWA: {deps.openwa_fail_reason}"
        raise RuntimeError(
            "L'agent ha esgotat el límit de passos (probable bucle WhatsApp/OpenWA)."
            f"{hint} Detall: {exc}"
        ) from exc
    output = result.output
    if isinstance(output, OpsAgentOutput):
        return output
    return OpsAgentOutput(message=str(output))
