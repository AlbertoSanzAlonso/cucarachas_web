"""Espejo local / log de sincronización iGEO PDI."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


def log_sync_result(
    *,
    entity_type: str,
    comando: str,
    remote_operation_id: str | None,
    ok: bool,
    dry_run: bool,
    message: str,
    payload: dict[str, Any] | None = None,
    telefono_norm: str | None = None,
    cliente_id: int | None = None,
) -> None:
    """Persiste IgeoSyncLog si Django está disponible; siempre loguea."""
    logger.info(
        "iGEO sync entity=%s comando=%s remote=%s ok=%s dry_run=%s msg=%s",
        entity_type,
        comando,
        remote_operation_id,
        ok,
        dry_run,
        message,
    )
    try:
        from api.models import IgeoSyncLog

        IgeoSyncLog.objects.create(
            entity_type=(entity_type or "")[:64],
            comando=(comando or "")[:16],
            remote_operation_id=(remote_operation_id or "")[:128],
            ok=ok,
            dry_run=dry_run,
            message=(message or "")[:2000],
            payload=payload or {},
            telefono_norm=(telefono_norm or "")[:15],
            cliente_id=cliente_id,
        )
    except Exception as exc:
        # Tests sin migrate / MCP sin Django
        logger.debug("IgeoSyncLog skip: %s", exc)


def update_cliente_igeo_codigo(*, telefono: str, igeo_codigo: str) -> bool:
    """Guarda el código iGEO en el Cliente local (espejo)."""
    code = (igeo_codigo or "").strip()
    if not code:
        return False
    try:
        from api.phone_utils import normalize_phone
        from api.models import Cliente

        norm = normalize_phone(telefono)
        if not norm:
            return False
        updated = Cliente.objects.filter(telefono_norm=norm).update(igeo_codigo=code[:64])
        return updated > 0
    except Exception as exc:
        logger.debug("update_cliente_igeo_codigo skip: %s", exc)
        return False
