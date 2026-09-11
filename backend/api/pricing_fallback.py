"""Presupuesto determinista sin LLM (histórico + catálogo)."""
from __future__ import annotations

from statistics import mean

from api.agents.models import AgentState, Severity
from api.models import Tratamiento
from api.pricing_reference import find_similar_references


def _spread_range(amounts: list[float], agent: AgentState) -> tuple[float, float]:
    """Con pocos casos o min=max, abre banda realista según severidad."""
    pmin, pmax = min(amounts), max(amounts)
    if len(amounts) >= 3 and pmax > pmin * 1.05:
        return float(pmin), float(pmax)

    mid = mean(amounts)
    sev = agent.severity
    if sev == Severity.CRITICAL:
        lo, hi = 0.85, 1.35
    elif sev == Severity.HIGH:
        lo, hi = 0.90, 1.25
    elif sev == Severity.LOW:
        lo, hi = 0.85, 1.10
    else:
        lo, hi = 0.90, 1.15
    if agent.property_type == "negoci":
        lo, hi = lo * 0.95, hi * 1.25
    return float(round(mid * lo, -1)), float(round(mid * hi, -1))


def _confidence_from_sample(n: int, agent: AgentState) -> float:
    if n >= 5:
        base = 86.0
    elif n >= 3:
        base = 78.0
    elif n == 2:
        base = 72.0
    else:
        base = 68.0
    if agent.property_type == "negoci":
        base -= 4.0
    if not (agent.chat_diagnostic or {}).get("where"):
        base -= 5.0
    return max(55.0, min(90.0, base))


def _breakdown_from_cases(cases, lang: str) -> list[str]:
    lines: list[str] = []
    best = cases[0]
    rows = best.breakdown or []
    if rows:
        for row in rows:
            nombre = row.get("nombre") or ("Tratamiento" if lang == "es" else "Tractament")
            precio = row.get("precio_unitario", 0)
            qty = row.get("cantidad", 1)
            lines.append(f"{nombre} ×{qty} ({precio}€)")
    label = (
        f"Referencia CECSA ({len(cases)} caso{'s' if len(cases) != 1 else ''} similar"
        f"{'es' if len(cases) != 1 else ''}; rango orientativo)"
        if lang == "es"
        else f"Referència CECSA ({len(cases)} cas{'os' if len(cases) != 1 else ''} similar"
        f"{'s' if len(cases) != 1 else ''}; rang orientatiu)"
    )
    lines.append(label)
    return lines


def estimate_price_deterministic(agent: AgentState, lang: str = "ca") -> dict | None:
    """
    Estima rango de precio sin LLM.
    Returns dict con min, max, breakdown, months, confidence o None.
    """
    if not agent.pest_type:
        return None

    cases = find_similar_references(agent)
    if cases:
        amounts = [float(c.total_monto) for c in cases]
        pmin, pmax = _spread_range(amounts, agent)
        return {
            "min": pmin,
            "max": pmax,
            "breakdown": _breakdown_from_cases(cases, lang),
            "months": cases[0].garantia_meses or 12,
            "confidence": _confidence_from_sample(len(cases), agent),
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
