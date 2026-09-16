"""Envío de presupuestos por correo electrónico."""
from __future__ import annotations

from django.conf import settings
from django.core.mail import EmailMessage

from api.models import Presupuesto
from api.presupuesto_pdf import build_presupuesto_pdf


def send_presupuesto_email(
    presupuesto: Presupuesto,
    *,
    to_email: str,
    subject: str | None = None,
    body: str | None = None,
) -> None:
    to_email = (to_email or "").strip()
    if not to_email or "@" not in to_email:
        raise ValueError("Cal indicar un correu electrònic vàlid.")

    cliente = presupuesto.cliente
    codigo = f"{presupuesto.id:04d}"
    default_subject = f"Pressupost CECSA #{codigo}"
    default_body = (
        f"Benvolgut/da {cliente.nombre},\n\n"
        f"Adjuntem el pressupost #{codigo} de CECSA Control de Plagues.\n\n"
        f"Quedem a la vostra disposició per a qualsevol dubte.\n\n"
        f"CECSA Control de Plagues\n"
        f"info@cucarachasbarcelona.cat · 933 309 169"
    )

    pdf_bytes = build_presupuesto_pdf(presupuesto)
    filename = f"pressupost-cecsa-{codigo}.pdf"

    message = EmailMessage(
        subject=subject or default_subject,
        body=body or default_body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "info@cucarachasbarcelona.cat"),
        to=[to_email],
    )
    message.attach(filename, pdf_bytes, "application/pdf")
    message.send(fail_silently=False)

    if presupuesto.estado == Presupuesto.Estado.BORRADOR:
        presupuesto.estado = Presupuesto.Estado.ENVIADO
        presupuesto.save(update_fields=["estado"])
