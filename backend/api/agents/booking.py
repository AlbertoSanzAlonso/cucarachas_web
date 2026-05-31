"""Confirmación de cita con datos mínimos (nom + telèfon) des del xat."""
from __future__ import annotations

from api.cal_booking import create_cal_booking

from .models import AgentState
from .prompts import ORCHESTRATOR_MESSAGES


def confirm_booking_from_chat(
    state: AgentState,
    *,
    slot_time: str,
    name: str,
    phone: str,
    language: str,
) -> dict:
    name = (name or "").strip()
    phone = (phone or "").strip()
    if not name or not phone:
        lang = language if language in ("ca", "es") else "ca"
        return {
            "message": ORCHESTRATOR_MESSAGES[lang]["scheduler_collect_data"],
            "slots": [],
            "booking_confirmed": False,
            "booking_uid": None,
        }

    state.customer_name = name
    address = state.city or "Barcelona"
    notes = "; ".join(state.technical_notes) if state.technical_notes else ""

    ok, msg, uid = create_cal_booking(
        slot_time=slot_time,
        attendee_name=name,
        attendee_phone=phone,
        address=address,
        notes=notes,
        language=language,
    )

    return {
        "message": msg,
        "slots": [],
        "booking_confirmed": ok,
        "booking_uid": uid,
    }
