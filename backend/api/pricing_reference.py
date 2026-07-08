"""Consulta y sincronización de presupuestos históricos para el agente pricer."""
from __future__ import annotations

from decimal import Decimal
from statistics import mean

from django.db.models import QuerySet

from api.agents.models import AgentState
from api.models import Presupuesto, PresupuestoReferencia


def _normalize_property_type(raw: str | None) -> str:
    if not raw:
        return ""
    low = raw.lower()
    if any(k in low for k in ("comunitat", "comunidad", "vecinos", "fincas")):
        return "comunitat"
    if any(k in low for k in ("comercial", "negoci", "empresa", "restaurant", "hotel", "oficina", "local")):
        return "negoci"
    if any(k in low for k in ("residencial", "particular", "pis", "habitatge", "vivienda", "casa")):
        return "particular"
    return ""


def _presupuesto_total(presupuesto: Presupuesto) -> Decimal:
    if presupuesto.total_monto and presupuesto.total_monto > 0:
        return presupuesto.total_monto
    detalles = presupuesto.detalles.select_related("tratamiento").all()
    if not detalles:
        return Decimal("0")
    return sum((d.precio_unitario * d.cantidad for d in detalles), Decimal("0"))


def _breakdown_from_presupuesto(presupuesto: Presupuesto) -> list[dict]:
    rows = []
    for detalle in presupuesto.detalles.select_related("tratamiento").all():
        rows.append(
            {
                "nombre": detalle.line_label,
                "precio_unitario": float(detalle.precio_unitario),
                "cantidad": detalle.cantidad,
            }
        )
    return rows


def sync_presupuesto_to_reference(presupuesto: Presupuesto) -> PresupuestoReferencia | None:
    """Crea o actualiza un caso de referencia a partir de un Presupuesto CRM."""
    total = _presupuesto_total(presupuesto)
    if total <= 0:
        return None

    ubicacion = presupuesto.ubicacion
    defaults = {
        "pest_type": presupuesto.pest_type or "",
        "severity": presupuesto.severity or "",
        "property_type": _normalize_property_type(getattr(ubicacion, "tipo_propiedad", "")),
        "city": (ubicacion.ciudad or "").strip(),
        "zone_detail": (ubicacion.direccion or "").strip()[:100],
        "total_monto": total,
        "breakdown": _breakdown_from_presupuesto(presupuesto),
        "garantia_meses": presupuesto.garantia_meses or 12,
        "source": PresupuestoReferencia.Source.CRM,
        "notes": f"Presupuesto CRM #{presupuesto.id} — estado {presupuesto.estado}",
    }
    ref, _ = PresupuestoReferencia.objects.update_or_create(
        presupuesto=presupuesto,
        defaults=defaults,
    )
    return ref


def _apply_filters(qs: QuerySet, **filters) -> QuerySet:
    """Aplica filtros progresivos solo si dejan resultados."""
    current = qs
    for field, value in filters.items():
        if not value:
            continue
        narrowed = current.filter(**{field: value})
        if narrowed.exists():
            current = narrowed
    return current


def find_similar_references(agent: AgentState, limit: int = 8) -> list[PresupuestoReferencia]:
    """Busca presupuestos históricos parecidos al caso actual del chat."""
    qs = PresupuestoReferencia.objects.all()
    if not qs.exists():
        return []

    pest = agent.pest_type.value if agent.pest_type else ""
    severity = agent.severity.value if agent.severity else ""
    city = (agent.city or "").split(",")[0].strip()

    filtered = _apply_filters(
        qs,
        pest_type=pest,
        property_type=agent.property_type or "",
        severity=severity,
    )
    if city:
        city_qs = filtered.filter(city__icontains=city)
        if city_qs.exists():
            filtered = city_qs

    return list(filtered.order_by("-created_at")[:limit])


def _format_breakdown(breakdown: list) -> str:
    if not breakdown:
        return "sense desglossament"
    parts = []
    for row in breakdown:
        nombre = row.get("nombre", "Tractament")
        precio = row.get("precio_unitario", 0)
        qty = row.get("cantidad", 1)
        parts.append(f"{nombre} x{qty} ({precio}€)")
    return "; ".join(parts)


def format_historical_pricing(agent: AgentState, lang: str) -> str:
    """Texto para la herramienta del pricer: estadísticas + casos similares."""
    total_count = PresupuestoReferencia.objects.count()
    if total_count == 0:
        if lang == "es":
            return (
                "Aún no hay presupuestos históricos en la base de datos. "
                "Usa el catálogo oficial de tratamientos (get_official_prices) como referencia."
            )
        return (
            "Encara no hi ha pressupostos històrics a la base de dades. "
            "Fes servir el catàleg oficial de tractaments (get_official_prices) com a referència."
        )

    cases = find_similar_references(agent)
    if not cases:
        if lang == "es":
            return (
                f"Hay {total_count} presupuesto(s) histórico(s) en total, "
                "pero ninguno encaja bien con este caso. "
                "Usa la media global y el catálogo oficial como referencia."
            )
        return (
            f"Hi ha {total_count} pressupost(os) històric(s) en total, "
            "però cap encaixa bé amb aquest cas. "
            "Fes servir la mitjana global i el catàleg oficial com a referència."
        )

    amounts = [float(c.total_monto) for c in cases]
    stats_line = (
        f"Estadística de {len(cases)} caso(s) similar(es): "
        f"mín {min(amounts):.0f}€, máx {max(amounts):.0f}€, media {mean(amounts):.0f}€."
        if lang == "es"
        else f"Estadística de {len(cases)} cas(os) similar(s): "
        f"mín {min(amounts):.0f}€, màx {max(amounts):.0f}€, mitjana {mean(amounts):.0f}€."
    )

    lines = [stats_line, ""]
    header = "Casos históricos parecidos:" if lang == "es" else "Casos històrics semblants:"
    lines.append(header)
    for case in cases:
        lines.append(
            f"- {case.total_monto}€ | plaga={case.pest_type or '?'} | "
            f"severitat={case.severity or '?'} | immoble={case.property_type or '?'} | "
            f"ciutat={case.city or '?'} | garantia={case.garantia_meses}m | "
            f"desglossament: {_format_breakdown(case.breakdown)}"
        )
    lines.append("")
    lines.append(
        "Prioriza estos importes reales sobre el catálogo base cuando calcules el rango."
        if lang == "es"
        else "Prioritza aquests imports reals sobre el catàleg base quan calculis el rang."
    )
    return "\n".join(lines)
