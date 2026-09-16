"""Cliente HTTP del contenedor OpenWA (misma API que Superpelu / rmyndharis)."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import Any

import requests

from .config import OpenWaSettings, get_openwa_settings

logger = logging.getLogger(__name__)

MAX_WHATSAPP_CHARS = 3500


@dataclass(frozen=True)
class OpenWaSendResult:
    ok: bool
    dry_run: bool
    chat_id: str
    message_id: str | None
    message: str


class OpenWaError(ValueError):
    """Teléfono o mensaje no válidos antes de llamar al contenedor."""


def to_whatsapp_chat_id(phone: str) -> str:
    """Telèfon ES o internacional (E.164) → chatId OpenWA (`34600…@c.us`).

    Accepta:
    - Mòbil ES (9 dígits 6/7, amb o sense +34 / 0034)
    - Número internacional amb prefix de país (10–15 dígits, o amb + / 00)
    - chatId ja formatat (`…@c.us`)
    """
    raw = (phone or "").strip()
    if not raw:
        raise OpenWaError("Cal un telèfon (mòbil ES o internacional amb prefix de país).")

    # Ja és un chatId OpenWA / WhatsApp.
    if "@" in raw:
        local, _, host = raw.partition("@")
        digits = re.sub(r"\D", "", local)
        if host.lower() in ("c.us", "s.whatsapp.net") and 8 <= len(digits) <= 15:
            return f"{digits}@c.us"
        raise OpenWaError(f"chatId WhatsApp no vàlid: {raw}")

    digits = re.sub(r"\D", "", raw)
    if digits.startswith("00"):
        digits = digits[2:]
    if not digits:
        raise OpenWaError("Cal un telèfon (mòbil ES o internacional amb prefix de país).")

    # Mòbil espanyol nacional (9 dígits).
    if len(digits) == 9:
        if digits[0] in "67":
            return f"34{digits}@c.us"
        raise OpenWaError(
            "Aquest número de 9 dígits no és un mòbil ES (ha de començar per 6 o 7). "
            "Si és internacional, indica el prefix de país (ex. +54…, +52…)."
        )

    # Mòbil espanyol amb prefix 34.
    if digits.startswith("34") and len(digits) == 11 and digits[2] in "67":
        return f"{digits}@c.us"

    # Internacional E.164 (amb prefix de país). No afegim 34 automàticament.
    if 10 <= len(digits) <= 15:
        if digits.startswith("34") and len(digits) == 11 and digits[2] not in "67":
            raise OpenWaError(
                "El número +34 no sembla un mòbil (ha de començar per 6 o 7 després del 34)."
            )
        return f"{digits}@c.us"

    raise OpenWaError(
        "Telèfon no vàlid per a WhatsApp. Usa mòbil ES (9 dígits 6/7) "
        "o internacional amb prefix de país (+… / 00…)."
    )


class OpenWaClient:
    def __init__(self, settings: OpenWaSettings | None = None):
        self.settings = settings or get_openwa_settings()

    def _headers(self) -> dict[str, str]:
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-API-Key": self.settings.api_key,
        }

    def _url(self, path: str) -> str:
        suffix = path if path.startswith("/") else f"/{path}"
        return f"{self.settings.api_url}{suffix}"

    def _request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> Any:
        url = self._url(path)
        try:
            response = requests.request(
                method,
                url,
                headers=self._headers(),
                json=payload,
                params=params,
                timeout=self.settings.timeout_seconds,
            )
        except requests.exceptions.ConnectionError as exc:
            raise RuntimeError(
                f"No es pot connectar a OpenWA ({url}): comprova OPENWA_API_URL i la xarxa Docker Coolify."
            ) from exc
        except requests.exceptions.Timeout as exc:
            raise RuntimeError(
                f"Timeout OpenWA ({url}) després de {self.settings.timeout_seconds}s."
            ) from exc
        except requests.exceptions.RequestException as exc:
            raise RuntimeError(f"Error HTTP OpenWA ({url}): {exc}") from exc
        try:
            body = response.json()
        except ValueError:
            body = {}
        if not response.ok:
            err = ""
            if isinstance(body, dict):
                nested = body.get("error")
                if isinstance(nested, dict):
                    err = str(nested.get("message") or "")
                err = err or str(body.get("message") or "")
            raise RuntimeError(f"OpenWA {response.status_code}: {err or response.reason}")
        if isinstance(body, dict) and body.get("success") is False:
            nested = body.get("error")
            msg = nested.get("message") if isinstance(nested, dict) else body.get("message")
            raise RuntimeError(str(msg or "OpenWA request failed"))
        if isinstance(body, dict) and "data" in body:
            return body.get("data")
        return body

    def session_status(self) -> dict[str, Any] | None:
        sid = self.settings.session_id
        if not sid:
            return None
        data = self._request("GET", f"/sessions/{sid}")
        return data if isinstance(data, dict) else None

    def require_session_ready(self) -> dict[str, Any]:
        """Falla ràpid si la sessió no està linked / ready (evita timeouts llargs al enviar)."""
        if not self.settings.enabled:
            raise OpenWaError("OPENWA_ENABLED=false.")
        if not self.settings.credentials_ready:
            raise OpenWaError("Falten OPENWA_API_KEY / OPENWA_SESSION_ID.")
        session = self.session_status()
        if not session:
            raise OpenWaError(
                f"Sessió no trobada (OPENWA_SESSION_ID={self.settings.session_id}). "
                "Crea/inicia la sessió a OpenWA i actualitza l'env."
            )
        status = str(session.get("status") or "").strip().lower()
        if status != "ready":
            raise OpenWaError(
                f"Sessió WhatsApp no ready (status={status or '—'}). "
                "Cal start + escanejar QR de nou després d'un redeploy sense volum /app/data."
            )
        return session

    def list_contacts(self, *, limit: int = 500, offset: int = 0) -> list[dict[str, Any]]:
        """Agenda de contactos WhatsApp de la sesión (solo lectura)."""
        self.require_session_ready()
        sid = self.settings.session_id
        clamped = max(1, min(int(limit), 1000))
        off = max(0, int(offset))
        data = self._request(
            "GET",
            f"/sessions/{sid}/contacts",
            params={"limit": clamped, "offset": off},
        )
        if not isinstance(data, list):
            return []
        return [row for row in data if isinstance(row, dict)]

    def search_contacts(self, query: str, *, limit: int = 500) -> list[dict[str, Any]]:
        """Filtra contactos por nombre, pushName o número."""
        q = (query or "").strip()
        if len(q) < 2:
            raise OpenWaError("Cal un text de cerca d'almenys 2 caràcters.")
        rows = self.list_contacts(limit=limit, offset=0)
        q_lower = q.casefold()
        digits = re.sub(r"\D", "", q)
        hits: list[dict[str, Any]] = []
        for row in rows:
            name = str(row.get("name") or "")
            push = str(row.get("pushName") or "")
            number = str(row.get("number") or "")
            cid = str(row.get("id") or "")
            if q_lower in name.casefold() or q_lower in push.casefold():
                hits.append(row)
                continue
            if digits and (digits in re.sub(r"\D", "", number) or digits in re.sub(r"\D", "", cid)):
                hits.append(row)
        return hits

    def send_text(self, phone: str, text: str) -> OpenWaSendResult:
        chat_id = to_whatsapp_chat_id(phone)
        content = (text or "").strip()
        if not content:
            raise OpenWaError("El missatge de WhatsApp és buit.")
        if len(content) > MAX_WHATSAPP_CHARS:
            raise OpenWaError(f"El missatge supera {MAX_WHATSAPP_CHARS} caràcters.")

        if not self.settings.enabled:
            return OpenWaSendResult(
                ok=False,
                dry_run=True,
                chat_id=chat_id,
                message_id=None,
                message="OPENWA_ENABLED=false; WhatsApp no enviat.",
            )
        if self.settings.dry_run or not self.settings.credentials_ready:
            logger.info("OpenWA dry-run send chat_id=%s chars=%s", chat_id, len(content))
            return OpenWaSendResult(
                ok=True,
                dry_run=True,
                chat_id=chat_id,
                message_id=None,
                message="Dry-run: missatge validat, no enviat al contenidor OpenWA.",
            )

        self.require_session_ready()
        sid = self.settings.session_id
        data = self._request(
            "POST",
            f"/sessions/{sid}/messages/send-text",
            {"chatId": chat_id, "text": content},
        )
        message_id = None
        if isinstance(data, dict):
            raw = data.get("messageId") or data.get("id")
            message_id = str(raw) if raw else None
        return OpenWaSendResult(
            ok=True,
            dry_run=False,
            chat_id=chat_id,
            message_id=message_id,
            message=f"Enviat a {chat_id}" + (f" ({message_id})" if message_id else ""),
        )


def format_contacts(contacts: list[dict[str, Any]], *, max_rows: int = 20) -> str:
    if not contacts:
        return "Cap contacte trobat a WhatsApp."
    lines: list[str] = []
    for row in contacts[:max_rows]:
        name = (row.get("name") or row.get("pushName") or "—").strip() or "—"
        number = (row.get("number") or "").strip() or "—"
        cid = (row.get("id") or "").strip() or "—"
        mine = "sí" if row.get("isMyContact") else "no"
        blocked = "bloquejat" if row.get("isBlocked") else "ok"
        lines.append(f"{name} | tel={number} | id={cid} | agenda={mine} | {blocked}")
    extra = len(contacts) - max_rows
    if extra > 0:
        lines.append(f"… i {extra} més (refina la cerca).")
    return "\n".join(lines)


def status_summary(client: OpenWaClient | None = None) -> str:
    settings = (client.settings if client else None) or get_openwa_settings()
    ready = settings.credentials_ready
    base = (
        f"enabled={settings.enabled} dry_run={settings.dry_run} "
        f"credentials={ready} url={settings.api_url} "
        f"session_id={'set' if settings.session_id else 'missing'}"
    )
    if not settings.enabled:
        return f"{base} — WhatsApp desactivat (OPENWA_ENABLED=false)."
    if not ready:
        return f"{base} — falten OPENWA_API_KEY o OPENWA_SESSION_ID."
    if settings.dry_run:
        return f"{base} — OPENWA_DRY_RUN=true (no s'envia de veritat)."
    try:
        session = (client or OpenWaClient(settings)).session_status()
    except Exception as exc:
        return (
            f"{base} — ERROR DE CONNEXIÓ: {exc}. "
            "El backend CECSA no arriba al contenidor OpenWA: "
            "revisa OPENWA_API_URL i que ambdós serveis comparteixin xarxa a Coolify."
        )
    if not session:
        return f"{base} — sessió no trobada (OPENWA_SESSION_ID incorrecte?)."
    status = session.get("status") or "—"
    phone = session.get("phone") or session.get("phoneNumber") or "—"
    return f"{base} status={status} phone={phone}"
