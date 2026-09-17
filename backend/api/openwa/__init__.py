"""Cliente OpenWA (WhatsApp) per al backoffice CECSA."""

from .client import (
    OpenWaClient,
    OpenWaError,
    OpenWaSendResult,
    format_contacts,
    human_whatsapp_dest,
    status_summary,
    to_whatsapp_chat_id,
)
from .config import OpenWaSettings, get_openwa_settings, is_openwa_enabled

__all__ = [
    "OpenWaClient",
    "OpenWaError",
    "OpenWaSendResult",
    "OpenWaSettings",
    "format_contacts",
    "get_openwa_settings",
    "human_whatsapp_dest",
    "is_openwa_enabled",
    "status_summary",
    "to_whatsapp_chat_id",
]
