"""Recolección de datos de Ficha Maestra vía chat libre (sin wizard)."""
from __future__ import annotations

import re
from typing import Any

from api.agents.models import AgentState, PestType
from api.ficha_engine import CaseContext, find_ficha

_PROPERTY_TO_PATH = {
    "particular": "particular",
    "negoci": "empresa",
    "comunitat": "comunidad",
}

_INTAKE_QUESTIONS = {
    "ca": {
        "codigo_postal": "Per preparar-te un pressupost precís, em pots dir el **codi postal** de l'immoble?",
        "metros_cuadrados": "Quants **metres quadrats** té el pis o local?",
        "where": "On has vist la plaga? (cuina, bany, garatge…)",
        "quantity": "Quantes n'has vist aproximadament? (una, diverses, moltes…)",
        "banos": "Quants banys té l'immoble?",
        "cocinas": "Quantes cuines té l'immoble?",
        "habitaciones": "Quantes habitacions té el pis?",
        "terraza": "Té terrassa o pati exterior?",
        "mascotas": "Hi ha mascotes a casa?",
        "ninos": "Hi ha nens a casa?",
        "business_type": "Quin tipus de negoci és? (restaurant, hotel, oficina…)",
    },
    "es": {
        "codigo_postal": "Para prepararte un presupuesto preciso, ¿me puedes decir el **código postal** del inmueble?",
        "metros_cuadrados": "¿Cuántos **metros cuadrados** tiene el piso o local?",
        "where": "¿Dónde has visto la plaga? (cocina, baño, garaje…)",
        "quantity": "¿Cuántas has visto aproximadamente? (una, varias, muchas…)",
        "banos": "¿Cuántos baños tiene el inmueble?",
        "cocinas": "¿Cuántas cocinas tiene el inmueble?",
        "habitaciones": "¿Cuántas habitaciones tiene el piso?",
        "terraza": "¿Tiene terraza o patio exterior?",
        "mascotas": "¿Hay mascotas en casa?",
        "ninos": "¿Hay niños en casa?",
        "business_type": "¿Qué tipo de negocio es? (restaurante, hotel, oficina…)",
    },
}

_CP_RE = re.compile(r"\b(\d{5})\b")
_M2_RE = re.compile(
    r"(\d{2,4})\s*(?:m²|m2|metros?\s+cuadrados?|metres?\s+quadrats?)",
    re.IGNORECASE,
)
_M2_BARE_RE = re.compile(r"^\s*(\d{2,4})\s*$")

_WHERE_MAP = {
    "cocina": "cocina",
    "cuina": "cocina",
    "bano": "bano",
    "baño": "bano",
    "bany": "bano",
    "dormitorio": "dormitorio",
    "dormitori": "dormitorio",
    "salon": "salon",
    "saló": "salon",
    "garaje": "garaje",
    "garatge": "garaje",
    "entrada": "entrada",
    "portal": "entrada",
    "acceso": "entrada",
    "accés": "entrada",
    "calle": "entrada",
    "carrer": "entrada",
    "exterior": "entrada",
    "almacen": "almacen",
    "almacén": "almacen",
    "magatzem": "almacen",
    "baño de clientes": "bano",
    "lavabo": "bano",
    "lavabos": "bano",
}
_WHERE_FREE_RE = re.compile(
    r"(?:en (?:el|la|los|las)|al|a la|a el)\s+([a-záéíóúüñ0-9 ]{3,40})",
    re.IGNORECASE,
)


def _looks_like_size_or_color(msg_lower: str) -> bool:
    """Hints de color/tamaño (evita marcar cantidad falsa en «una pequeña»)."""
    return any(
        h in msg_lower
        for h in (
            "marron",
            "marrón",
            "negr",
            "blanc",
            "grand",
            "gros",
            "petit",
            "pequeñ",
            "color",
            "volador",
            "alas",
        )
    )


