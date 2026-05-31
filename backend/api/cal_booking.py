"""Creación de reservas Cal.com (compartido por agente y API de chat)."""
from __future__ import annotations

import re
from datetime import datetime, timezone

import requests

from api.cal_client import (
    CAL_API_KEY,
    CAL_BASE_URL,
    CAL_EVENT_TYPE_ID,
    get_cal_booking_headers,
    resolve_booking_location,
)


def _email_from_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    suffix = digits[-12:] if digits else "web"
    return f"cita+{suffix}@cucarachasbarcelona.cat"


def _slot_start_utc_iso(slot_time: str) -> str:
    """Cal.com booking API espera start en UTC (ISO 8601)."""
    normalized = slot_time.strip().replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(normalized)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except ValueError:
        return slot_time


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
    Crea la reserva en Cal.com API v2 (cal-api-version 2024-08-13).
    Retorna (ok, mensaje para el usuario, booking_uid).
    """
    if not CAL_API_KEY:
        return False, "Error: CAL_API_KEY no configurada al servidor.", None

    email = (attendee_email or "").strip() or _email_from_phone(attendee_phone)
    lang = "es" if language.startswith("es") else "ca"
    start_utc = _slot_start_utc_iso(slot_time)
    addr = (address or "Barcelona").strip()
    note_parts = [p for p in ((notes or "").strip(), f"Adreça: {addr}") if p]
    combined_notes = " | ".join(note_parts)[:500]

    payload = {
        "eventTypeId": int(CAL_EVENT_TYPE_ID),
        "start": start_utc,
        "attendee": {
            "name": attendee_name.strip(),
            "email": email,
            "phoneNumber": attendee_phone.strip(),
            "timeZone": "Europe/Madrid",
            "language": lang,
        },
        "location": resolve_booking_location(address=addr, phone=attendee_phone.strip()),
        "metadata": {
            "notes": combined_notes,
            "address": addr[:500],
            "source": "CECSA Bio-Assistent",
        },
    }

    try:
        resp = requests.post(
            f"{CAL_BASE_URL}/bookings",
            headers=get_cal_booking_headers(),
            json=payload,
            timeout=12,
        )
        print(f"DEBUG Cal booking: status={resp.status_code} start={start_utc}")

        try:
            data = resp.json()
        except ValueError:
            return False, f"No s'ha pogut crear la reserva (resposta invàlida {resp.status_code})", None

        if resp.status_code in (200, 201) and data.get("status") == "success":
            booking = data.get("data") or {}
            if isinstance(booking, list):
                booking = booking[0] if booking else {}
            uid = booking.get("uid") if isinstance(booking, dict) else None
            if lang == "es":
                msg = (
                    f"✅ **Cita confirmada** (visita presencial) para {attendee_name.strip()} "
                    f"en {addr}. Te llamaremos al {attendee_phone.strip()} si hace falta algún detalle."
                )
            else:
                msg = (
                    f"✅ **Cita confirmada** (visita presencial) per a {attendee_name.strip()} "
                    f"a {addr}. Et trucarem al {attendee_phone.strip()} si cal algun detall."
                )
            return True, msg, uid

        err = data.get("error") if isinstance(data.get("error"), dict) else {}
        err_msg = err.get("message") or data.get("message") or resp.text[:300]
        err_lower = str(err_msg).lower()
        if "location" in err_lower or "attendeeaddress" in err_lower.replace("_", ""):
            if lang == "es":
                hint = (
                    "El tipo de cita en Cal.com debe tener ubicación «En persona / dirección del cliente» "
                    f"activada (event type {CAL_EVENT_TYPE_ID}), no solo videollamada."
                )
            else:
                hint = (
                    f"El tipus de cita a Cal.com ha de tenir ubicació «Presencial / adreça de l'assistent» "
                    f"activada (event type {CAL_EVENT_TYPE_ID}), no només videotrucada."
                )
            return False, f"No s'ha pogut crear la reserva: {err_msg}. {hint}", None
        return False, f"No s'ha pogut crear la reserva: {err_msg}", None

    except requests.RequestException as e:
        return False, f"Error de connexió creant la reserva: {e}", None
