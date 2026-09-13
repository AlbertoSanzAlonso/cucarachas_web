"""Contexto de caso compartido por todos los agentes CECSA (memoria + faltantes)."""
from __future__ import annotations

from typing import Any, Literal

from api.agents.models import AgentState

AgentRole = Literal[
    "general",
    "receptionist",
    "diagnostician",
    "pricer",
    "scheduler",
    "crm",
]


def _chat(agent: AgentState) -> dict[str, Any]:
    return dict(agent.chat_diagnostic or {})


def case_memory(agent: AgentState, lang: str = "ca") -> dict[str, Any]:
    """
    Instantánea estructurada del caso para prompts y routing.
    Fuente única: AgentState (pest, inmueble, chat_diagnostic, notes).
    """
    from api.agents.chat_intake import pest_label_for_agent

    chat = _chat(agent)
    pest_confirmed = bool(agent.pest_type)
    pest_label = pest_label_for_agent(agent, lang) if pest_confirmed else None

    known: list[str] = []
    if pest_confirmed and pest_label:
        known.append(f"plaga={pest_label}")
    if agent.property_type:
        known.append(f"inmueble={agent.property_type}")
    if agent.city:
        known.append(f"ciudad={agent.city}")
    if chat.get("where"):
        known.append(f"dónde={chat['where']}")
    for alt in ("where_empresa", "where_admin", "where_comunidad"):
        if chat.get(alt) and f"dónde={chat.get('where')}" not in known:
            known.append(f"dónde={chat[alt]}")
    if chat.get("quantity") or chat.get("level"):
        known.append(f"cuántas={chat.get('quantity') or chat.get('level')}")
    if chat.get("metros_cuadrados"):
        known.append(f"m²={chat['metros_cuadrados']}")
    if chat.get("codigo_postal"):
        known.append(f"CP={chat['codigo_postal']}")
    if chat.get("telefono"):
        known.append("teléfono=sí")
    if agent.severity:
        known.append(f"severidad={agent.severity.value}")
    if agent.estimated_price:
        known.append(f"precio_estimado≈{agent.estimated_price:.0f}€")
    if agent.technical_notes:
        known.append("notas=" + "; ".join(agent.technical_notes[-8:]))

    missing: list[str] = []
    if not pest_confirmed:
        missing.append("qué plaga ha visto" if lang == "es" else "quina plaga ha vist")
    elif not agent.property_type:
        missing.append(
            "tipo de inmueble (vivienda, negocio/local o comunidad)"
            if lang == "es"
            else "tipus d'immoble (habitatge, negoci/local o comunitat)"
        )
    elif not chat.get("where") and not any(chat.get(k) for k in ("where_empresa", "where_admin", "where_comunidad")):
        if agent.property_type == "negoci":
            missing.append(
                "dónde en el local (cocina, almacén, entrada, baños…)"
                if lang == "es"
                else "on al local (cuina, magatzem, entrada, lavabos…)"
            )
        elif agent.property_type == "comunitat":
            missing.append(
                "dónde en el edificio (zonas comunes, bajantes, un piso…)"
                if lang == "es"
                else "on a l'edifici (zones comunes, baixants, un pis…)"
            )
        else:
            missing.append(
                "dónde (cocina, baño, entrada…)"
                if lang == "es"
                else "on (cuina, bany, entrada…)"
            )
    elif not chat.get("quantity") and not chat.get("level"):
        missing.append(
            "cuántas (pocas/varias/muchas)"
            if lang == "es"
            else "quantes (poques/diverses/moltes)"
        )

    return {
        "pest_confirmed": pest_confirmed,
        "pest_label": pest_label,
        "property_type": agent.property_type,
        "city": agent.city,
        "where": chat.get("where")
        or chat.get("where_empresa")
        or chat.get("where_admin")
        or chat.get("where_comunidad"),
        "quantity": chat.get("quantity") or chat.get("level"),
        "known": known,
        "missing": missing,
        "case_ready": bool(
            pest_confirmed
            and (
                chat.get("where")
                or chat.get("where_empresa")
                or chat.get("where_admin")
                or chat.get("where_comunidad")
            )
            and (chat.get("quantity") or chat.get("level"))
        ),
        "notes": list(agent.technical_notes[-10:]) if agent.technical_notes else [],
    }


