"""Creación de presupuestos desde el formulario del admin."""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from django.db import transaction

from api.models import Cliente, Presupuesto, PresupuestoDetalle, Ubicacion


def _get_or_create_ubicacion(cliente: Cliente, direccion: str, ciudad: str) -> Ubicacion:
    direccion = (direccion or "").strip() or "Barcelona"
    ciudad = (ciudad or "").strip() or "Barcelona"
    existing = cliente.ubicaciones.filter(ciudad__iexact=ciudad).first()
    if existing:
        if direccion and existing.direccion != direccion:
            existing.direccion = direccion
            existing.save(update_fields=["direccion"])
        return existing
    return Ubicacion.objects.create(
        cliente=cliente,
        direccion=direccion,
        ciudad=ciudad,
        tipo_propiedad="Residencial",
    )


@transaction.atomic
def create_presupuesto_from_form(
    *,
    cliente_id: int,
    lineas: list[dict],
    direccion: str = "",
    ciudad: str = "Barcelona",
    fecha: date | None = None,
    validez_dias: int = 30,
    pest_type: str = "",
    severity: str = "",
    garantia_meses: int = 12,
    notas: str = "",
    estado: str = Presupuesto.Estado.ENVIADO,
) -> Presupuesto:
    cliente = Cliente.objects.get(pk=cliente_id)
    ubicacion = _get_or_create_ubicacion(cliente, direccion, ciudad)

    issue_date = fecha or date.today()
    validez_hasta = issue_date + timedelta(days=max(validez_dias, 1))

    total = Decimal("0")
    normalized_lines: list[dict] = []
    for raw in lineas:
        concepto = str(raw.get("concepto", "")).strip()
        precio = Decimal(str(raw.get("precio", "0")))
        cantidad = int(raw.get("cantidad", 1) or 1)
        if not concepto or precio <= 0 or cantidad < 1:
            continue
        line_total = precio * cantidad
        total += line_total
        normalized_lines.append(
            {"concepto": concepto, "precio": precio, "cantidad": cantidad}
        )

    if not normalized_lines:
        raise ValueError("Cal afegir almenys una línia amb concepte i preu vàlids.")

    presupuesto = Presupuesto.objects.create(
        cliente=cliente,
        ubicacion=ubicacion,
        estado=estado,
        total_monto=total,
        validez_hasta=validez_hasta,
        pest_type=(pest_type or "").strip(),
        severity=(severity or "").strip(),
        garantia_meses=garantia_meses or 12,
        notas=(notas or "").strip(),
    )

    for line in normalized_lines:
        PresupuestoDetalle.objects.create(
            presupuesto=presupuesto,
            concepto=line["concepto"],
            precio_unitario=line["precio"],
            cantidad=line["cantidad"],
        )

    return presupuesto
