"""Correos de confirmación de cita (agenda propia)."""
from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
from django.core.mail import EmailMessage

logger = logging.getLogger(__name__)

_WEEKDAYS = {
    "ca": ("dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte", "diumenge"),
    "es": ("lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"),
}
_MONTHS = {
    "ca": (
        "gener", "febrer", "març", "abril", "maig", "juny",
        "juliol", "agost", "setembre", "octubre", "novembre", "desembre",
    ),
    "es": (
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ),
}


def _lang(locale: str | None) -> str:
    return "es" if (locale or "").startswith("es") else "ca"


def _format_when(day, start_time: str, lang: str) -> str:
    weekdays = _WEEKDAYS[lang]
    months = _MONTHS[lang]
    label = f"{weekdays[day.weekday()]} {day.day} de {months[day.month - 1]} de {day.year}"
    return f"{label} a les {start_time}" if lang == "ca" else f"{label} a las {start_time}"


def _client_subject(lang: str) -> str:
    if lang == "es":
        return "Confirmación de cita — CECSA Control de Plagas"
    return "Confirmació de cita — CECSA Control de Plagues"


def _client_body(apt: Any, lang: str) -> str:
    when = _format_when(apt.date, apt.start_time, lang)
    name = (apt.customer_name or "").strip() or ("client" if lang == "ca" else "cliente")
    address = (apt.customer_address or "").strip() or "—"
    phone = (apt.customer_phone or "").strip() or "—"

    if lang == "es":
        return (
            f"Hola {name},\n\n"
            f"Tu cita con CECSA Control de Plagas está confirmada.\n\n"
            f"Fecha y hora: {when}\n"
            f"Dirección de la visita: {address}\n"
            f"Teléfono de contacto: {phone}\n\n"
            f"La visita es presencial. Si necesitas cambiar o cancelar la cita, "
            f"llámanos al 933 309 169.\n\n"
            f"CECSA Control de Plagas\n"
            f"Ético y Consciente\n"
            f"info@cucarachasbarcelona.cat · 933 309 169\n"
            f"https://cucarachasbarcelona.cat"
        )

    return (
        f"Hola {name},\n\n"
        f"La teva cita amb CECSA Control de Plagues està confirmada.\n\n"
        f"Data i hora: {when}\n"
        f"Adreça de la visita: {address}\n"
        f"Telèfon de contacte: {phone}\n\n"
        f"La visita és presencial. Si necessites canviar o cancel·lar la cita, "
        f"truca'ns al 933 309 169.\n\n"
        f"CECSA Control de Plagues\n"
        f"Ètic i Conscient\n"
        f"info@cucarachasbarcelona.cat · 933 309 169\n"
        f"https://cucarachasbarcelona.cat"
    )


def _notify_email() -> str:
    return (
        getattr(settings, "BOOKING_NOTIFY_EMAIL", None)
        or getattr(settings, "DEFAULT_FROM_EMAIL", "")
        or "info@cucarachasbarcelona.cat"
    ).strip()


def _from_email() -> str:
    return getattr(settings, "DEFAULT_FROM_EMAIL", "info@cucarachasbarcelona.cat")


def send_booking_confirmation_email(apt: Any) -> bool:
    """
    Envía confirmación al cliente y aviso interno al equipo.
    No lanza si falla (la cita ya está creada); devuelve True si el cliente recibió el correo.
    """
    to_email = (getattr(apt, "customer_email", None) or "").strip()
    if not to_email or "@" not in to_email:
        logger.warning("Cita %s sense email de client; no s'envia confirmació.", getattr(apt, "id", "?"))
        return False

    lang = _lang(getattr(apt, "locale", None))
    from_email = _from_email()
    notify = _notify_email()
    client_ok = False

    try:
        EmailMessage(
            subject=_client_subject(lang),
            body=_client_body(apt, lang),
            from_email=from_email,
            to=[to_email],
        ).send(fail_silently=False)
        client_ok = True
    except Exception:
        logger.exception(
            "Error enviant confirmació de cita %s a %s",
            getattr(apt, "id", "?"),
            to_email,
        )

    if notify and notify.lower() != to_email.lower():
        try:
            when = _format_when(apt.date, apt.start_time, "ca")
            EmailMessage(
                subject=f"Nova cita: {apt.customer_name} — {when}",
                body=(
                    f"S'ha confirmat una nova cita des del xat.\n\n"
                    f"Client: {apt.customer_name}\n"
                    f"Email: {to_email}\n"
                    f"Telèfon: {apt.customer_phone}\n"
                    f"Adreça: {apt.customer_address or '—'}\n"
                    f"Data/hora: {when}\n"
                    f"Origen: {apt.origin or '—'}\n"
                    f"ID: {apt.id}\n"
                ),
                from_email=from_email,
                to=[notify],
            ).send(fail_silently=False)
        except Exception:
            logger.exception("Error enviant avís intern de cita %s", getattr(apt, "id", "?"))

    return client_ok