def build_unified_diagnostic(agent: AgentState, diagnostic: dict | None = None) -> dict[str, Any]:
    """Fusiona wizard, chat libre y notas técnicas en un único dict para la ficha."""
    merged: dict[str, Any] = dict(diagnostic or {})
    chat = agent.chat_diagnostic or {}
    for key, val in chat.items():
        if val is not None and str(val).strip():
            merged[key] = val

    if not merged.get("path") and agent.property_type:
        merged["path"] = _PROPERTY_TO_PATH.get(agent.property_type, "particular")

    return merged


# Campos que aportan caso real (no basta path/who del wizard)
_PRICING_DETAIL_KEYS = (
    "where",
    "where_empresa",
    "where_admin",
    "where_comunidad",
    "quantity",
    "level",
    "since",
    "since_admin",
    "since_comunidad",
    "urgency",
    "sanitary_risk",
    "business_type",
    "metros_cuadrados",
    "codigo_postal",
)


def _filled(value: Any) -> bool:
    return value is not None and str(value).strip() not in ("", "chat_direct", "general")


def has_pricing_case_details(agent: AgentState, diagnostic: dict | None = None) -> bool:
    """True solo si hay plaga + algún detalle del caso (ubicación, cantidad, etc.)."""
    if not agent.pest_type:
        return False
    unified = build_unified_diagnostic(agent, diagnostic)
    return any(_filled(unified.get(key)) for key in _PRICING_DETAIL_KEYS)


def next_pricing_intake_field(agent: AgentState, diagnostic: dict | None = None) -> str | None:
    """Siguiente dato a pedir antes de cotizar, o None si ya se puede presupuestar."""
    if not agent.pest_type:
        return "pest"
    unified = build_unified_diagnostic(agent, diagnostic)
    where_keys = ("where", "where_empresa", "where_admin", "where_comunidad")
    if not any(_filled(unified.get(k)) for k in where_keys):
        return "where"
    qty_keys = ("quantity", "level")
    if not any(_filled(unified.get(k)) for k in qty_keys):
        return "quantity"
    return None


def is_bare_pricing_request(message: str) -> bool:
    """Pide precio/presupuesto sin aportar plaga ni contexto del caso."""
    from api.agents.graph.routing import mentions_pest, wants_pricing_message

    low = (message or "").lower()
    if not wants_pricing_message(message):
        return False
    if mentions_pest(low):
        return False
    text = " ".join(low.strip().rstrip("!?.…,").split())
    # «presupuesto», «presu», «quiero saber los precios», etc. sin más datos
    return len(text.split()) <= 8


def reset_assumed_pest_for_bare_pricing(
    agent: AgentState,
    message: str,
    diagnostic: dict | None = None,
) -> AgentState:
    """
    Si solo piden presupuesto y no hay ubicación/cantidad, no reutilizar
    cucarachas asumidas de sesión/wizard incompleto.
    """
    if not is_bare_pricing_request(message):
        return agent
    unified = build_unified_diagnostic(agent, diagnostic)
    where_keys = ("where", "where_empresa", "where_admin", "where_comunidad")
    qty_keys = ("quantity", "level")
    if any(_filled(unified.get(k)) for k in where_keys + qty_keys):
        return agent
    if not agent.pest_type and agent.pending_intake_field == "pest":
        return agent
    return agent.model_copy(
        update={
            "pest_type": None,
            "pending_intake_field": "pest",
        }
    )


def pest_label_for_agent(agent: AgentState, lang: str) -> str | None:
    """Etiqueta segura para el LLM: familia, sin inventar especie (alemana…)."""
    if not agent.pest_type:
        return None
    if lang == "es":
        return (
            "cucarachas (solo familia; especie NO dicha por el cliente — "
            "di 'cucarachas', NUNCA 'alemanas'/'americanas'/'orientales')"
        )
    return (
        "paneroles (només família; espècie NO dita pel client — "
        "digues 'paneroles', MAI 'alemanyes'/'americanes'/'orientals')"
    )