def build_shared_case_context(
    agent: AgentState,
    lang: str,
    message: str = "",
    *,
    role: AgentRole = "general",
) -> str:
    """
    Bloque de memoria único para recepcionista, diagnóstico, presupuesto y agenda.
    Todos los agentes deben basarse en esto para no repreguntar.
    """
    mem = case_memory(agent, lang)
    lang_rule = (
        "Responde SIEMPRE en castellano."
        if lang == "es"
        else "Respon SEMPRE en català."
    )
    known_txt = "; ".join(mem["known"]) if mem["known"] else (
        "casi nada" if lang == "es" else "gairebé res"
    )
    missing_txt = "; ".join(mem["missing"]) if mem["missing"] else (
        "nada crítico — responde y ofrece siguiente paso"
        if lang == "es"
        else "res de crític — respon i ofereix el següent pas"
    )

    if mem["pest_confirmed"]:
        pest_line = (
            f"Plaga YA CONFIRMADA: {mem['pest_label']}. "
            "PROHIBIDO preguntar de nuevo qué plaga es."
            if lang == "es"
            else f"Plaga JA CONFIRMADA: {mem['pest_label']}. "
            "PROHIBIT preguntar de nou quina plaga és."
        )
    else:
        pest_line = (
            "Plaga: aún NO especificada (PROHIBIDO inventar cucarachas u otra especie)"
            if lang == "es"
            else "Plaga: encara NO especificada (PROHIBIT inventar paneroles o una altra espècie)"
        )

    # Saludos / info / objeciones: no empujar «siguiente dato» del embudo
    defer_intake = False
    if message:
        from api.agents.graph.routing import (
            is_client_question_or_objection,
            is_informational_query,
            is_simple_greeting,
        )

        low = message.lower()
        defer_intake = (
            is_simple_greeting(low)
            or is_informational_query(low)
            or is_client_question_or_objection(low)
        )

    if defer_intake:
        missing_txt = (
            "ninguno este turno — primero RESPONDE a lo que dice el cliente "
            "(pregunta, duda o relato); no fuerces el siguiente dato del embudo"
            if lang == "es"
            else "cap aquest torn — primer RESPON al que diu el client "
            "(pregunta, dubte o relat); no forcis el següent dada de l'embut"
        )

    lines = [
        f"Idioma: {lang}",
        f"Rol agente: {role}",
        f"Cliente: {agent.property_type or '—'} | Ciudad: {agent.city or '—'}",
        pest_line,
        f"MEMORIA DEL CASO — YA SABEMOS (PROHIBIDO volver a preguntar): {known_txt}",
        f"SIGUIENTE DATO ÚTIL (pregunta SOLO esto si falta): {missing_txt}",
    ]
    if message:
        lines.append(f"Mensaje NUEVO del cliente: {message}")

    lines.extend(
        [
            "REGLAS DE MEMORIA (obligatorias para TODOS los agentes):",
            "- Usa la MEMORIA: no repitas plaga, inmueble, zona ni cantidad si ya están arriba.",
            "- Máximo UNA pregunta, y solo si aparece en SIGUIENTE DATO.",
            "- No inventes especies (alemana/americana/oriental), colores ni tamaños no dichos.",
            "- Si el cliente aporta color/tamaño, anótalo mentalmente y pregunta el siguiente faltante.",
            "- Comparte los mismos hechos: el estado AgentState es la fuente de verdad entre agentes.",
            lang_rule,
        ]
    )

    # Bloques opcionales según mensaje / rol
    if message:
        from api.agents.chat_intake import pricing_orchestration_context
        from api.agents.graph.routing import asks_price_of_appointment

        pricing = pricing_orchestration_context(agent, lang, message)
        if pricing:
            lines.append(pricing.strip())
        if asks_price_of_appointment(message.lower()):
            lines.append(
                "PRECIO CITA: la primera inspección es GRATUITA. Explica eso; no pidas más datos del caso en este turno."
                if lang == "es"
                else "PREU CITA: la primera inspecció és GRATUÏTA. Explica-ho; no demanis més dades del cas en aquest torn."
            )

    if role == "receptionist":
        from api.agents.company_knowledge import format_company_knowledge_for_agent

        lines.append("Datos CECSA (si pregunta por la empresa):")
        lines.append(format_company_knowledge_for_agent(lang))
        if agent.property_type == "negoci":
            lines.append(
                "Es NEGOCIO/LOCAL: zonas típicas cocina, almacén, entrada, baños — no trates como piso."
            )
        elif agent.property_type == "comunitat":
            lines.append(
                "Es COMUNIDAD: pregunta zonas comunes/bajantes/pisos, no solo cocina de un piso."
            )
        lines.append("ESTILO: natural y humano, 2-4 frases. "
                     "Escucha primero; demuestra que has leído el mensaje. "
                     "PROHIBIDO abrir con 'Entiendo tu preocupación', 'Entiendo que', "
                     "'Comprendo tu situación' o frases clonadas. "
                     "Si pregunta por productos/DIY, responde eso antes de pedir más datos. "
                     "No empujes cita ni presupuesto en cada turno.")

    elif role == "diagnostician":
        lines.append("TAREA diagnóstico: orienta con hechos de MEMORIA; no recapitules.")
        if mem["case_ready"]:
            lines.append(
                "Caso listo (plaga+zona+cantidad): da orientación breve y ofrece inspección gratuita o presupuesto."
            )
        else:
            lines.append("Caso incompleto: pide SOLO el siguiente dato de la lista; sin veredicto largo.")

    elif role == "pricer":
        lines.append(
            "TAREA presupuesto: usa ficha/histórico/política; no preguntes de nuevo plaga/zona si están en MEMORIA."
        )
        if mem["missing"]:
            lines.append(
                f"Aún faltan datos para afinar: {missing_txt}. "
                "Si cotizas, marca el rango como orientativo."
            )

    elif role == "scheduler":
        lines.append(
            "TAREA agenda: inspección gratuita. No repreguntes el diagnóstico; usa MEMORIA en el mensaje de confirmación."
        )

    elif role == "crm":
        lines.append("TAREA CRM: resume hechos de MEMORIA para el técnico; no inventes.")

    return "\n".join(lines)
