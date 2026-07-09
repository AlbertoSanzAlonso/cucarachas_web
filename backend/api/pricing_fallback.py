"""Presupuesto determinista sin LLM (histórico + catálogo)."""
from __future__ import annotations

from statistics import mean

from api.agents.models import AgentState
from api.models import Tratamiento
from api.pricing_reference import find_similar_references


def estimate_price_deterministic(agent: AgentState, lang: str = "ca") -> dict | None:
    """
    Estima rango de precio sin LLM.
    Returns dict con min, max, breakdown, months, confidence o None.
    """
    cases = find_similar_references(agent)
    if cases:
        amounts = [float(c.total_monto) for c in cases]
        label = (
            f"Referencia histórica CECSA ({len(cases)} casos similares)"
            if lang == "es"
            else f"Referència històrica CECSA ({len(cases)} casos similars)"
        )
        return {
            "min": min(amounts),
            "max": max(amounts),
            "breakdown": [label],
            "months": cases[0].garantia_meses or 12,
            "confidence": 82.0 if agent.property_type == "negoci" else 88.0,
        }

    prices = [float(t.precio_base) for t in Tratamiento.objects.all() if t.precio_base]
    if not prices:
        return None

    base = mean(prices)
    if agent.property_type == "negoci":
        pmin = round(base * 2.0, -1)
        pmax = round(base * 3.5, -1)
        label = (
            "Estimación orientativa negocio (catálogo CECSA)"
            if lang == "es"
            else "Estimació orientativa negoci (catàleg CECSA)"
        )
        confidence = 72.0
    else:
        pmin = round(base * 1.5, -1)
        pmax = round(base * 2.2, -1)
        label = (
            "Estimación orientativa (catálogo CECSA)"
            if lang == "es"
            else "Estimació orientativa (catàleg CECSA)"
        )
        confidence = 78.0

    return {
        "min": float(pmin),
        "max": float(pmax),
        "breakdown": [label],
        "months": 12,
        "confidence": confidence,
    }
