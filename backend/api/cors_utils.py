"""Orígenes CORS permitidos para frontend producción, previews Vercel y desarrollo local."""
from __future__ import annotations

import os
import re

from django.conf import settings


def _extra_origins() -> list[str]:
    raw = os.environ.get("CORS_EXTRA_ORIGINS", "")
    return [item.strip() for item in raw.split(",") if item.strip()]


def is_allowed_cors_origin(origin: str | None) -> bool:
    if not origin:
        return False
    allowed = list(getattr(settings, "CORS_ALLOWED_ORIGINS", []) or [])
    allowed.extend(_extra_origins())
    if origin in allowed:
        return True
    regexes = getattr(settings, "CORS_ALLOWED_ORIGIN_REGEXES", []) or []
    return any(re.match(pattern, origin) for pattern in regexes)


def apply_cors_headers(response, request) -> object:
    """Refuerzo puntual cuando la vista necesita cabeceras CORS explícitas."""
    origin = request.headers.get("Origin")
    if is_allowed_cors_origin(origin):
        response["Access-Control-Allow-Origin"] = origin
        response["Access-Control-Allow-Credentials"] = "true"
        response["Vary"] = "Origin"
    return response
