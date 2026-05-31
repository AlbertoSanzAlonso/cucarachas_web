"""Cliente compartido Cal.com v2 (slots y cabeceras)."""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

import requests

CAL_API_VERSION = os.getenv("CAL_API_VERSION", "2024-09-04")
CAL_BASE_URL = os.getenv("CAL_BASE_URL", "https://api.cal.eu/v2").rstrip("/")
CAL_EVENT_TYPE_ID = os.getenv("CAL_EVENT_TYPE_ID", "277401")
CAL_API_KEY = os.getenv("CAL_API_KEY", "").strip()
CAL_SLOTS_TIMEZONE = os.getenv("CAL_SLOTS_TIMEZONE", "Europe/Madrid")
MAX_SLOTS = int(os.getenv("CAL_MAX_SLOTS", "12"))


def get_cal_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {CAL_API_KEY}",
        "cal-api-version": CAL_API_VERSION,
        "Content-Type": "application/json",
    }


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
