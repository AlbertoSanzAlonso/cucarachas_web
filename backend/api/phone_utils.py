"""Normalización de teléfono para deduplicar leads (España / últimos 9 dígitos)."""

from __future__ import annotations

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .models import Cliente


def normalize_phone(phone: str | None) -> str:
    """Devuelve los últimos 9 dígitos si hay suficientes; si no, todos los dígitos."""
    digits = re.sub(r"\D", "", str(phone or ""))
    if len(digits) >= 9:
        return digits[-9:]
    return digits


def default_documento_fiscal(telefono_norm: str, *, prefix: str = "WEB") -> str:
    return f"{prefix}-{telefono_norm}"[:50]


def upsert_cliente_by_phone(
    *,
    telefono: str,
    nombre: str,
    email: str = "",
    documento_fiscal: str | None = None,
) -> tuple["Cliente", bool]:
    """Crea o actualiza un Cliente identificado por teléfono normalizado."""
    from .models import Cliente

    telefono_norm = normalize_phone(telefono)
    if not telefono_norm:
        raise ValueError("telefono inválido o vacío")

    doc = (documento_fiscal or "").strip() or default_documento_fiscal(telefono_norm)
    display_phone = (telefono or "").strip() or telefono_norm

    cliente, created = Cliente.objects.get_or_create(
        telefono_norm=telefono_norm,
        defaults={
            "nombre": nombre or "Sense nom",
            "telefono": display_phone,
            "email": (email or "").strip(),
            "documento_fiscal": doc,
        },
    )
    if not created:
        updated: list[str] = []
        if nombre and cliente.nombre != nombre:
            cliente.nombre = nombre
            updated.append("nombre")
        if display_phone and cliente.telefono != display_phone:
            cliente.telefono = display_phone
            updated.append("telefono")
        new_email = (email or "").strip()
        if new_email and cliente.email != new_email:
            cliente.email = new_email
            updated.append("email")
        if updated:
            cliente.save(update_fields=updated)
    return cliente, created