def pricing_orchestration_context(
    agent: AgentState,
    lang: str,
    message: str,
    diagnostic: dict | None = None,
) -> str:
    """
    Bloque de orquestación para el recepcionista: qué sabemos, qué falta,
    y qué no puede inventar. Vacío si el mensaje no pide precio.
    """
    from api.agents.graph.routing import wants_pricing_message
    from api.agents.models import Intent

    asking = wants_pricing_message(message) or agent.intent == Intent.QUOTE
    if not asking:
        return ""

    from api.agents.graph.routing import asks_price_of_appointment

    if asks_price_of_appointment(message):
        if lang == "es":
            return (
                "\nORQUESTACIÓN PRECIO DE LA CITA (prioridad):\n"
                "- La primera inspección/visita es GRATUITA.\n"
                "- Responde eso ahora en 1-2 frases. NO preguntes plaga/dónde/cuántas en este turno.\n"
                "- NO digas euros del tratamiento. NO lances horarios.\n"
                "- next_agent='receptionist'.\n"
            )
        return (
            "\nORQUESTRACIÓ PREU DE LA CITA (prioritat):\n"
            "- La primera inspecció/visita és GRATUÏTA.\n"
            "- Respon això ara en 1-2 frases. NO preguntis plaga/on/quantes en aquest torn.\n"
            "- NO diguis euros del tractament. NO llancis horaris.\n"
            "- next_agent='receptionist'.\n"
        )

    needed = next_pricing_intake_field(agent, diagnostic)
    unified = build_unified_diagnostic(agent, diagnostic)
    known: list[str] = []
    pest_label = pest_label_for_agent(agent, lang)
    if pest_label:
        known.append(f"plaga={pest_label}")
    for key in ("where", "where_empresa", "where_admin", "where_comunidad", "quantity", "level"):
        if _filled(unified.get(key)):
            known.append(f"{key}={unified.get(key)}")

    if lang == "es":
        if needed == "pest":
            ask_hint = (
                "Pregunta qué plaga tiene. "
                "PROHIBIDO decir cucarachas/alemanas/paneroles o preguntar cocina/baño como si ya hubiera plaga."
            )
        elif needed == "where":
            ask_hint = (
                "Pregunta dónde ha visto las cucarachas. "
                "Di solo 'cucarachas' — PROHIBIDO 'alemanas'/'americanas'/'orientales'."
            )
        elif needed == "quantity":
            ask_hint = (
                "Pregunta cuántas cucarachas ha visto (pocas, varias, muchas). "
                "PROHIBIDO añadir 'alemanas' u otra especie."
            )
        else:
            ask_hint = "Caso listo: puedes indicar next_agent=pricer (tú NO digas euros)."
        known_txt = "; ".join(known) if known else "nada del caso — NO inventes plaga ni especie"
        return (
            "\nORQUESTACIÓN PRESUPUESTO (tú decides el copy; el sistema bloquea cifras):\n"
            f"- Intent: presupuesto / precio (abreviaturas: presu, presi, presup…)\n"
            f"- YA SABEMOS: {known_txt}\n"
            f"- FALTA AHORA: {needed or 'nada — listo para pricer'}\n"
            f"- ACCIÓN: {ask_hint}\n"
            "- PROHIBIDO: inventar especie (alemana/americana…), euros, rangos € o desgloses.\n"
            "- OBLIGATORIO: 1-3 frases naturales + UNA sola pregunta (la de FALTA AHORA).\n"
            "- Explica en una frase que el precio depende del caso si aún falta info.\n"
            "- next_agent='pricer' SOLO si FALTA AHORA es nada; si no, next_agent='receptionist'.\n"
        )

    if needed == "pest":
        ask_hint = (
            "Pregunta quina plaga té. "
            "PROHIBIT dir paneroles/cucarachas o preguntar cuina/bany com si ja hi hagués plaga."
        )
    elif needed == "where":
        ask_hint = (
            "Pregunta on ha vist les paneroles. "
            "Digues només 'paneroles' — PROHIBIT 'alemanyes'/'americanes'."
        )
    elif needed == "quantity":
        ask_hint = (
            "Pregunta quantes paneroles ha vist (poques, diverses, moltes). "
            "PROHIBIT afegir 'alemanyes' o una altra espècie."
        )
    else:
        ask_hint = "Cas llest: pots indicar next_agent=pricer (tu NO diguis euros)."
    known_txt = "; ".join(known) if known else "res del cas — NO inventis plaga ni espècie"
    return (
        "\nORQUESTRACIÓ PRESSUPOST (tu decides el copy; el sistema bloqueja xifres):\n"
        f"- Intent: pressupost / preu (abreviatures: presu, presi, pressup…)\n"
        f"- JA SABEM: {known_txt}\n"
        f"- FALTA ARA: {needed or 'res — llest per pricer'}\n"
        f"- ACCIÓ: {ask_hint}\n"
        "- PROHIBIT: inventar espècie (alemanya…), euros, rangs € o desglossaments.\n"
        "- OBLIGATORI: 1-3 frases naturals + UNA sola pregunta (la de FALTA ARA).\n"
        "- Explica en una frase que el preu depèn del cas si encara falta info.\n"
        "- next_agent='pricer' NOMÉS si FALTA ARA és res; si no, next_agent='receptionist'.\n"
    )


