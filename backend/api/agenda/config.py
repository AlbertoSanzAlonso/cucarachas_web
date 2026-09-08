"""Configuración de la agenda propia."""
from __future__ import annotations

import os

AGENDA_TIMEZONE = os.getenv("AGENDA_TIMEZONE", "Europe/Madrid")
AGENDA_SLOT_MINUTES = int(os.getenv("AGENDA_SLOT_MINUTES", "30"))
AGENDA_DAYS_AHEAD = int(os.getenv("AGENDA_DAYS_AHEAD", "14"))
AGENDA_MAX_DAYS = int(os.getenv("AGENDA_MAX_DAYS", "14"))

DEFAULT_STAFF_ID = "cecsa-tecnico-1"
DEFAULT_SERVICE_ID = "primera-revisio"
