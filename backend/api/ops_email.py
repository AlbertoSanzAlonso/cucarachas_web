"""Envío de correo desde el asistente de oficina (ops). Reutiliza SMTP Django."""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass

from django.conf import settings
from django.core.mail import EmailMessage

logger = logging.getLogger(__name__)


def _env_bool(name: str, default: bool = False) -> bool:
    raw = (os.getenv(name) or "").strip().lower()
    if not raw:
        return default
    return raw in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class OpsEmailResult:
    ok: bool
    dry_run: bool
    message: str
    to_email: str = ""


def _from_email() -> str:
    return (getattr(settings, "DEFAULT_FROM_EMAIL", None) or "info@cecsaddd.com").strip()


def _is_valid_email(value: str) -> bool:
    value = (value or "").strip()
    if not value or "@" not in value or " " in value:
        return False
    local, _, domain = value.partition("@")
    return bool(local) and "." in domain


def _missing_smtp_hints() -> list[str]:
    missing: list[str] = []
    backend = (getattr(settings, "EMAIL_BACKEND", "") or "").lower()
    if "console" in backend or "locmem" in backend or "dummy" in backend:
        return missing
    if not (getattr(settings, "EMAIL_HOST", "") or "").strip():
        missing.append("EMAIL_HOST")
    if not (getattr(settings, "EMAIL_HOST_USER", "") or "").strip():
        missing.append("EMAIL_HOST_USER")
    if not (getattr(settings, "EMAIL_HOST_PASSWORD", "") or "").strip():
        missing.append("EMAIL_HOST_PASSWORD")
    return missing


def is_smtp_ready() -> bool:
    """True si el backend es consola/locmem o hay host SMTP configurado."""
    backend = (getattr(settings, "EMAIL_BACKEND", "") or "").lower()
    if "console" in backend or "locmem" in backend or "dummy" in backend:
        return True
    return bool((getattr(settings, "EMAIL_HOST", "") or "").strip())


def email_status_summary() -> str:
    backend = getattr(settings, "EMAIL_BACKEND", "") or "—"
    host = (getattr(settings, "EMAIL_HOST", "") or "").strip() or "—"
    port = getattr(settings, "EMAIL_PORT", "—")
    use_tls = getattr(settings, "EMAIL_USE_TLS", False)
    dry = _env_bool("OPS_EMAIL_DRY_RUN", default=False)
    ready = is_smtp_ready()
    missing = _missing_smtp_hints()
    base = (
        f"ready={ready} dry_run={dry} backend={backend} "
        f"host={host} port={port} tls={use_tls} from={_from_email()}"
    )
    if not ready:
        return (
            f"{base} — Email NO configurat. A Coolify cal definir almenys "
            "EMAIL_HOST (i normalment EMAIL_HOST_USER / EMAIL_HOST_PASSWORD / "
            "DEFAULT_FROM_EMAIL). Sense això el asistente no pot enviar correus."
        )
    if missing:
        return (
            f"{base} — Avís: falten {', '.join(missing)}. "
            "L'enviament pot fallar a SMTP si el servidor exigeix autenticació."
        )
    if dry:
        return f"{base} — OPS_EMAIL_DRY_RUN=true (valida però no envia de veritat)."
    return base


def send_ops_email(
    *,
    to_email: str,
    subject: str,
    body: str,
    cc: str = "",
) -> OpsEmailResult:
    """
    Envía un correo de texto plano desde el asistente de oficina.
    Si OPS_EMAIL_DRY_RUN=true, valida sin llamar a SMTP.
    """
    to_email = (to_email or "").strip()
    subject = (subject or "").strip()
    body = (body or "").strip()
    cc = (cc or "").strip()

    if not _is_valid_email(to_email):
        return OpsEmailResult(ok=False, dry_run=False, message="Cal un correu vàlid a 'to' (ex: client@exemple.com).")
    if len(subject) < 2:
        return OpsEmailResult(ok=False, dry_run=False, message="L'assumpte ha de tenir almenys 2 caràcters.", to_email=to_email)
    if len(body) < 2:
        return OpsEmailResult(ok=False, dry_run=False, message="El cos del missatge no pot estar buit.", to_email=to_email)

    cc_list: list[str] = []
    if cc:
        for part in cc.replace(";", ",").split(","):
            addr = part.strip()
            if not addr:
                continue
            if not _is_valid_email(addr):
                return OpsEmailResult(
                    ok=False,
                    dry_run=False,
                    message=f"CC invàlid: {addr}",
                    to_email=to_email,
                )
            cc_list.append(addr)

    if not is_smtp_ready():
        missing = _missing_smtp_hints() or ["EMAIL_HOST"]
        return OpsEmailResult(
            ok=False,
            dry_run=False,
            message=(
                "Email no configurat a Coolify: falten "
                + ", ".join(missing)
                + ". Defineix EMAIL_HOST / EMAIL_HOST_USER / EMAIL_HOST_PASSWORD "
                "(i DEFAULT_FROM_EMAIL) i torna a desplegar el backend."
            ),
            to_email=to_email,
        )

    dry_run = _env_bool("OPS_EMAIL_DRY_RUN", default=False)
    if dry_run:
        return OpsEmailResult(
            ok=True,
            dry_run=True,
            message=f"DRY-RUN: s'hauria enviat a {to_email} assumpte={subject!r}",
            to_email=to_email,
        )

    try:
        message = EmailMessage(
            subject=subject,
            body=body,
            from_email=_from_email(),
            to=[to_email],
            cc=cc_list or None,
        )
        message.send(fail_silently=False)
    except Exception as exc:
        logger.exception("Ops email failed to=%s", to_email)
        return OpsEmailResult(
            ok=False,
            dry_run=False,
            message=(
                f"Error SMTP: {exc}. "
                "Revisa EMAIL_HOST / USER / PASSWORD i que el from estigui autoritzat."
            ),
            to_email=to_email,
        )

    cc_note = f" cc={','.join(cc_list)}" if cc_list else ""
    return OpsEmailResult(
        ok=True,
        dry_run=False,
        message=f"Enviat a {to_email}{cc_note} des de {_from_email()}.",
        to_email=to_email,
    )
