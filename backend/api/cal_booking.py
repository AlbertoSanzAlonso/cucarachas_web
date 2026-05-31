"""Creación de reservas Cal.com (compartido por agente y API de chat)."""
from __future__ import annotations

import re

import requests

from api.cal_client import CAL_API_KEY, get_cal_headers

from api.agents.config import CAL_BASE_URL, CAL_EVENT_TYPE_ID


def _email_from_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    suffix = digits[-12:] if digits else "web"
    return f"cita+{suffix}@cucarachasbarcelona.cat"


def create_cal_booking(
    *,
    slot_time: str,
    attendee_name: str,
    attendee_phone: str,
    address: str,
    attendee_email: str | None = None,
    notes: str = "",
    language: str = "ca",
) -> tuple[bool, str, str | None]:
    """
    Crea la reserva en Cal.com.
    Retorna (ok, mensaje para el usuario, booking_uid).
    """
    if not CAL_API_KEY:
        return False, "Error: CAL_API_KEY no configurada al servidor.", None

    email = (attendee_email or "").strip() or _email_from_phone(attendee_phone)
    lang = "es" if language.startswith("es") else "ca"

    try:
        payload = {
            "eventTypeId": int(CAL_EVENT_TYPE_ID),
            "start": slot_time,
            "attendee": {
                "name": attendee_name.strip(),
                "email": email,
                "phoneNumber": attendee_phone.strip(),
                "timeZone": "Europe/Madrid",
                "language": lang,
            },
            "location": {
                "value": "inPerson",
                "optionValue": address.strip() or "Barcelona",
            },
            "metadata": {"notes": notes, "source": "CECSA Bio-Assistent"},
        }

        resp = requests.post(
            f"{CAL_BASE_URL}/bookings",
            headers=get_cal_headers(),
            json=payload,
            timeout=12,
        )
        data = resp.json()

        if data.get("status") == "success":
            booking = data.get("data", {})
            uid = booking.get("uid")
            if lang == "es":
                msg = (
                    f"✅ **Cita confirmada** para el {attendee_name.strip()}. "
                    f"Te llamaremos al {attendee_phone.strip()} si hace falta algún detalle."
                )
            else:
                msg = (
                    f"✅ **Cita confirmada** per a {attendee_name.strip()}. "
                    f"Et trucarem al {attendee_phone.strip()} si cal algun detall."
                )
            return True, msg, uid

        err_msg = data.get("error", {}).get("message", resp.text[:200])
        return False, f"No s'ha pogut crear la reserva: {err_msg}", None

    except requests.RequestException as e:
        return False, f"Error de connexió creant la reserva: {e}", None
