"""API pública de Fichas Maestras para el wizard de diagnóstico."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.agents.models import AgentState, PestType
from api.ficha_engine import find_ficha
from api.cors_utils import apply_cors_headers

_PATH_TO_PROPERTY = {
    "particular": "particular",
    "empresa": "negoci",
    "admin": "comunitat",
    "comunidad": "comunitat",
}

_PEST_ALIASES = {
    "german_cockroach": PestType.GERMAN_COCKROACH,
    "germanica": PestType.GERMAN_COCKROACH,
    "american_cockroach": PestType.AMERICAN_COCKROACH,
    "americana": PestType.AMERICAN_COCKROACH,
}


def _resolve_pest_type(raw: str | None) -> PestType:
    if not raw:
        return PestType.GERMAN_COCKROACH
    key = raw.strip().lower()
    if key in _PEST_ALIASES:
        return _PEST_ALIASES[key]
    try:
        return PestType(key)
    except ValueError:
        return PestType.GERMAN_COCKROACH


@api_view(["GET", "OPTIONS"])
@permission_classes([AllowAny])
def ficha_wizard_questions(request):
    """Preguntas obligatorias del wizard según path y plaga (desde Ficha Maestra)."""
    if request.method == "OPTIONS":
        return apply_cors_headers(Response(status=200), request)

    path = (request.query_params.get("path") or "particular").strip().lower()
    pest = _resolve_pest_type(request.query_params.get("pest_type"))

    agent = AgentState(
        pest_type=pest,
        property_type=_PATH_TO_PROPERTY.get(path, "particular"),
    )
    ficha = find_ficha(agent, {"path": path})

    if not ficha:
        response = Response({"codigo": None, "questions": []})
        return apply_cors_headers(response, request)

    client_type = _PATH_TO_PROPERTY.get(path, path)
    questions = (ficha.preguntas_obligatorias or {}).get(client_type, [])
    # El wizard ya recoge `where` en pasos fijos; no duplicar
    questions = [q for q in questions if q not in ("where",)]

    response = Response(
        {
            "codigo": ficha.codigo,
            "nombre_comercial": ficha.nombre_comercial,
            "questions": questions,
        }
    )
    return apply_cors_headers(response, request)
