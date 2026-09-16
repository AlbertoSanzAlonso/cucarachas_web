"""Cliente HTTP del contenedor OpenWA (misma API que Superpelu / rmyndharis)."""

from __future__ import annotations

import logging
import re
import unicodedata
from dataclasses import dataclass
from typing import Any

import requests

from .config import OpenWaSettings, get_openwa_settings

logger = logging.getLogger(__name__)

MAX_WHATSAPP_CHARS = 3500
_CONTACTS_PAGE = 500
_CONTACTS_MAX = 5000
_CHATS_PAGE = 500
_CHATS_MAX = 2000


@dataclass(frozen=True)
class OpenWaSendResult:
    ok: bool
    dry_run: bool
    chat_id: str
    message_id: str | None
    message: str


class OpenWaError(ValueError):
    """Teléfono o mensaje no válidos antes de llamar al contenedor."""


def _fold_text(value: str) -> str:
    """Normalitza accents i majúscules per a cerques robustes."""
    raw = unicodedata.normalize("NFKD", value or "")
    stripped = "".join(ch for ch in raw if not unicodedata.combining(ch))
    return stripped.casefold().strip()


def _query_tokens(query: str) -> list[str]:
    return [tok for tok in re.split(r"\s+", _fold_text(query)) if len(tok) >= 2]


def _contact_haystack(row: dict[str, Any]) -> str:
    parts = [
        str(row.get("name") or ""),
        str(row.get("pushName") or ""),
        str(row.get("shortName") or ""),
        str(row.get("verifiedName") or ""),
    ]
    return " ".join(_fold_text(p) for p in parts if p)


def _score_contact(row: dict[str, Any], *, q_fold: str, tokens: list[str], digits: str) -> int:
    """Puntuació de coincidència (0 = no match). Preferim frase completa > tots els tokens > un token."""
    hay = _contact_haystack(row)
    number = re.sub(r"\D", "", str(row.get("number") or ""))
    cid = re.sub(r"\D", "", str(row.get("id") or ""))
    score = 0
    if digits and (digits in number or digits in cid):
        score = max(score, 100)
    if q_fold and q_fold in hay:
        score = max(score, 90)
    if tokens:
        if all(tok in hay for tok in tokens):
            score = max(score, 80)
        else:
            # Fallback: qualsevol cognom/nom significatiu (≥4) — evita perdre «Montenegro» sol.
            significant = [t for t in tokens if len(t) >= 4]
            hits = sum(1 for t in significant if t in hay)
            if hits:
                score = max(score, 40 + 10 * hits)
            elif any(t in hay for t in tokens):
                score = max(score, 25)
    if score and row.get("isMyContact"):
        score += 5
    return score


def _dedupe_contacts(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for row in rows:
        key = str(row.get("id") or row.get("number") or "").strip().casefold()
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(row)
    return out


def _chat_as_contact(chat: dict[str, Any]) -> dict[str, Any] | None:
    """Normalitza un ChatSummary OpenWA a forma de contacte cercable."""
    if not isinstance(chat, dict):
        return None
    if chat.get("isGroup") or str(chat.get("kind") or "").lower() in (
        "group",
        "channel",
        "status",
        "broadcast",
    ):
        return None
    cid = str(chat.get("id") or "").strip()
    if not cid or "@g.us" in cid or "@newsletter" in cid:
        return None
    number = re.sub(r"\D", "", cid.split("@", 1)[0])
    name = str(chat.get("name") or "").strip()
    return {
        "id": cid,
        "name": name,
        "pushName": name,
        "number": number,
        "isMyContact": False,
        "isBlocked": False,
        "_from_chat": True,
    }


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

    def list_chats(self, *, limit: int = 500, offset: int = 0) -> list[dict[str, Any]]:
        """Xats actius de la sessió (útil si el contacte no està a l'agenda del mòbil)."""
        self.require_session_ready()
        sid = self.settings.session_id
        clamped = max(1, min(int(limit), 1000))
        off = max(0, int(offset))
        data = self._request(
            "GET",
            f"/sessions/{sid}/chats",
            params={"limit": clamped, "offset": off},
        )
        if not isinstance(data, list):
            return []
        return [row for row in data if isinstance(row, dict)]

    def iter_all_contacts(self, *, page_size: int = _CONTACTS_PAGE, max_total: int = _CONTACTS_MAX):
        """Recorre contactes amb paginació (OpenWA pot retornar-ne milers)."""
        offset = 0
        seen = 0
        while seen < max_total:
            batch = self.list_contacts(limit=min(page_size, max_total - seen), offset=offset)
            if not batch:
                break
            for row in batch:
                yield row
                seen += 1
                if seen >= max_total:
                    return
            if len(batch) < page_size:
                break
            offset += len(batch)

    def iter_all_chats(self, *, page_size: int = _CHATS_PAGE, max_total: int = _CHATS_MAX):
        offset = 0
        seen = 0
        while seen < max_total:
            batch = self.list_chats(limit=min(page_size, max_total - seen), offset=offset)
            if not batch:
                break
            for row in batch:
                yield row
                seen += 1
                if seen >= max_total:
                    return
            if len(batch) < page_size:
                break
            offset += len(batch)

    def search_contacts(self, query: str, *, limit: int = _CONTACTS_MAX) -> list[dict[str, Any]]:
        """Cerca a l'agenda WhatsApp + xats recents (nom, pushName o número)."""
        q = (query or "").strip()
        if len(q) < 2:
            raise OpenWaError("Cal un text de cerca d'almenys 2 caràcters.")
        q_fold = _fold_text(q)
        tokens = _query_tokens(q)
        digits = re.sub(r"\D", "", q)
        scored: list[tuple[int, dict[str, Any]]] = []

        for row in self.iter_all_contacts(max_total=max(1, min(int(limit), _CONTACTS_MAX))):
            score = _score_contact(row, q_fold=q_fold, tokens=tokens, digits=digits)
            if score:
                scored.append((score, row))

        # Gent amb qui s'ha xatejat però no està a l'agenda del mòbil.
        try:
            for chat in self.iter_all_chats():
                row = _chat_as_contact(chat)
                if not row:
                    continue
                score = _score_contact(row, q_fold=q_fold, tokens=tokens, digits=digits)
                if score:
                    scored.append((score, row))
        except Exception as exc:
            logger.warning("OpenWA chats search skipped: %s", exc)

        scored.sort(key=lambda item: (-item[0], str(item[1].get("name") or "")))
        return _dedupe_contacts([row for _, row in scored])

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
        return (
            "Cap contacte trobat a l'agenda WhatsApp ni als xats recents de la sessió. "
            "OpenWA només veu el que té el mòbil enllaçat (QR): si el contacte no està "
            "desat o no hi ha xat obert, no surt. Passa el mòbil internacional (+…) per enviar."
        )
    lines: list[str] = []
    for row in contacts[:max_rows]:
        name = (row.get("name") or row.get("pushName") or "—").strip() or "—"
        number = (row.get("number") or "").strip() or "—"
        cid = (row.get("id") or "").strip() or "—"
        if row.get("_from_chat"):
            origen = "xat"
        else:
            origen = "agenda" if row.get("isMyContact") else "wa"
        blocked = "bloquejat" if row.get("isBlocked") else "ok"
        lines.append(f"{name} | tel={number} | id={cid} | origen={origen} | {blocked}")
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
