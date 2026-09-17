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
# Límite holgado: un torn pot fer CRM + espill + 1–2 cerques WA + send + email.
# El tall antic (6) feia fallar fluxos normals i semblava un "bucle OpenWA".
_OPS_USAGE_LIMITS = UsageLimits(request_limit=20, tool_calls_limit=16)


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
    # Los envíos reales solo tras confirmación UI (modal); por defecto bloqueados.
    side_effects_allowed: bool = False


class OpsPendingAction(BaseModel):
    """Acción sensible que el frontend debe confirmar antes de ejecutar."""

    kind: str = Field(description="whatsapp | email | igeo_lead")
    summary: str = Field(description="Resumen corto para el modal de confirmación.")
    telefono: str = Field(
        default="",
        description="Móvil o chatId interno (@c.us/@lid). Nunca lo pegues en message.",
    )
    mensaje: str = Field(default="", description="Texto WhatsApp.")
    to_email: str = Field(default="", description="Destinatario email.")
    subject: str = Field(default="", description="Asunto email.")
    body: str = Field(default="", description="Cuerpo email.")
    cc: str = Field(default="", description="CC email, coma-separados.")
    nombre: str = Field(
        default="",
        description="Nombre visible del contacto WhatsApp o lead iGEO.",
    )
    email: str = Field(default="", description="Email lead iGEO.")
    direccion: str = Field(default="", description="Dirección lead iGEO.")
    observaciones: str = Field(default="", description="Observaciones lead iGEO.")


