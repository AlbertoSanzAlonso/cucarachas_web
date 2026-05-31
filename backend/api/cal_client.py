"""Cliente compartido Cal.com v2 (slots y cabeceras)."""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

import requests

CAL_SLOTS_API_VERSION = os.getenv("CAL_SLOTS_API_VERSION", os.getenv("CAL_API_VERSION", "2024-09-04"))
# Crear reservas: endpoint registrado solo en esta versión (2024-09-04 → 404 Cannot POST /v2/bookings)
CAL_BOOKING_API_VERSION = os.getenv("CAL_BOOKING_API_VERSION", "2024-08-13")
CAL_BASE_URL = os.getenv("CAL_BASE_URL", "https://api.cal.eu/v2").rstrip("/")
CAL_EVENT_TYPE_ID = os.getenv("CAL_EVENT_TYPE_ID", "278962")
CAL_API_KEY = os.getenv("CAL_API_KEY", "").strip()
CAL_SLOTS_TIMEZONE = os.getenv("CAL_SLOTS_TIMEZONE", "Europe/Madrid")
MAX_SLOTS = int(os.getenv("CAL_MAX_SLOTS", "12"))
# Ubicación por defecto: visita presencial en domicilio del cliente (no videollamada)
CAL_BOOKING_LOCATION_TYPE = os.getenv("CAL_BOOKING_LOCATION_TYPE", "attendeeAddress").strip()
CAL_BOOKING_INTEGRATION = os.getenv("CAL_BOOKING_INTEGRATION", "").strip()
DEFAULT_BOOKING_INTEGRATION = "cal-video"
CAL_EVENT_TYPES_API_VERSION = os.getenv("CAL_EVENT_TYPES_API_VERSION", "2024-06-14")

IN_PERSON_LOCATION_TYPES = ("attendeeAddress", "address", "attendeeDefined")

_cached_event_locations: list[dict[str, Any]] | None = None
_cached_locations_event_id: str | None = None


def get_cal_headers(*, for_booking: bool = False) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {CAL_API_KEY}",
        "cal-api-version": CAL_BOOKING_API_VERSION if for_booking else CAL_SLOTS_API_VERSION,
        "Content-Type": "application/json",
    }


def get_cal_booking_headers() -> dict[str, str]:
    return get_cal_headers(for_booking=True)


def _slot_start_iso(slot_item: Any) -> str | None:
    if isinstance(slot_item, str):
        return slot_item
    if isinstance(slot_item, dict):
        return slot_item.get("start") or slot_item.get("time")
    return None


def parse_slots_response(data: dict) -> list[dict[str, str]]:
    """Normaliza la respuesta de GET /v2/slots a [{date, time, slot_time}, ...]."""
    payload = data.get("data", {})
    slots_by_day: dict = {}

    if isinstance(payload, dict):
        if "slots" in payload and isinstance(payload["slots"], dict):
            slots_by_day = payload["slots"]
        else:
            slots_by_day = payload

    result: list[dict[str, str]] = []
    for day in sorted(slots_by_day.keys()):
        day_slots = slots_by_day.get(day)
        if not isinstance(day_slots, list):
            continue
        for slot_item in day_slots:
            time_str = _slot_start_iso(slot_item)
            if not time_str:
                continue
            try:
                normalized = time_str.replace("Z", "+00:00")
                if "T" in normalized:
                    dt = datetime.fromisoformat(normalized)
                else:
                    dt = datetime.fromisoformat(f"{day}T{normalized}")
                result.append({
                    "date": dt.strftime("%d/%m/%Y"),
                    "time": dt.strftime("%H:%M"),
                    "slot_time": time_str,
                })
            except ValueError:
                continue
            if len(result) >= MAX_SLOTS:
                return result
    return result


def fetch_available_slots(days_ahead: int = 7) -> tuple[bool, list[dict[str, str]] | str]:
    """
    Consulta GET /v2/slots (Cal.com API actual).
    Retorna (ok, slots) o (False, mensaje de error para el agente/usuario).
    """
    if not CAL_API_KEY:
        return False, "Error: CAL_API_KEY no configurada al servidor."

    start = datetime.now(timezone.utc).date().isoformat()
    end = (datetime.now(timezone.utc).date() + timedelta(days=days_ahead)).isoformat()

    try:
        resp = requests.get(
            f"{CAL_BASE_URL}/slots",
            params={
                "eventTypeId": CAL_EVENT_TYPE_ID,
                "start": start,
                "end": end,
                "timeZone": CAL_SLOTS_TIMEZONE,
            },
            headers=get_cal_headers(),
            timeout=8,
        )
        print(f"DEBUG Cal slots: status={resp.status_code} start={start} end={end}")

        try:
            data = resp.json()
        except ValueError:
            return False, f"Error consultant Cal.com: resposta no vàlida ({resp.status_code})"

        if resp.status_code != 200:
            err = data.get("error", data.get("message", resp.text[:200]))
            return False, f"Cal.com ha retornat {resp.status_code}: {err}"

        if data.get("status") not in (None, "success"):
            return False, "Actualment la agenda no està disponible. Prova-ho d'aquí a uns minuts."

        slots = parse_slots_response(data)
        if not slots:
            return False, "Actualment no hi ha horaris disponibles pels propers dies."

        return True, slots

    except requests.RequestException as e:
        return False, f"Error de connexió amb Cal.com: {e}"


