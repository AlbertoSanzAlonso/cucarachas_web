"""
Servidor MCP iGEO PDI para Cursor.

Reutiliza backend/api/igeo (sin arrancar Django para publish/drain).

Uso (desde la raíz del repo):
  cd mcp-igeo && python server.py

O con uv/pip: pip install -r requirements.txt
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

# backend/ en PYTHONPATH para importar api.igeo sin instalar el paquete
_BACKEND = Path(__file__).resolve().parents[1] / "backend"
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from mcp.server.fastmcp import FastMCP

from api.igeo.client import IgeoPdiClient
from api.igeo.config import get_igeo_settings
from api.igeo.payloads import (
    build_cliente_potencial,
    build_generic_entity,
    normalize_comando,
)

mcp = FastMCP("igeo-pdi")


def _client() -> IgeoPdiClient:
    return IgeoPdiClient(get_igeo_settings())


@mcp.tool()
def igeo_publish_entity(
    tipo_entidad: str,
    comando: str,
    datos_json: str,
    codigo_entidad: str = "",
    remote_operation_id: str = "",
) -> str:
    """
    Publica CREATE/UPDATE/DELETE genérico en la cola importaciones del PDI iGEO.

    datos_json: objeto JSON (string) con el cuerpo `datos` de la entidad.
    """
    try:
        datos = json.loads(datos_json) if datos_json else {}
    except json.JSONDecodeError as exc:
        return f"Error: datos_json no es JSON válido ({exc})"
    if not isinstance(datos, dict):
        return "Error: datos_json debe ser un objeto JSON"

    try:
        normalize_comando(comando)
        payload = build_generic_entity(
            tipo_entidad=tipo_entidad,
            comando=comando,
            datos=datos,
            codigo_entidad=codigo_entidad or None,
            remote_operation_id=remote_operation_id or None,
        )
    except ValueError as exc:
        return f"Error de validación: {exc}"

    # Forzar intento de publish aunque IGEO_PDI_ENABLED no esté en true en MCP
    # (el operador de Cursor decide conscientemente). Usamos el cliente con enabled
    # efectivo vía dry-run si faltan credenciales.
    settings = get_igeo_settings()
    client = IgeoPdiClient(
        type(settings)(
            **{
                **settings.__dict__,
                "enabled": True,
            }
        )
    )
    result = client.publish(payload)
    return json.dumps(
        {
            "ok": result.ok,
            "dry_run": result.dry_run,
            "message": result.message,
            "remote_operation_id": result.remote_operation_id,
            "payload": result.payload,
        },
        ensure_ascii=False,
        indent=2,
    )


@mcp.tool()
def igeo_create_lead(
    nombre: str,
    telefono: str = "",
    email: str = "",
    direccion: str = "",
    localidad: str = "Barcelona",
    tipo_cliente: str = "PARTICULAR",
    observaciones: str = "",
    remote_operation_id: str = "",
) -> str:
    """
    Atajo: crea un CLIENTE_POTENCIAL en iGEO (lead desde Bio-Assistent / CRM).

    Requiere IGEO_DEFAULT_DELEGACION e IGEO_DEFAULT_GESTOR en el entorno.
    """
    settings = get_igeo_settings()
    if not settings.default_delegacion or not settings.default_gestor:
        return (
            "Error: configura IGEO_DEFAULT_DELEGACION e IGEO_DEFAULT_GESTOR "
            "(códigos maestros de la cuenta CECSA en iGEO)."
        )
    try:
        payload = build_cliente_potencial(
            nombre=nombre,
            codigo_delegacion=settings.default_delegacion,
            codigo_gestionado_por=settings.default_gestor,
            telefono=telefono,
            movil=telefono,
            email=email,
            direccion=direccion,
            localidad=localidad,
            tipo_cliente=tipo_cliente,
            observaciones=observaciones,
            codigo_idioma=settings.default_idioma,
            codigo_actividad=settings.default_actividad,
            codigo_zona_comercial=settings.default_zona_comercial,
            remote_operation_id=remote_operation_id or None,
        )
    except ValueError as exc:
        return f"Error de validación: {exc}"

    client = IgeoPdiClient(
        type(settings)(**{**settings.__dict__, "enabled": True})
    )
    result = client.publish(payload)
    return json.dumps(
        {
            "ok": result.ok,
            "dry_run": result.dry_run,
            "message": result.message,
            "remote_operation_id": result.remote_operation_id,
            "payload": result.payload,
        },
        ensure_ascii=False,
        indent=2,
    )


@mcp.tool()
def igeo_get_import_results(max_messages: int = 20) -> str:
    """Consume mensajes de resultadoImportaciones (ACK de CREATE/UPDATE/DELETE)."""
    try:
        items = _client().get_import_results(max_messages=max_messages)
    except Exception as exc:
        return f"Error consumiendo resultadoImportaciones: {exc}"
    return json.dumps({"count": len(items), "results": items}, ensure_ascii=False, indent=2)


@mcp.tool()
def igeo_peek_exports(max_messages: int = 20, tipo_entidad: str = "") -> str:
    """
    Consume mensajes de exportaciones (cambios empujados por iGEO).

    tipo_entidad opcional filtra por tipoEntidadIgeo / claseEntidadIgeo.
    """
    try:
        items = _client().peek_exports(
            max_messages=max_messages,
            tipo_entidad=tipo_entidad or None,
        )
    except Exception as exc:
        return f"Error consumiendo exportaciones: {exc}"
    return json.dumps({"count": len(items), "exports": items}, ensure_ascii=False, indent=2)


@mcp.tool()
def igeo_status() -> str:
    """Muestra configuración PDI (sin password) y si hay dry-run."""
    s = get_igeo_settings()
    return json.dumps(
        {
            "enabled_env": s.enabled,
            "dry_run": s.dry_run,
            "credentials_ready": s.credentials_ready,
            "host": s.host,
            "port": s.port,
            "vhost": s.vhost,
            "user": s.user,
            "use_ssl": s.use_ssl,
            "default_delegacion": s.default_delegacion,
            "default_gestor": s.default_gestor,
            "default_idioma": s.default_idioma,
        },
        ensure_ascii=False,
        indent=2,
    )


if __name__ == "__main__":
    mcp.run()