def get_missing_mandatory_fields(agent: AgentState, diagnostic: dict | None = None) -> list[str]:
    """Campos obligatorios de la ficha activa que aún faltan."""
    unified = build_unified_diagnostic(agent, diagnostic)
    ficha = find_ficha(agent, unified)
    if not ficha:
        return []

    ctx = CaseContext(agent=agent, diagnostic=unified)
    mandatory = (ficha.preguntas_obligatorias or {}).get(ctx.client_type, [])
    return [field for field in mandatory if ctx.get_field(field) is None]


def get_intake_question(field: str, lang: str = "ca") -> str:
    questions = _INTAKE_QUESTIONS.get(lang, _INTAKE_QUESTIONS["ca"])
    return questions.get(field, questions.get("where", ""))


def parse_field_value(field: str, message: str) -> Any:
    text = message.strip()
    if not text:
        return None

    if field == "codigo_postal":
        match = _CP_RE.search(text)
        return match.group(1) if match else None

    if field == "metros_cuadrados":
        match = _M2_RE.search(text) or _M2_BARE_RE.match(text)
        if match:
            value = int(match.group(1))
            return value if 10 <= value <= 5000 else None
        return None

    if field == "where":
        low = text.lower()
        for needle, canonical in _WHERE_MAP.items():
            if needle in low:
                return canonical
        # «en la entrada», «al portal»… zona libre corta (no descriptores de color/tamaño)
        free = _WHERE_FREE_RE.search(low)
        if free:
            zone = " ".join(free.group(1).strip().split())[:40]
            if zone and not any(
                w in zone
                for w in (
                    "grande",
                    "grandes",
                    "pequeñ",
                    "petit",
                    "marron",
                    "marrón",
                    "negr",
                    "blanc",
                    "cucarach",
                    "panerol",
                )
            ):
                return zone
        return None

    if field in ("banos", "cocinas", "habitaciones"):
        match = re.search(r"\b(\d{1,2})\b", text)
        return int(match.group(1)) if match else None

    if field in ("terraza", "mascotas", "ninos"):
        low = text.lower()
        if any(w in low for w in ("si", "sí", "yes", "sí,", "si,")):
            return "yes"
        if any(w in low for w in ("no", "cap", "ningun", "ningún")):
            return "no"
        return None

    if field == "quantity":
        low = text.lower()
        if any(w in low for w in ("ooteca", "cápsula", "capsula", "niu", "nido")):
            return "nests"
        if re.search(r"\b(moltes|muchas|muchos|moltas|infest)\w*\b", low):
            return "many"
        if re.search(r"\b(diverses|varias|varios|algunes|algunas|several)\b", low):
            return "several"
        if re.search(r"\b(pocas|poques|pocos|poca|poc)\b", low):
            return "one"
        # «una/uno» solo como cantidad explícita — no «una pequeña», «una de cucarachas»
        if re.search(
            r"\b(solo|sólo|només|apenas|solament)\s+(una|uno|one)\b",
            low,
        ) or re.fullmatch(r"(una|uno|one|1)", low.strip()):
            return "one"
        if re.search(
            r"\b(una|uno|one)\b(?!\s+(pequeñ|petit|grand|gros|marron|marrón|negr|blanc|"
            r"de\b|cucarach|panerol|plaga))",
            low,
        ) and not _looks_like_size_or_color(low):
            # «he visto una» / «vi una» sin descriptor → cantidad
            if re.search(r"\b(visto|vist|vi|aparec|hay|hi ha|són|son)\b", low):
                return "one"
        nums = [int(n) for n in re.findall(r"\b(\d{1,3})\b", text)]
        if nums:
            n = max(nums)
            if n <= 2:
                return "one"
            if n <= 8:
                return "several"
            return "many"
        return None

    if field == "pest":
        low = text.lower().replace("cucurach", "cucarach")
        if any(k in low for k in ("cucarach", "panerol", "cucas")) or re.search(r"\bcuca\b", low):
            return "cucarachas"
        if low.strip() in {"si", "sí", "yes", "ok", "vale", "claro", "venga"}:
            return "cucarachas"
        return None

    return text[:200]