def _fetch_event_type_locations() -> list[dict[str, Any]]:
    """Ubicaciones configuradas en el event type (GET /event-types/{id})."""
    global _cached_event_locations, _cached_locations_event_id
    if (
        _cached_event_locations is not None
        and _cached_locations_event_id == CAL_EVENT_TYPE_ID
    ):
        return _cached_event_locations

    _cached_event_locations = []
    _cached_locations_event_id = CAL_EVENT_TYPE_ID
    if not CAL_API_KEY:
        return _cached_event_locations

    try:
        resp = requests.get(
            f"{CAL_BASE_URL}/event-types/{CAL_EVENT_TYPE_ID}",
            headers={
                **get_cal_headers(),
                "cal-api-version": CAL_EVENT_TYPES_API_VERSION,
            },
            timeout=8,
        )
        if resp.status_code != 200:
            print(f"DEBUG Cal event-type: status={resp.status_code} body={resp.text[:200]}")
            return _cached_event_locations
        data = resp.json()
        event = data.get("data") if isinstance(data.get("data"), dict) else {}
        raw = event.get("locations") or []
        for loc in raw:
            if isinstance(loc, dict) and loc.get("type"):
                _cached_event_locations.append(loc)
    except requests.RequestException as e:
        print(f"DEBUG Cal event-type fetch failed: {e}")

    return _cached_event_locations


def _location_types_from_event_type() -> set[str]:
    return {str(loc.get("type")) for loc in _fetch_event_type_locations() if loc.get("type")}


def _integrations_from_event_type() -> list[str]:
    found: list[str] = []
    for loc in _fetch_event_type_locations():
        if loc.get("type") == "integration":
            integration = (loc.get("integration") or "").strip()
            if integration and integration not in found:
                found.append(integration)
    return found


def _integration_location_dict() -> dict[str, str]:
    integration = CAL_BOOKING_INTEGRATION or DEFAULT_BOOKING_INTEGRATION
    integrations = _integrations_from_event_type()
    if integration != DEFAULT_BOOKING_INTEGRATION:
        if DEFAULT_BOOKING_INTEGRATION in integrations or integration == "google-meet":
            integration = DEFAULT_BOOKING_INTEGRATION
    elif DEFAULT_BOOKING_INTEGRATION in integrations:
        integration = DEFAULT_BOOKING_INTEGRATION
    elif integrations:
        integration = integrations[0]
    return {"type": "integration", "integration": integration}


def _build_location_payload(
    loc_type: str,
    *,
    address: str,
    phone: str,
) -> dict[str, str] | None:
    if loc_type == "attendeeAddress":
        return {"type": "attendeeAddress", "address": address}
    if loc_type == "address":
        return {"type": "address"}
    if loc_type == "attendeeDefined":
        return {"type": "attendeeDefined", "location": address}
    if loc_type == "attendeePhone" and phone:
        return {"type": "attendeePhone", "phone": phone}
    if loc_type == "integration":
        return _integration_location_dict()
    return None


def resolve_booking_location(*, address: str, phone: str = "") -> dict[str, str]:
    """
    Ubicación para POST /v2/bookings.
    CECSA: visita presencial (attendeeAddress). Integration solo si CAL_BOOKING_LOCATION_TYPE=integration.
    """
    addr = (address or "Barcelona").strip()
    phone = (phone or "").strip()
    mode = (CAL_BOOKING_LOCATION_TYPE or "attendeeAddress").strip()

    if mode == "integration":
        payload = _integration_location_dict()
        print(f"DEBUG Cal booking location: {payload}")
        return payload

    allowed = _location_types_from_event_type()
    for loc_type in (*IN_PERSON_LOCATION_TYPES, "attendeePhone"):
        if allowed and loc_type not in allowed:
            continue
        payload = _build_location_payload(loc_type, address=addr, phone=phone)
        if payload:
            print(f"DEBUG Cal booking location: {payload} (allowed={allowed or 'unknown'})")
            return payload

    payload = {"type": "attendeeAddress", "address": addr}
    print(f"DEBUG Cal booking location: {payload} (fallback)")
    return payload
