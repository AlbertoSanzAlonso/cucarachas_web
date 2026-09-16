"""Cliente PDI iGEO (RabbitMQ) compartido por agentes, booking y MCP."""

from .client import IgeoPdiClient, PublishResult
from .config import IgeoPdiSettings, get_igeo_settings, is_igeo_enabled
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
    "build_cliente",
    "build_cliente_potencial",
    "build_orden_trabajo",
    "build_sede",
    "get_igeo_settings",
    "is_igeo_enabled",
    "normalize_comando",
]
