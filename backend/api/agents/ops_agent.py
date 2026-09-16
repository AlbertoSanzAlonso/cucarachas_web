"""Asistente interno del backoffice. No comparte grafo ni sesión con el Bio-Assistent público."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

from api.igeo.config import get_igeo_settings, is_igeo_enabled
from api.igeo.payloads import build_cliente_potencial
from api.igeo.sync import publish_entity
from api.openwa import OpenWaClient, OpenWaError, is_openwa_enabled, status_summary
from api.phone_utils import normalize_phone

from . import bootstrap  # noqa: F401
from .config import AGENT_MODEL, resolve_ops_model, setup_ai_keys


@dataclass
class OpsAgentDeps:
    user_id: int
    conversation_id: int
    language: str = "ca"


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
    retries=2,
)


@ops_agent.system_prompt
def _ops_prompt(ctx: RunContext[OpsAgentDeps]) -> str:
    lang = (ctx.deps.language if ctx.deps else "ca") or "ca"
    igeo_on = "actiu" if is_igeo_enabled() else "desactivat (IGEO_PDI_ENABLED=false)"
    wa_on = "actiu" if is_openwa_enabled() else "desactivat (OPENWA_ENABLED=false)"
    if lang.startswith("es"):
        return (
            "Eres el asistente administrativo interno de CECSA Control de Plagas. "
            "Hablas con personal de oficina, NUNCA con el cliente final. "
            "No uses el tono comercial del Bio-Assistent web. Sé claro, operativo y breve. "
            f"iGEO PDI está {igeo_on}. Si está desactivado, puedes preparar la acción pero no finjas que iGEO ya se actualizó. "
            f"WhatsApp (OpenWA) está {wa_on}. Solo envía un WhatsApp si el operario lo pide de forma explícita; "
            "nunca por iniciativa propia. Confirma teléfono y texto antes de send_whatsapp. "
            "Usa herramientas para buscar en el CRM local (Cliente) antes de crear nada. "
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
        f"WhatsApp (OpenWA) està {wa_on}. Només envia un WhatsApp si l'operari ho demana de forma explícita; "
        "mai per iniciativa pròpia. Confirma telèfon i text abans de send_whatsapp. "
        "Fes servir eines per buscar al CRM local (Cliente) abans de crear res. "
        "Evita duplicats. Si falta un dada obligatòria, pregunta-la. "
        "No inventis codis de delegació, tècnic ni contracte. "
        "Operacions sensibles (esborrar, facturar, canviar contracte) cal que l'humà confirmi; no les executis pel teu compte. "
        "Si detectes una dada a recordar (telèfon, codi iGEO, excepció de garantia), posa-la a important_notes."
    )


def lookup_crm_clientes(query: str) -> str:
    """Busca clients/leads al CRM CECSA per nom, telèfon o email (no és iGEO en viu)."""
    q = (query or "").strip()
    if len(q) < 2:
        return "Cal un text de cerca d'almenys 2 caràcters."
    from django.db.models import Q

    from api.models import Cliente

    digits = normalize_phone(q)
    filt = Q(nombre__icontains=q) | Q(email__icontains=q) | Q(telefono__icontains=q)
    if digits:
        filt = filt | Q(telefono_norm=digits)
    rows = list(Cliente.objects.filter(filt).order_by("-created_at")[:8])
    if not rows:
        return "Cap coincidència al CRM local."
    lines = []
    for c in rows:
        igeo = getattr(c, "igeo_codigo", "") or "—"
        lines.append(
            f"id={c.id} | {c.nombre} | tel={c.telefono} | email={c.email or '—'} "
            f"| estat={c.crm_status} | iGEO={igeo}"
        )
    return "\n".join(lines)


@ops_agent.tool
def search_crm_cliente(ctx: RunContext[OpsAgentDeps], query: str) -> str:
    """Busca clients/leads al CRM CECSA per nom, telèfon o email (no és iGEO en viu)."""
    return lookup_crm_clientes(query)


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
    return status_summary()


@ops_agent.tool
def send_whatsapp(ctx: RunContext[OpsAgentDeps], telefono: str, mensaje: str) -> str:
    """Envia un WhatsApp de text via OpenWA. Només si l'operari ho ha demanat explícitament."""
    try:
        result = OpenWaClient().send_text(telefono, mensaje)
    except OpenWaError as exc:
        return f"No enviat: {exc}"
    except Exception as exc:
        return f"Error OpenWA: {exc}"
    return f"ok={result.ok} dry_run={result.dry_run} chat={result.chat_id} — {result.message}"


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


def run_ops_agent(
    *,
    user_message: str,
    history: list[dict],
    user_id: int,
    conversation_id: int,
    language: str = "ca",
    model: str | None = None,
) -> OpsAgentOutput:
    """Invoca l'LLM intern. L'historial es passa com a context (no és el xat públic)."""
    prior = _history_block(history)
    prompt = user_message.strip()
    if prior:
        prompt = (
            "Historial d'aquesta conversa interna (no el xat de clients):\n"
            f"{prior}\n\n"
            f"Missatge nou de l'operari:\n{prompt}"
        )
    deps = OpsAgentDeps(
        user_id=user_id,
        conversation_id=conversation_id,
        language=language if language in ("ca", "es") else "ca",
    )
    model_id = resolve_ops_model(model)
    setup_ai_keys(model_id)
    result = ops_agent.run_sync(prompt, deps=deps, model=model_id)
    output = result.output
    if isinstance(output, OpsAgentOutput):
        return output
    return OpsAgentOutput(message=str(output))
