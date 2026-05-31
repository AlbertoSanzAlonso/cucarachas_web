"""Fusiona datos del formulario de diagnóstico en AgentState (sesión)."""
from __future__ import annotations

import re
from typing import Any

from .models import AgentState, Intent

_EMPTY = frozenset({"no especificat", "no especificado", "cap", "ninguna", "-", ""})


def _clean(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if text.lower() in _EMPTY:
        return None
    return text


def merge_diagnostic_into_state(state: AgentState, diagnostic: dict | None) -> AgentState:
    """Aplica respuestas del wizard; suficiente para agendar sin volver a preguntar."""
    if not diagnostic:
        return state

    where = _clean(diagnostic.get("where")) or _clean(diagnostic.get("where_empresa"))
    if where:
        state.city = where.split(",")[0].strip()

    who = _clean(diagnostic.get("who"))
    if who:
        low = who.lower()
        if "empresa" in low or "negoci" in low or "comunitat" in low:
            state.property_type = "negoci" if "empresa" in low or "negoci" in low else "comunitat"
        else:
            state.property_type = "particular"

    notes: list[str] = []
    for key, label in (
        ("path", "Flux"),
        ("who", "Client"),
        ("quantity", "Freqüència"),
        ("level", "Nivell"),
        ("since", "Des de"),
        ("urgency", "Urgència"),
        ("sanitary_risk", "Risc sanitari"),
        ("sensitive", "Sensibilitat"),
        ("certificate", "Certificat"),
        ("extra_info", "Extra"),
    ):
        val = _clean(diagnostic.get(key))
        if val:
            notes.append(f"{label}: {val}")

    if notes:
        merged = list(dict.fromkeys([*state.technical_notes, *notes]))
        state.technical_notes = merged[:25]

    if not state.city:
        state.city = "Barcelona"

    return state


def apply_diagnostic_from_message(state: AgentState, message: str) -> AgentState:
    """Parseja prefix [Diagnòstic: ...] o bloc del prompt de veredicte."""
    block = re.search(r"\[Diagnòstic:[^\]]+\]", message, re.IGNORECASE)
    if block:
        text = block.group(0)
        zm = re.search(r"zona:\s*([^,\]]+)", text, re.IGNORECASE)
        if zm:
            zone = _clean(zm.group(1))
            if zone:
                state.city = zone.split(",")[0].strip()

    if "he completat el diagnòstic" in message.lower() or "he completado el diagnóstico" in message.lower():
        for line in message.splitlines():
            low = line.lower()
            if "localització:" in low or "localización:" in low:
                loc = _clean(line.split(":", 1)[-1])
                if loc:
                    state.city = loc.split(",")[0].strip()
            elif "tipus de client:" in low or "tipo de cliente:" in low:
                merge_diagnostic_into_state(state, {"who": line.split(":", 1)[-1].strip()})

    if not state.city:
        state.city = "Barcelona"

    return state
