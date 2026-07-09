"""Generación de PDF de presupuesto CECSA (formato oficial)."""
from __future__ import annotations

import io
from datetime import date
from decimal import Decimal

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from api.models import Presupuesto
from api.presupuesto_templates import COMPANY, IVA_RATE, SERVICE_CLAUSES, calc_iva, calc_total_con_iva

BRAND_BLUE = colors.HexColor("#0080bb")
BRAND_GRAY = colors.HexColor("#3c3c3b")
BRAND_LIGHT = colors.HexColor("#f8fafc")


def _money(value) -> str:
    return f"{float(value):,.2f} €".replace(",", "X").replace(".", ",").replace("X", ".")


def _presupuesto_codigo(presupuesto: Presupuesto) -> str:
    return f"{presupuesto.id}P"


def build_presupuesto_pdf(presupuesto: Presupuesto, *, issue_date: date | None = None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.2 * cm,
        bottomMargin=1.5 * cm,
        title=f"Presupuesto CECSA #{_presupuesto_codigo(presupuesto)}",
    )

    styles = getSampleStyleSheet()
    banner_style = ParagraphStyle(
        "Banner",
        parent=styles["Normal"],
        fontSize=7,
        textColor=BRAND_GRAY,
        alignment=TA_CENTER,
        leading=9,
    )
    header_style = ParagraphStyle(
        "Header",
        parent=styles["Normal"],
        fontSize=8,
        textColor=BRAND_GRAY,
        alignment=TA_CENTER,
        leading=10,
    )
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Heading1"],
        fontSize=14,
        textColor=BRAND_BLUE,
        alignment=TA_CENTER,
        spaceAfter=2,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=BRAND_GRAY,
        alignment=TA_CENTER,
        spaceAfter=8,
    )
    section_style = ParagraphStyle(
        "Section",
        parent=styles["Normal"],
        fontSize=9,
        textColor=BRAND_BLUE,
        fontName="Helvetica-Bold",
        spaceBefore=8,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=9,
        textColor=BRAND_GRAY,
        leading=12,
    )
    desc_style = ParagraphStyle(
        "Desc",
        parent=body_style,
        fontSize=8,
        leading=11,
        leftIndent=4,
        textColor=colors.HexColor("#555555"),
    )
    small_style = ParagraphStyle(
        "Small",
        parent=body_style,
        fontSize=7,
        leading=9,
        textColor=colors.grey,
    )
    clause_style = ParagraphStyle(
        "Clause",
        parent=body_style,
        fontSize=7,
        leading=9,
        textColor=BRAND_GRAY,
    )

    cliente = presupuesto.cliente
    ubicacion = presupuesto.ubicacion
    fecha_doc = issue_date or presupuesto.created_at.date()
    codigo = _presupuesto_codigo(presupuesto)

    story = [
        Paragraph(COMPANY["services_banner"], banner_style),
        Paragraph(
            f"REGISTRO OFICIAL DE ESTABLECIMIENTOS DE SERVICIOS PLAGUICIDAS {COMPANY['roesp']}",
            header_style,
        ),
        Paragraph(COMPANY["mercantil"], header_style),
        Spacer(1, 0.4 * cm),
        Paragraph(f"Presupuesto Nº {codigo}", title_style),
        Paragraph("Control de Plagas", subtitle_style),
        Paragraph(
            f"Fecha: {fecha_doc.strftime('%d/%m/%Y')}",
            ParagraphStyle("Date", parent=body_style, alignment=TA_RIGHT),
        ),
        Spacer(1, 0.4 * cm),
        Paragraph("CLIENTE", section_style),
        Paragraph(cliente.nombre, body_style),
    ]

    if ubicacion:
        story.append(Paragraph(f"{ubicacion.direccion}", body_style))
        story.append(Paragraph(f"{ubicacion.ciudad} · Barcelona", body_style))
    if cliente.telefono:
        story.append(Paragraph(f"Teléfonos: {cliente.telefono}", body_style))
    if cliente.email:
        story.append(Paragraph(f"Correo: {cliente.email}", body_style))

    if ubicacion:
        story.append(Spacer(1, 0.3 * cm))
        story.append(Paragraph("INSTALACIONES DONDE SE REALIZA EL SERVICIO", section_style))
        story.append(Paragraph(ubicacion.direccion, body_style))
        story.append(
            Paragraph(
                f"Dirección: {ubicacion.direccion} — {ubicacion.ciudad} (Barcelona)",
                body_style,
            )
        )

    story.append(Spacer(1, 0.4 * cm))

    base_imponible = Decimal("0")
    line_rows: list[list] = []
    line_descriptions: list[str] = []

    detalles = list(presupuesto.detalles.all())
    sede = ubicacion.direccion if ubicacion else ""

    for detalle in detalles:
        importe_linea = detalle.precio_unitario * detalle.cantidad
        impuesto_linea = calc_iva(importe_linea)
        base_imponible += importe_linea
        line_rows.append(
            [
                Paragraph(detalle.line_label, body_style),
                Paragraph(sede[:40] if sede else "—", body_style),
                str(detalle.cantidad),
                _money(detalle.precio_unitario),
                _money(impuesto_linea),
                _money(importe_linea),
            ]
        )
        if detalle.descripcion.strip():
            line_descriptions.append(detalle.descripcion.strip())

    table_header = [
        "Artículos / Servicios",
        "Sede",
        "Cantidad",
        "Imp. unitario",
        "Impuesto",
        "Total sin IVA",
    ]
    table_data = [table_header] + line_rows

    col_widths = [6.5 * cm, 3 * cm, 1.2 * cm, 2.2 * cm, 2 * cm, 2.5 * cm]
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 7),
                ("FONTSIZE", (0, 1), (-1, -1), 8),
                ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
                ("ALIGN", (0, 0), (1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_LIGHT]),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(table)

    for desc in line_descriptions:
        story.append(Spacer(1, 0.15 * cm))
        for paragraph in desc.split("\n\n"):
            if paragraph.strip():
                story.append(Paragraph(paragraph.strip(), desc_style))

    iva_total = calc_iva(base_imponible)
    total_con_iva = calc_total_con_iva(base_imponible)

    story.append(Spacer(1, 0.4 * cm))
    totals_data = [
        ["Totales:", "Impuestos", "Base imponible", "Impuesto", "Total"],
        [
            "",
            "IVA Regular",
            _money(base_imponible),
            _money(iva_total),
            _money(total_con_iva),
        ],
    ]
    totals_table = Table(totals_data, colWidths=[3 * cm, 3.5 * cm, 3.5 * cm, 3 * cm, 3.5 * cm])
    totals_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("LINEABOVE", (0, 1), (-1, 1), 0.5, BRAND_GRAY),
                ("FONTNAME", (4, 1), (4, 1), "Helvetica-Bold"),
                ("TEXTCOLOR", (4, 1), (4, 1), BRAND_BLUE),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(totals_table)

    if presupuesto.garantia_meses:
        story.append(Spacer(1, 0.3 * cm))
        story.append(
            Paragraph(
                f"Garantía: {presupuesto.garantia_meses} meses de cobertura según condiciones del servicio.",
                body_style,
            )
        )

    if presupuesto.notas:
        story.append(Spacer(1, 0.3 * cm))
        story.append(Paragraph("DATOS DE PAGO", section_style))
        story.append(Paragraph(presupuesto.notas.replace("\n", "<br/>"), body_style))

    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph("CONDICIONES / ANEXOS / CLÁUSULAS", section_style))
    for clause_block in SERVICE_CLAUSES.split("\n"):
        if clause_block.strip():
            story.append(Paragraph(clause_block.strip(), clause_style))

    story.append(Spacer(1, 0.6 * cm))
    story.append(
        Paragraph(
            f"{COMPANY['legal_name']} {COMPANY['address']}, CIF: {COMPANY['cif']} "
            f"Tel.: {COMPANY['phone']} · WhatsApp: {COMPANY['whatsapp']} "
            f"{COMPANY['email']} · {COMPANY['web']}",
            small_style,
        )
    )
    story.append(
        Paragraph(
            f"Válido hasta: {presupuesto.validez_hasta.strftime('%d/%m/%Y')} · "
            f"IVA {int(IVA_RATE * 100)}% · CECSA Control de Plagas — Ético y Consciente",
            small_style,
        )
    )

    doc.build(story)
    return buffer.getvalue()
