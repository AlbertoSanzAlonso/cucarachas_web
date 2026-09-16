"""Configuración iGEO PDI desde variables de entorno (sin secretos en código)."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class IgeoPdiSettings:
    enabled: bool
    host: str
    port: int
    user: str
    password: str
    vhost: str
    use_ssl: bool
    default_delegacion: str
    default_gestor: str
    default_idioma: str
    default_actividad: str
    default_zona_comercial: str
    dry_run: bool

    @property
    def credentials_ready(self) -> bool:
        return bool(self.host and self.user and self.password and self.vhost)

    @property
    def amqp_url(self) -> str:
        scheme = "amqps" if self.use_ssl else "amqp"
        # vhost must be URL-encoded if it contains /
        from urllib.parse import quote

        vhost = quote(self.vhost, safe="")
        return (
            f"{scheme}://{quote(self.user, safe='')}:{quote(self.password, safe='')}"
            f"@{self.host}:{self.port}/{vhost}"
        )


def _env_bool(name: str, default: bool = False) -> bool:
    raw = (os.getenv(name) or "").strip().lower()
    if not raw:
        return default
    return raw in ("1", "true", "yes", "on")


def get_igeo_settings() -> IgeoPdiSettings:
    host = (os.getenv("IGEO_PDI_HOST") or "").strip()
    # Management UI uses 15671; AMQP is typically 5671 (TLS) / 5672
    port = int(os.getenv("IGEO_PDI_PORT") or ("5671" if host else "5672"))
    use_ssl = _env_bool("IGEO_PDI_SSL", default=port == 5671)
    user = (os.getenv("IGEO_PDI_USER") or "").strip()
    password = (os.getenv("IGEO_PDI_PASSWORD") or "").strip()
    vhost = (os.getenv("IGEO_PDI_VHOST") or "").strip()
    credentials_ready = bool(host and user and password and vhost)
    enabled_flag = _env_bool("IGEO_PDI_ENABLED", default=False)
    # Dry-run if explicitly set, or if "enabled" but credentials missing
    dry_run = _env_bool("IGEO_PDI_DRY_RUN", default=not credentials_ready)

    return IgeoPdiSettings(
        enabled=enabled_flag,
        host=host,
        port=port,
        user=user,
        password=password,
        vhost=vhost,
        use_ssl=use_ssl,
        default_delegacion=(os.getenv("IGEO_DEFAULT_DELEGACION") or "").strip(),
        default_gestor=(os.getenv("IGEO_DEFAULT_GESTOR") or "").strip(),
        default_idioma=(os.getenv("IGEO_DEFAULT_IDIOMA") or "es_ES").strip() or "es_ES",
        default_actividad=(os.getenv("IGEO_DEFAULT_ACTIVIDAD") or "").strip(),
        default_zona_comercial=(os.getenv("IGEO_DEFAULT_ZONA_COMERCIAL") or "").strip(),
        dry_run=dry_run,
    )


def is_igeo_enabled() -> bool:
    """True when sync should attempt publish (live or dry-run logging)."""
    settings = get_igeo_settings()
    return settings.enabled
