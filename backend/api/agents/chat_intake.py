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
        "property_type": (
            "Per donar-te un pressupost realista, el tractament és per a una **vivenda**, "
            "un **negoci** o una **comunitat de veïns**?"
        ),
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
        "sanitary_risk": "Quin risc sanitari o gravetat diries que té el cas? (baix, mitjà, alt/greu)",
    },
    "es": {
        "property_type": (
            "Para darte un presupuesto realista, ¿el tratamiento es para una **vivienda**, "
            "un **negocio** o una **comunidad de vecinos**?"
        ),
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
        "sanitary_risk": "¿Qué riesgo sanitario o gravedad dirías que tiene el caso? (bajo, medio, alto/grave)",
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
    """True con plaga + inmueble + datos mínimos (ficha HOST no exige cantidad)."""
    if not agent.pest_type or not agent.property_type:
        return False
    unified = build_unified_diagnostic(agent, diagnostic)
    message = " ".join(str(n) for n in (agent.technical_notes or [])[-6:])
    ficha = find_ficha(agent, unified, message=message)

    where_keys = ("where", "where_empresa", "where_admin", "where_comunidad")
    qty_keys = ("quantity", "level")
    has_where = any(_filled(unified.get(k)) for k in where_keys)
    has_qty = any(_filled(unified.get(k)) for k in qty_keys)

    if ficha and ficha.codigo == "CUC-GER-HOST":
        has_business = _filled(unified.get("business_type"))
        has_risk = _filled(unified.get("sanitary_risk")) or has_qty
        # Hostelería grave: negocio + (zona o tipo bar/rest) + señal de gravedad
        return (has_where or has_business) and (has_risk or has_business)

    return has_where and has_qty


def next_pricing_intake_field(agent: AgentState, diagnostic: dict | None = None) -> str | None:
    """Siguiente dato a pedir antes de cotizar, o None si ya se puede presupuestar."""
    if not agent.pest_type:
        return "pest"
    if not agent.property_type:
        return "property_type"
    unified = build_unified_diagnostic(agent, diagnostic)
    message = " ".join(str(n) for n in (agent.technical_notes or [])[-6:])
    ficha = find_ficha(agent, unified, message=message)

    where_keys = ("where", "where_empresa", "where_admin", "where_comunidad")
    if not any(_filled(unified.get(k)) for k in where_keys):
        # En hostelería, cocina es zona por defecto razonable si ya hay tipo de local
        if ficha and ficha.codigo == "CUC-GER-HOST" and _filled(unified.get("business_type")):
            pass  # donde lo pedirá la ficha si está en mandatory
        else:
            return "where"

    if ficha:
        ctx = CaseContext(agent=agent, diagnostic=unified, message=message)
        mandatory = (ficha.preguntas_obligatorias or {}).get(ctx.client_type, [])
        for field in mandatory:
            if field in ("where", "where_empresa", "where_admin", "where_comunidad"):
                if any(_filled(unified.get(k)) for k in where_keys):
                    continue
                return "where"
            if ctx.get_field(field) is None:
                return field
        # Ficha sin quantity en mandatory (p. ej. HOST): no insistir en cuántas
        if "quantity" not in mandatory and "level" not in mandatory:
            return None

    qty_keys = ("quantity", "level")
    if not any(_filled(unified.get(k)) for k in qty_keys):
        return "quantity"
    missing = get_missing_mandatory_fields(agent, diagnostic)
    if missing:
        return missing[0]
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
        elif needed == "property_type":
            ask_hint = (
                "Pregunta si es vivienda, negocio o comunidad de vecinos. "
                "NO des euros ni rangos. Una sola pregunta."
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
        elif needed in ("metros_cuadrados", "codigo_postal", "business_type", "sanitary_risk"):
            ask_hint = (
                f"Falta el dato '{needed}' para un presupuesto fiable. "
                "Pregúntalo en una frase natural. PROHIBIDO inventar euros."
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
    elif needed == "property_type":
        ask_hint = (
            "Pregunta si és habitatge, negoci o comunitat de veïns. "
            "NO donis euros ni rangs. Una sola pregunta."
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
    elif needed in ("metros_cuadrados", "codigo_postal", "business_type", "sanitary_risk"):
        ask_hint = (
            f"Falta el dada '{needed}' per un pressupost fiable. "
            "Pregunta-ho en una frase natural. PROHIBIT inventar euros."
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
    message = " ".join(str(n) for n in (agent.technical_notes or [])[-6:])
    ficha = find_ficha(agent, unified, message=message)
    if not ficha:
        return []

    ctx = CaseContext(agent=agent, diagnostic=unified, message=message)
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

    if field == "property_type":
        low = text.lower()
        if any(
            k in low
            for k in (
                "comunitat",
                "comunidad",
                "vecinos",
                "veïns",
                "finca",
                "escalera",
                "escala",
            )
        ):
            return "comunitat"
        if any(
            k in low
            for k in (
                "negoci",
                "negocio",
                "empresa",
                "local",
                "restaurant",
                "restaurante",
                "hotel",
                "oficina",
                "bar ",
                "hosteler",
                "comerç",
                "comercio",
            )
        ):
            return "negoci"
        if any(
            k in low
            for k in (
                "particular",
                "vivienda",
                "vivenda",
                "habitatge",
                "piso",
                "pis ",
                "casa",
                "hogar",
                "domicilio",
                "apartament",
            )
        ):
            return "particular"
        return None

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

    # Hostelería / negocio
    if re.search(r"\brestaurants?\b|\brestaurantes?\b", low):
        found["business_type"] = "restaurante"
    elif re.search(r"\bbar(?:es)?\b|\bcafeter[ií]a\b|\bhotel\b", low):
        if "hotel" in low:
            found["business_type"] = "hotel"
        elif "cafeter" in low:
            found["business_type"] = "cafeteria"
        else:
            found["business_type"] = "bar"
    elif any(k in low for k in ("hosteler", "hostaler", "horeca", "cocina profesional", "cuina professional")):
        found["business_type"] = "restaurante"

    if any(
        k in low
        for k in (
            "grave",
            "greu",
            "crític",
            "critico",
            "crítico",
            "persistente",
            "persistent",
            "riesgo alto",
            "risc alt",
            "inspección sanitaria",
            "inspeccio sanitaria",
            "inspecció sanitària",
        )
    ):
        found["sanitary_risk"] = "alto"
        found["level"] = "grave"

    if any(
        k in low
        for k in (
            "otras empresas",
            "altres empreses",
            "otra empresa",
            "altra empresa",
            "ya han venido",
            "ja han vingut",
            "siguen apareciendo",
            "continuen apareixent",
            "no han solucionado",
            "no han solucionat",
            "servicio especial",
            "servei especial",
        )
    ):
        found["failed_prior_treatment"] = "yes"
        if not found.get("sanitary_risk"):
            found["sanitary_risk"] = "alto"

    # Si es bar/restaurante y aún no hay zona, cocina es el foco habitual
    if found.get("business_type") in ("bar", "restaurante", "hotel", "cafeteria") and not found.get("where"):
        found["where"] = "cocina"

    return found


def apply_chat_intake_from_message(agent: AgentState, message: str) -> AgentState:
    """Persiste respuestas del chat en agent.chat_diagnostic."""
    chat = dict(agent.chat_diagnostic or {})
    updated = agent.model_copy(deep=True)

    if updated.pending_intake_field:
        parsed = parse_field_value(updated.pending_intake_field, message)
        if parsed is not None:
            if updated.pending_intake_field == "property_type":
                updated.property_type = parsed
            else:
                chat[updated.pending_intake_field] = parsed
            updated.pending_intake_field = None

    for key, val in extract_fields_from_message(message).items():
        if key not in chat or not chat.get(key):
            chat[key] = val

    # Tipo de inmueble también desde texto libre
    if not updated.property_type:
        prop = parse_field_value("property_type", message)
        if prop:
            updated.property_type = prop

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
    elif any(
        k in low
        for k in (
            "alemana",
            "alemanas",
            "alemanya",
            "alemanyes",
            "germánic",
            "germanic",
            "germánica",
            "germanica",
        )
    ):
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
