"""Tools Pydantic-AI para CRUD asíncrono vía PDI iGEO."""

from __future__ import annotations

import json

from pydantic_ai import RunContext

from api.igeo.client import IgeoPdiClient
from api.igeo.config import get_igeo_settings, is_igeo_enabled
from api.igeo.payloads import build_cliente_potencial, build_generic_entity
from api.igeo.sync import publish_entity
from api.agents.models import AgentState


def register_igeo_tools(agent) -> None:
    """Adjunta tools iGEO a un Agent Pydantic-AI (scheduler / sintetizador)."""

    @agent.tool
    def igeo_create_lead(
        ctx: RunContext[AgentState],
        nombre: str,
        telefono: str = "",
        email: str = "",
        direccion: str = "",
        observaciones: str = "",
    ) -> str:
        """Crea un cliente potencial (lead) en iGEO ERP vía PDI (async)."""
        if not is_igeo_enabled():
            return "iGEO PDI deshabilitat (IGEO_PDI_ENABLED=false)."
        settings = get_igeo_settings()
        if not settings.default_delegacion or not settings.default_gestor:
            return "Falten IGEO_DEFAULT_DELEGACION / IGEO_DEFAULT_GESTOR al servidor."
        try:
            payload = build_cliente_potencial(
                nombre=nombre or (ctx.deps.customer_name if ctx.deps else "") or "Lead",
                codigo_delegacion=settings.default_delegacion,
                codigo_gestionado_por=settings.default_gestor,
                telefono=telefono,
                movil=telefono,
                email=email,
                direccion=direccion or (ctx.deps.city if ctx.deps else "") or "",
                tipo_cliente="PARTICULAR",
                observaciones=observaciones,
                codigo_idioma=settings.default_idioma,
                codigo_actividad=settings.default_actividad,
                codigo_zona_comercial=settings.default_zona_comercial,
                remote_operation_id=None,
            )
        except ValueError as exc:
            return f"Error payload iGEO: {exc}"
        result = publish_entity(payload)
        return (
            f"iGEO lead: ok={result.ok} dry_run={result.dry_run} — {result.message}"
        )

    @agent.tool
    def igeo_publish_entity(
        ctx: RunContext[AgentState],
        tipo_entidad: str,
        comando: str,
        datos_json: str,
        codigo_entidad: str = "",
        remote_operation_id: str = "",
    ) -> str:
        """Publica CREATE/UPDATE/DELETE genérico a iGEO (cola importaciones)."""
        if not is_igeo_enabled():
            return "iGEO PDI deshabilitat (IGEO_PDI_ENABLED=false)."
        try:
            datos = json.loads(datos_json) if datos_json else {}
        except json.JSONDecodeError as exc:
            return f"datos_json inválid: {exc}"
        if not isinstance(datos, dict):
            return "datos_json ha de ser un objecte JSON."
        try:
            payload = build_generic_entity(
                tipo_entidad=tipo_entidad,
                comando=comando,
                datos=datos,
                codigo_entidad=codigo_entidad or None,
                remote_operation_id=remote_operation_id or None,
            )
        except ValueError as exc:
            return f"Error validació: {exc}"
        result = publish_entity(payload)
        return f"iGEO publish: ok={result.ok} dry_run={result.dry_run} — {result.message}"

    @agent.tool
    def igeo_get_import_results(ctx: RunContext[AgentState], max_messages: int = 10) -> str:
        """Llegeix resultats d'importació PDI (ACK / errors)."""
        if not is_igeo_enabled():
            return "iGEO PDI deshabilitat."
        try:
            items = IgeoPdiClient().get_import_results(max_messages=max_messages)
        except Exception as exc:
            return f"Error llegint resultats: {exc}"
        if not items:
            return "Cap resultat a resultadoImportaciones (o dry-run sense cua)."
        return json.dumps(items, ensure_ascii=False)[:4000]