class OpsAgentOutput(BaseModel):
    message: str = Field(
        description=(
            "Resposta per a l'operari. Només nom i telèfon llegible (+…); "
            "MAI ids tècnics (@lid, @c.us, REF_INTERNA)."
        ),
    )
    suggested_title: Optional[str] = Field(
        default=None,
        description="Títol curt de la conversa (màx 60 caràcters) si encara no en té.",
    )
    important_notes: List[str] = Field(
        default_factory=list,
        description=(
            "Només si l'operari demana explícitament recordar/desar una nota. "
            "Buit en la majoria de torns."
        ),
    )
    pending_action: Optional[OpsPendingAction] = Field(
        default=None,
        description=(
            "WhatsApp/email/lead: kind+summary+datos. telefono=REF_INTERNA (id). "
            "nombre=nombre humano. NO llames send_*. Confirmación con «sí» en el chat."
        ),
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


def _side_effects_guard(deps: OpsAgentDeps | None) -> str | None:
    if deps is None or not deps.side_effects_allowed:
        return (
            "BLOQUEJAT: els enviaments només s'executen quan l'operari escriu «sí» al xat. "
            "Omple pending_action (kind, summary, telefono=REF_INTERNA, nombre=nom humà, "
            "mensaje si el tens) i demana confirmació al message sense ids tècnics. "
            "NO tornis a cridar aquesta eina."
        )
    return None


_CONFIRM_RULES_ES = (
    "FRENO OBLIGATORIO: NUNCA ejecutes send_whatsapp, send_email ni igeo_create_lead en el chat. "
    "Esas tools están bloqueadas. Para enviar: busca si hace falta, rellena pending_action "
    "(kind, summary, telefono=REF_INTERNA/id, nombre=nombre humano, mensaje si ya lo tienes) "
    "y en message pide confirmación EN EL CHAT: el operario escribirá «sí» o «cancel·la». "
    "NO digas 'Desa com a nota' ni menciones modales. "
    "PRIVACIDAD UX: en message NUNCA muestres @lid, @c.us ni REF_INTERNA; solo nombre y teléfono (+…). "
    "important_notes: vacío salvo petición explícita de recordar/guardar nota. "
)

_CONFIRM_RULES_CA = (
    "FRE DE SEGURETAT: MAI executis send_whatsapp, send_email ni igeo_create_lead al xat. "
    "Aquestes eines estan bloquejades. Per enviar: cerca si cal, omple pending_action "
    "(kind, summary, telefono=REF_INTERNA/id, nombre=nom humà, mensaje si ja el tens) "
    "i al message demana confirmació AL XAT: l'operari escriurà «sí» o «cancel·la». "
    "NO diguis 'Desa com a nota' ni parlis de modals. "
    "UX: al message MAI mostris @lid, @c.us ni REF_INTERNA; només nom i telèfon (+…). "
    "important_notes: buit tret de petició explícita de recordar/desar nota. "
)


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
            f"{_CONFIRM_RULES_ES}"
            f"iGEO PDI está {igeo_on}. Si está desactivado, puedes preparar la acción pero no finjas que iGEO ya se actualizó. "
            f"WhatsApp (OpenWA) está {wa_on}. Puedes buscar contactos con search_whatsapp_contacts. "
            "Cerca RÀPIDA por defecto (xats recents + 1a lletra/prefix). "
            "Si no sale: prueba solo la letra (M) o deep=true. "
            "La búsqueda mira agenda del móvil enlazado + chats recientes; si no sale, pide el +teléfono. "
            "Acepta móviles ES e internacionales (+54, +52…) o id `…@c.us` en pending_action.telefono. "
            "Si no encuentras el nombre (máx. 2 búsquedas WA), pide el móvil internacional. "
            "Para un WhatsApp por nombre: solo search_whatsapp_contacts y luego pending_action; "
            "no llames CRM/iGEO/RAG ni whatsapp_status salvo error o petición explícita. "
            f"Email SMTP está {mail_on}. Para un correo: prepara pending_action kind=email "
            "(to_email, subject, body) y espera el modal. Si falla la config, email_status. "
            "Usa CRM / espejo iGEO para búsquedas de clientes. "
            "Datos vivos → CRM o espejo SQL, NUNCA el RAG. "
            "Procedimientos iGEO/PDI → RAG o search_ops_knowledge; no inventes códigos maestros. "
            "Operaciones sensibles (borrar, facturar, cambiar contrato) requiere confirmación humana."
        )
    return (
        "Ets l'assistent administratiu intern de CECSA Control de Plagues. "
        "Parles amb personal d'oficina, MAI amb el client final. "
        "No facis servir el to comercial del Bio-Assistent web. Sigues clar, operatiu i breu. "
        f"{_CONFIRM_RULES_CA}"
        f"iGEO PDI està {igeo_on}. Si està desactivat, pots preparar l'acció però no fingis que iGEO ja s'ha actualitzat. "
        f"WhatsApp (OpenWA) està {wa_on}. Pots cercar contactes amb search_whatsapp_contacts. "
        "Cerca RÀPIDA per defecte (xats recents + 1a lletra/prefix). "
        "Si no surt: prova només la lletra (M) o deep=true. "
        "La cerca mira agenda del mòbil enllaçat + xats recents; si no surt, demana el +telèfon. "
        "Accepta mòbils ES i internacionals (+54, +52…) o id `…@c.us` a pending_action.telefono. "
        "Si no trobes el nom (màx. 2 cerques WA), demana el mòbil internacional. "
        "Per un WhatsApp per nom: només search_whatsapp_contacts i després pending_action; "
        "no cridis CRM/iGEO/RAG ni whatsapp_status tret d'error o petició explícita. "
        f"Email SMTP està {mail_on}. Per un correu: prepara pending_action kind=email "
        "(to_email, subject, body) i espera el modal. Si falla la config, email_status. "
        "Fes servir CRM / espill iGEO per cerques de clients. "
        "Dades vives → CRM o espill SQL, MAI el RAG. "
        "Procediments iGEO/PDI → RAG o search_ops_knowledge; no inventis codis mestres. "
        "Operacions sensibles (esborrar, facturar, canviar contracte) cal confirmació humana."
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
    blocked = _side_effects_guard(ctx.deps)
    if blocked:
        return blocked
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
def search_whatsapp_contacts(ctx: RunContext[OpsAgentDeps], query: str, deep: bool = False) -> str:
    """Cerca ràpida a WhatsApp (xats recents + prefix/lletra). `deep=true` només si cal agenda completa."""
    blocked = _openwa_guard(ctx.deps)
    if blocked:
        return blocked
    try:
        hits = OpenWaClient().search_contacts(query, deep=bool(deep))
    except OpenWaError as exc:
        return _mark_openwa_failed(ctx.deps, str(exc))
    except Exception as exc:
        return _mark_openwa_failed(ctx.deps, f"Error OpenWA: {exc}")
    return format_contacts(hits)


@ops_agent.tool
def send_whatsapp(ctx: RunContext[OpsAgentDeps], telefono: str, mensaje: str) -> str:
    """Envia un WhatsApp via OpenWA. `telefono`: mòbil ES, internacional (+prefix) o chatId (`…@c.us`)."""
    blocked = _side_effects_guard(ctx.deps)
    if blocked:
        return blocked
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
    blocked = _side_effects_guard(ctx.deps)
    if blocked:
        return blocked
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
    source: str = "text",
) -> OpsAgentOutput:
    """Invoca l'LLM intern. L'historial es passa com a context (no és el xat públic)."""
    via_voice = (source or "").strip().lower() == "voice"
    # Veu: menys context = menys tokens = menys latència.
    hist_slice = history[-6:] if via_voice else history
    prior = _history_block(hist_slice)
    notes = _memory_notes_block(memory_notes)
    # RAG és lent i rarament útil en ordres de veu curtes («envia WhatsApp a…»).
    rag = "" if via_voice else _ops_rag_block(user_message)
    prompt = user_message.strip()
    parts: list[str] = []
    if via_voice:
        parts.append(
            "ENTRADA PER VEU: respon en 1–3 frases curtes. "
            "Només nom i telèfon (+…); zero ids tècnics."
        )
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
            hint = f" Últim error OpenWA: {deps.openwa_fail_reason}"
        elif deps.email_failed:
            hint = f" Últim error email: {deps.email_fail_reason}"
        raise RuntimeError(
            "L'agent ha esgotat el límit de crides d'eines en aquest torn "
            f"(no és necessàriament un error d'OpenWA).{hint} Detall: {exc}"
        ) from exc
    output = result.output
    if isinstance(output, OpsAgentOutput):
        return output
    return OpsAgentOutput(message=str(output))
