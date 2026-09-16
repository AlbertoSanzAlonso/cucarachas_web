"""Configuración OpenWA desde variables de entorno (sin secretos en código)."""

from __future__ import annotations

import os
from dataclasses import dataclass


def _env_bool(name: str, default: bool = False) -> bool:
    raw = (os.getenv(name) or "").strip().lower()
    if not raw:
        return default
    return raw in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class OpenWaSettings:
    enabled: bool
    api_url: str
    api_key: str
    session_id: str
    timeout_seconds: float
    dry_run: bool

    @property
    def credentials_ready(self) -> bool:
        return bool(self.api_url and self.api_key and self.session_id)


def get_openwa_settings() -> OpenWaSettings:
    api_url = (os.getenv("OPENWA_API_URL") or "http://openwa:2785/api").strip().rstrip("/")
    api_key = (os.getenv("OPENWA_API_KEY") or "").strip()
    session_id = (os.getenv("OPENWA_SESSION_ID") or "").strip()
    timeout_seconds = float(os.getenv("OPENWA_TIMEOUT_SECONDS") or "15")
    credentials_ready = bool(api_url and api_key and session_id)
    enabled = _env_bool("OPENWA_ENABLED", default=False)
    dry_run = _env_bool("OPENWA_DRY_RUN", default=not credentials_ready)
    return OpenWaSettings(
        enabled=enabled,
        api_url=api_url,
        api_key=api_key,
        session_id=session_id,
        timeout_seconds=timeout_seconds,
        dry_run=dry_run,
    )


def is_openwa_enabled() -> bool:
    return get_openwa_settings().enabled
