"""Sugerencia y aplicación de estado CRM (lead / alta / baja)."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .models import Cliente


def suggest_crm_status(cliente: "Cliente") -> str:
    """Propone lead o alta. Nunca sugiere baja (solo manual)."""
    from .models import AgendaAppointment, Cliente, Presupuesto

    has_accepted = Presupuesto.objects.filter(
        cliente=cliente,
        estado=Presupuesto.Estado.ACEPTADO,
    ).exists()
    if has_accepted:
        return Cliente.CrmStatus.ALTA

    has_completed = AgendaAppointment.objects.filter(
        cliente=cliente,
        status=AgendaAppointment.Status.COMPLETED,
    ).exists()
    if has_completed:
        return Cliente.CrmStatus.ALTA

    return Cliente.CrmStatus.LEAD


def apply_suggested_crm_status(cliente: "Cliente") -> "Cliente":
    """Escribe el estado sugerido solo si no está bloqueado manualmente."""
    if cliente.crm_status_locked:
        return cliente

    suggested = suggest_crm_status(cliente)
    if cliente.crm_status != suggested:
        cliente.crm_status = suggested
        cliente.save(update_fields=["crm_status"])
    return cliente


def set_manual_crm_status(cliente: "Cliente", status: str) -> "Cliente":
    """Fuerza un estado y bloquea el automático."""
    from .models import Cliente

    valid = {c.value for c in Cliente.CrmStatus}
    if status not in valid:
        raise ValueError(f"crm_status inválido: {status}")

    cliente.crm_status = status
    cliente.crm_status_locked = True
    cliente.save(update_fields=["crm_status", "crm_status_locked"])
    return cliente


def unlock_crm_status(cliente: "Cliente") -> "Cliente":
    """Vuelve al modo automático y reaplica la sugerencia."""
    cliente.crm_status_locked = False
    cliente.save(update_fields=["crm_status_locked"])
    return apply_suggested_crm_status(cliente)
