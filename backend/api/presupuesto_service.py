"""Creación de presupuestos desde el formulario del admin."""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from django.db import transaction

from api.models import Cliente, Presupuesto, PresupuestoDetalle, Ubicacion


def _get_or_create_ubicacion(
    cliente: Cliente,
    direccion: str,
    ciudad: str,
    tipo_propiedad: str = "Residencial",
) -> Ubicacion:
    direccion = (direccion or "").strip() or "Barcelona"
    ciudad = (ciudad or "").strip() or "Barcelona"
    tipo = (tipo_propiedad or "Residencial").strip() or "Residencial"
    existing = cliente.ubicaciones.filter(ciudad__iexact=ciudad).first()
    if existing:
        if direccion and existing.direccion != direccion:
            existing.direccion = direccion
            existing.save(update_fields=["direccion"])
        if tipo and existing.tipo_propiedad != tipo:
            existing.tipo_propiedad = tipo
            existing.save(update_fields=["tipo_propiedad"])
        return existing
    return Ubicacion.objects.create(
        cliente=cliente,
        direccion=direccion,
        ciudad=ciudad,
        tipo_propiedad=tipo,
    )


@transaction.atomic
def create_presupuesto_from_form(
    *,
    cliente_id: int,
    lineas: list[dict],
    direccion: str = "",
    ciudad: str = "Barcelona",
    tipo_propiedad: str = "Residencial",
    fecha: date | None = None,
    validez_dias: int = 30,
    pest_type: str = "",
    severity: str = "",
    garantia_meses: int = 12,
    notas: str = "",
    estado: str = Presupuesto.Estado.ENVIADO,
) -> Presupuesto:
    cliente = Cliente.objects.get(pk=cliente_id)
    ubicacion = _get_or_create_ubicacion(cliente, direccion, ciudad, tipo_propiedad)

    issue_date = fecha or date.today()
    validez_hasta = issue_date + timedelta(days=max(validez_dias, 1))

    total = Decimal("0")
    normalized_lines: list[dict] = []
    for raw in lineas:
        concepto = str(raw.get("concepto", "")).strip()
        descripcion = str(raw.get("descripcion", "")).strip()
        precio = Decimal(str(raw.get("precio", "0")))
        cantidad = int(raw.get("cantidad", 1) or 1)
        if not concepto or precio <= 0 or cantidad < 1:
            continue
        line_total = precio * cantidad
        total += line_total
        normalized_lines.append(
            {
                "concepto": concepto,
                "descripcion": descripcion,
                "precio": precio,
                "cantidad": cantidad,
            }
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
            descripcion=line.get("descripcion", ""),
            precio_unitario=line["precio"],
            cantidad=line["cantidad"],
        )

    return presupuesto


@transaction.atomic
def update_presupuesto_from_form(
    presupuesto: Presupuesto,
    *,
    lineas: list[dict],
    validez_dias: int | None = None,
    garantia_meses: int | None = None,
    notas: str | None = None,
    estado: str | None = None,
    direccion: str | None = None,
    ciudad: str | None = None,
    tipo_propiedad: str | None = None,
) -> Presupuesto:
    cliente = presupuesto.cliente
    if direccion is not None or ciudad is not None or tipo_propiedad is not None:
        ubicacion = _get_or_create_ubicacion(
            cliente,
            direccion=direccion or presupuesto.ubicacion.direccion,
            ciudad=ciudad or presupuesto.ubicacion.ciudad,
            tipo_propiedad=tipo_propiedad or presupuesto.ubicacion.tipo_propiedad,
        )
        presupuesto.ubicacion = ubicacion

    total = Decimal("0")
    normalized_lines: list[dict] = []
    for raw in lineas:
        concepto = str(raw.get("concepto", "")).strip()
        descripcion = str(raw.get("descripcion", "")).strip()
        precio = Decimal(str(raw.get("precio", "0")))
        cantidad = int(raw.get("cantidad", 1) or 1)
        if not concepto or precio <= 0 or cantidad < 1:
            continue
        total += precio * cantidad
        normalized_lines.append(
            {
                "concepto": concepto,
                "descripcion": descripcion,
                "precio": precio,
                "cantidad": cantidad,
            }
        )

    if not normalized_lines:
        raise ValueError("Cal afegir almenys una línia amb concepte i preu vàlids.")

    presupuesto.detalles.all().delete()
    for line in normalized_lines:
        PresupuestoDetalle.objects.create(
            presupuesto=presupuesto,
            concepto=line["concepto"],
            descripcion=line.get("descripcion", ""),
            precio_unitario=line["precio"],
            cantidad=line["cantidad"],
        )

    presupuesto.total_monto = total
    if validez_dias is not None:
        presupuesto.validez_hasta = date.today() + timedelta(days=max(validez_dias, 1))
    if garantia_meses is not None:
        presupuesto.garantia_meses = garantia_meses
    if notas is not None:
        presupuesto.notas = notas.strip()
    if estado is not None:
        presupuesto.estado = estado

    presupuesto.save()
    return presupuesto
