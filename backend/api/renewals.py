"""Cálculo de fechas de renovación CECSA (dossier §11).

No escribe en iGEO. Siempre exige confirmación humana antes de guardar.
"""

from __future__ import annotations

from calendar import monthrange
from datetime import date, timedelta


def add_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, monthrange(year, month)[1])
    return date(year, month, day)


def shift_off_weekend(value: date) -> date:
    """Si cae en sábado/domingo, pasa al lunes siguiente."""
    while value.weekday() >= 5:
        value = value + timedelta(days=1)
    return value


def renewal_schedule(last_verified: date) -> dict[str, str | bool]:
    """Inicio/ODT/fin a partir de la última prevista verificada.

    Regla: +6 meses normalizado al día 1; segunda ODT +6; fin = último día
    del mes anterior al aniversario del nuevo inicio.
    """
    shifted = add_months(last_verified, 6)
    start = shift_off_weekend(date(shifted.year, shifted.month, 1))
    second_base = add_months(date(shifted.year, shifted.month, 1), 6)
    second = shift_off_weekend(date(second_base.year, second_base.month, 1))
    anniversary = add_months(date(shifted.year, shifted.month, 1), 12)
    if anniversary.month == 1:
        end = date(anniversary.year - 1, 12, 31)
    else:
        prev_month = anniversary.month - 1
        end = date(anniversary.year, prev_month, monthrange(anniversary.year, prev_month)[1])
    return {
        "inicio": start.isoformat(),
        "primera_odt": start.isoformat(),
        "segunda_odt": second.isoformat(),
        "fin": end.isoformat(),
        "requires_human_confirmation": True,
        "observaciones": "Revisar fechas al finalizar. No guardar en iGEO sin autorización CECSA.",
    }