def extract_fields_from_message(message: str) -> dict[str, Any]:
    """Intenta extraer campos de ficha del mensaje libre."""
    found: dict[str, Any] = {}
    low = message.lower()

    cp = _CP_RE.search(message)
    if cp:
        found["codigo_postal"] = cp.group(1)

    m2 = _M2_RE.search(message)
    if m2:
        found["metros_cuadrados"] = int(m2.group(1))

    for needle, canonical in _WHERE_MAP.items():
        if needle in low:
            found["where"] = canonical
            break
    if "where" not in found:
        where_free = parse_field_value("where", message)
        if where_free:
            found["where"] = where_free

    qty = parse_field_value("quantity", message)
    if qty:
        found["quantity"] = qty

    return found


def apply_chat_intake_from_message(agent: AgentState, message: str) -> AgentState:
    """Persiste respuestas del chat en agent.chat_diagnostic."""
    chat = dict(agent.chat_diagnostic or {})
    updated = agent.model_copy(deep=True)

    if updated.pending_intake_field:
        parsed = parse_field_value(updated.pending_intake_field, message)
        if parsed is not None:
            chat[updated.pending_intake_field] = parsed
            updated.pending_intake_field = None

    for key, val in extract_fields_from_message(message).items():
        if key not in chat or not chat.get(key):
            chat[key] = val

    updated.chat_diagnostic = chat
    return updated


def ensure_pest_from_message(agent: AgentState, message: str) -> AgentState:
    """Confirma cucarachas solo si el cliente las nombra (no por «plaga» genérica)."""
    low = message.lower().replace("cucurach", "cucarach")
    if agent.pest_type:
        if agent.pending_intake_field == "pest":
            return agent.model_copy(update={"pending_intake_field": None})
        return agent

    # Solo familia cucarachas; «plaga»/roedor no asumen panerola alemana
    pest_words = ("cucarach", "panerol", "cucaracha", "paneroles", "cucas")
    pricing = (
        "pressupost",
        "presupuesto",
        "precio",
        "preu",
        "presu",
        "presi",
        "presup",
        "precios",
        "preus",
    )
    text = " ".join(low.strip().rstrip("!?.…,").split())
    affirms = text in {
        "si", "sí", "yes", "ok", "vale", "claro", "venga", "exacto", "exacte",
    } or any(text.startswith(s) for s in ("si ", "sí ", "si,", "sí,", "yes ", "vale ", "claro "))

    confirmed = False
    if any(k in low for k in pest_words) or re.search(r"\bcuca\b", low):
        confirmed = True
    elif agent.pending_intake_field == "pest" and affirms:
        confirmed = True
    elif affirms and any(k in low for k in pricing):
        confirmed = True

    if confirmed:
        return agent.model_copy(
            update={
                "pest_type": PestType.GERMAN_COCKROACH,
                "pending_intake_field": None if agent.pending_intake_field == "pest" else agent.pending_intake_field,
            }
        )
    return agent
