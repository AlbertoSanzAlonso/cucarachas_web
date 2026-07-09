"""Persistencia de presupuestos generados por el Bio-Assistent."""
from __future__ import annotations

import uuid
from datetime import date, timedelta
from decimal import Decimal

from django.db import transaction

from api.agents.chat_intake import build_unified_diagnostic
from api.agents.models import AgentState
from api.models import Cliente, Presupuesto, PresupuestoDetalle, Ubicacion
from api.phone_utils import normalize_phone, upsert_cliente_by_phone
from api.presupuesto_service import _get_or_create_ubicacion


def _prospect_label(agent: AgentState, diagnostic: dict) -> str:
    unified = build_unified_diagnostic(agent, diagnostic)
    business = unified.get("business_type") or ""
    path = unified.get("path") or agent.property_type or ""
    if business:
        return f"Prospecte {business} (chat)"
    if path == "empresa":
        return "Prospecte negoci (chat)"
    if path in ("comunidad", "admin"):
        return "Prospecte comunitat (chat)"
    return agent.customer_name or "Prospecte chat web"


def _resolve_cliente(agent: AgentState, diagnostic: dict) -> Cliente:
    unified = build_unified_diagnostic(agent, diagnostic)
    phone = ""

    for key in ("telefono", "phone"):
        raw = unified.get(key)
        if raw:
            phone = str(raw).strip()
            break

    if not phone:
        for note in agent.technical_notes:
            low = note.lower()
            if "tel" in low or "phone" in low or "telefon" in low:
                digits = "".join(c for c in note if c.isdigit())
                if len(digits) >= 9:
                    phone = digits
                    break

    name = agent.customer_name or _prospect_label(agent, diagnostic)

    if phone and len(normalize_phone(phone)) >= 9:
        cliente, _ = upsert_cliente_by_phone(
            telefono=phone,
            nombre=name,
            email=str(unified.get("email") or "").strip(),
        )
        return cliente

    doc = f"AGENT-{uuid.uuid4().hex[:12].upper()}"
    suffix = str(uuid.uuid4().int)[-9:]
    phone_placeholder = f"6{suffix}"
    return Cliente.objects.create(
        nombre=name,
        telefono=phone_placeholder,
        telefono_norm=normalize_phone(phone_placeholder),
        email=str(unified.get("email") or "").strip(),
        documento_fiscal=doc,
    )


def _tipo_propiedad(agent: AgentState, diagnostic: dict) -> str:
    unified = build_unified_diagnostic(agent, diagnostic)
    business = str(unified.get("business_type") or "").lower()
    if business in ("hotel", "restaurante", "oficina", "tienda", "nave"):
        return business.capitalize()
    if agent.property_type == "negoci":
        return "Comercial"
    if agent.property_type == "comunitat":
        return "Comunidad"
    return "Residencial"


@transaction.atomic
def persist_agent_presupuesto(
    agent: AgentState,
    diagnostic: dict | None,
    *,
    price_min: float,
    price_max: float,
    final_price: float | None,
    breakdown: list[str],
    guarantee_months: int = 12,
    ficha_codigo: str = "",
) -> Presupuesto | None:
    """Crea un Presupuesto borrador en CRM a partir de la respuesta del pricer."""
    diagnostic = diagnostic or {}
    amount = final_price if final_price is not None else (price_min + price_max) / 2
    if amount <= 0:
        return None

    cliente = _resolve_cliente(agent, diagnostic)
    ciudad = (agent.city or "Barcelona").split(",")[0].strip() or "Barcelona"
    direccion = str(
        diagnostic.get("codigo_postal")
        or build_unified_diagnostic(agent, diagnostic).get("where")
        or build_unified_diagnostic(agent, diagnostic).get("where_empresa")
        or ""
    ).strip()
    ubicacion = _get_or_create_ubicacion(
        cliente,
        direccion=direccion,
        ciudad=ciudad,
        tipo_propiedad=_tipo_propiedad(agent, diagnostic),
    )

    notas_parts = []
    if ficha_codigo:
        notas_parts.append(f"Ficha: {ficha_codigo}")
    if final_price is None and price_min != price_max:
        notas_parts.append(f"Rang orientatiu agent: {price_min:.0f}€ – {price_max:.0f}€")
    notas = ". ".join(notas_parts)

    presupuesto = Presupuesto.objects.create(
        cliente=cliente,
        ubicacion=ubicacion,
        estado=Presupuesto.Estado.BORRADOR,
        total_monto=Decimal(str(round(amount, 2))),
        validez_hasta=date.today() + timedelta(days=30),
        pest_type=agent.pest_type.value if agent.pest_type else "",
        severity=agent.severity.value if agent.severity else "",
        garantia_meses=guarantee_months or 12,
        notas=notas,
        origen="agent",
    )

    if breakdown:
        for item in breakdown:
            concepto = str(item).strip()
            if not concepto:
                continue
            PresupuestoDetalle.objects.create(
                presupuesto=presupuesto,
                concepto=concepto[:300],
                precio_unitario=Decimal(str(round(amount / max(len(breakdown), 1), 2))),
                cantidad=1,
            )
    else:
        label = "Tractament control de plagues CECSA"
        if ficha_codigo:
            label = f"Tractament {ficha_codigo}"
        PresupuestoDetalle.objects.create(
            presupuesto=presupuesto,
            concepto=label,
            precio_unitario=Decimal(str(round(amount, 2))),
            cantidad=1,
        )

    return presupuesto


@transaction.atomic
def refresh_agent_presupuesto(
    presupuesto: Presupuesto,
    agent: AgentState,
    diagnostic: dict | None,
    *,
    price_min: float,
    price_max: float,
    final_price: float | None,
    breakdown: list[str],
    guarantee_months: int = 12,
    ficha_codigo: str = "",
) -> Presupuesto:
    """Actualitza un pressupost borrador de la mateixa sessió de xat."""
    from api.presupuesto_service import update_presupuesto_from_form

    diagnostic = diagnostic or {}
    amount = final_price if final_price is not None else (price_min + price_max) / 2
    if amount <= 0:
        return presupuesto

    lineas = []
    if breakdown:
        share = round(amount / max(len(breakdown), 1), 2)
        for item in breakdown:
            concepto = str(item).strip()
            if concepto:
                lineas.append({"concepto": concepto[:300], "precio": share, "cantidad": 1})
    else:
        label = f"Tractament {ficha_codigo}" if ficha_codigo else "Tractament control de plagues CECSA"
        lineas.append({"concepto": label, "precio": round(amount, 2), "cantidad": 1})

    notas_parts = []
    if ficha_codigo:
        notas_parts.append(f"Ficha: {ficha_codigo}")
    if final_price is None and price_min != price_max:
        notas_parts.append(f"Rang orientatiu agent: {price_min:.0f}€ – {price_max:.0f}€")
    notas = ". ".join(notas_parts)

    cliente = _resolve_cliente(agent, diagnostic)
    if presupuesto.cliente_id != cliente.id and str(presupuesto.cliente.documento_fiscal or "").startswith("AGENT-"):
        presupuesto.cliente = cliente
        presupuesto.save(update_fields=["cliente"])

    return update_presupuesto_from_form(
        presupuesto,
        lineas=lineas,
        garantia_meses=guarantee_months,
        notas=notas,
    )
