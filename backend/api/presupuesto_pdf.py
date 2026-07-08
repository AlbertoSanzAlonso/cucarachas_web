"""Generación de PDF de presupuesto CECSA."""
from __future__ import annotations

import io
from datetime import date

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from api.models import Presupuesto

BRAND_BLUE = colors.HexColor("#0080bb")
BRAND_GRAY = colors.HexColor("#3c3c3b")
BRAND_GREEN = colors.HexColor("#34d399")


def _money(value) -> str:
    return f"{float(value):,.2f} €".replace(",", "X").replace(".", ",").replace("X", ".")


def build_presupuesto_pdf(presupuesto: Presupuesto, *, issue_date: date | None = None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm,
        title=f"Pressupost CECSA #{presupuesto.id}",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "CECSATitle",
        parent=styles["Heading1"],
        fontSize=20,
        textColor=BRAND_BLUE,
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "CECSASubtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=BRAND_GRAY,
        spaceAfter=12,
    )
    body_style = ParagraphStyle(
        "CECSABody",
        parent=styles["Normal"],
        fontSize=10,
        textColor=BRAND_GRAY,
        leading=14,
    )

    cliente = presupuesto.cliente
    ubicacion = presupuesto.ubicacion
    fecha_doc = issue_date or presupuesto.created_at.date()

    story = [
        Paragraph("CECSA Control de Plagues", title_style),
        Paragraph("Ètic i Conscient · Barcelona / Catalunya", subtitle_style),
        Spacer(1, 0.3 * cm),
        Paragraph(f"<b>Pressupost nº {presupuesto.id:04d}</b>", body_style),
        Paragraph(f"Data: {fecha_doc.strftime('%d/%m/%Y')}", body_style),
        Paragraph(f"Vàlid fins: {presupuesto.validez_hasta.strftime('%d/%m/%Y')}", body_style),
        Spacer(1, 0.5 * cm),
        Paragraph("<b>Client</b>", body_style),
        Paragraph(cliente.nombre, body_style),
    ]

    if cliente.telefono:
        story.append(Paragraph(f"Telèfon: {cliente.telefono}", body_style))
    if cliente.email:
        story.append(Paragraph(f"Correu: {cliente.email}", body_style))
    if ubicacion:
        story.append(Paragraph(f"Ubicació: {ubicacion.direccion}, {ubicacion.ciudad}", body_style))

    story.append(Spacer(1, 0.6 * cm))

    table_data = [["Concepte", "Qt.", "Preu unit.", "Import"]]
    for detalle in presupuesto.detalles.all():
        importe = detalle.precio_unitario * detalle.cantidad
        table_data.append(
            [
                detalle.line_label,
                str(detalle.cantidad),
                _money(detalle.precio_unitario),
                _money(importe),
            ]
        )
    table_data.append(["", "", "TOTAL", _money(presupuesto.total_monto)])

    table = Table(table_data, colWidths=[8.5 * cm, 1.5 * cm, 3 * cm, 3 * cm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                ("ALIGN", (0, 1), (0, -1), "LEFT"),
                ("GRID", (0, 0), (-1, -2), 0.25, colors.lightgrey),
                ("LINEABOVE", (0, -1), (-1, -1), 1, BRAND_GRAY),
                ("FONTNAME", (2, -1), (-1, -1), "Helvetica-Bold"),
                ("TEXTCOLOR", (3, -1), (3, -1), BRAND_BLUE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#f8fafc")]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 0.6 * cm))

    if presupuesto.garantia_meses:
        story.append(
            Paragraph(
                f"<b>Garantia:</b> {presupuesto.garantia_meses} mesos de cobertura segons condicions del servei.",
                body_style,
            )
        )
    if presupuesto.notas:
        story.append(Spacer(1, 0.2 * cm))
        story.append(Paragraph(f"<b>Notes:</b> {presupuesto.notas}", body_style))

    story.append(Spacer(1, 0.8 * cm))
    story.append(
        Paragraph(
            "Aquest pressupost és orientatiu fins a la visita tècnica presencial. "
            "CECSA Control de Plagues · info@cucarachasbarcelona.cat · 933 309 169",
            ParagraphStyle(
                "Footer",
                parent=body_style,
                fontSize=8,
                textColor=colors.grey,
            ),
        )
    )

    doc.build(story)
    return buffer.getvalue()
