"""Confirmación de cita con datos mínimos (nom, email, telèfon, adreça) des del xat."""
from __future__ import annotations

import re

from api.cal_booking import create_cal_booking

from .models import AgentState
from .prompts import ORCHESTRATOR_MESSAGES

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _is_valid_email(value: str) -> bool:
    return bool(_EMAIL_RE.match((value or "").strip()))


def confirm_booking_from_chat(
    state: AgentState,
    *,
    slot_time: str,
    name: str,
    phone: str,
    language: str,
    address: str | None = None,
    email: str | None = None,
) -> dict:
    name = (name or "").strip()
    phone = (phone or "").strip()
    attendee_email = (email or "").strip()
    addr = (address or "").strip() or (state.city or "").strip() or "Barcelona"
    lang = language if language in ("ca", "es") else "ca"

    if not name or not phone or not _is_valid_email(attendee_email):
        return {
            "message": ORCHESTRATOR_MESSAGES[lang]["scheduler_collect_data"],
            "slots": [],
            "booking_confirmed": False,
            "booking_uid": None,
        }

    if len(addr) < 5:
        if lang == "es":
            msg = "Indica la dirección completa de la inspección (calle, número y ciudad)."
        else:
            msg = "Indica l'adreça completa de la inspecció (carrer, número i ciutat)."
        return {
            "message": msg,
            "slots": [],
            "booking_confirmed": False,
            "booking_uid": None,
        }

    state.customer_name = name
    state.city = addr.split(",")[0].strip() if "," in addr else addr[:80]
    notes_parts = list(state.technical_notes) if state.technical_notes else []
    notes_parts.append(f"Adreça inspecció: {addr}")
    notes = "; ".join(notes_parts)

    ok, msg, uid = create_cal_booking(
        slot_time=slot_time,
        attendee_name=name,
        attendee_phone=phone,
        attendee_email=attendee_email,
        address=addr,
        notes=notes,
        language=language,
    )

    return {
        "message": msg,
        "slots": [],
        "booking_confirmed": ok,
        "booking_uid": uid,
    }
