"""Agenda propia CECSA (sustituye Cal.com)."""

from .config import AGENDA_DAYS_AHEAD, AGENDA_SLOT_MINUTES, AGENDA_TIMEZONE
from .engine import (
    appointment_to_public,
    build_day_schedule,
    create_appointment,
    fetch_available_slots,
    get_default_service,
    get_default_staff,
    get_free_slots_for_staff,
)

__all__ = [
    "AGENDA_DAYS_AHEAD",
    "AGENDA_SLOT_MINUTES",
    "AGENDA_TIMEZONE",
    "appointment_to_public",
    "build_day_schedule",
    "create_appointment",
    "fetch_available_slots",
    "get_default_service",
    "get_default_staff",
    "get_free_slots_for_staff",
]
