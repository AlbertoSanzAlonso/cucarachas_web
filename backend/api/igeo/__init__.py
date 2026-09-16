"""Cliente PDI iGEO (RabbitMQ) compartido por agentes, booking y MCP."""

from .client import IgeoPdiClient, PublishResult
from .config import IgeoPdiSettings, get_igeo_settings, is_igeo_enabled
from .ingest import ingest_export_batch, ingest_export_payload, search_mirror
from .payloads import (
    build_cliente,
    build_cliente_potencial,
    build_orden_trabajo,
    build_sede,
    normalize_comando,
)

__all__ = [
    "IgeoPdiClient",
    "IgeoPdiSettings",
    "PublishResult",
    "ingest_export_batch",
    "ingest_export_payload",
    "search_mirror",
    "build_cliente",
    "build_cliente_potencial",
    "build_orden_trabajo",
    "build_sede",
    "get_igeo_settings",
    "is_igeo_enabled",
    "normalize_comando",
]
