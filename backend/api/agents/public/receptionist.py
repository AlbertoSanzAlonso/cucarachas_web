from pydantic_ai import Agent, RunContext

from api.agents import bootstrap  # noqa: F401
from .company_knowledge import format_company_knowledge_for_agent
from api.agents.config import AGENT_MODEL
from api.agents.models import AgentState, ReceptionistOutput
from .prompts import SYSTEM_PROMPTS, scheduling_disabled_prompt_suffix

# Agente 1: Recepcionista
receptionist_agent = Agent(
    AGENT_MODEL,
    deps_type=AgentState,
    output_type=ReceptionistOutput,
    retries=3
)

@receptionist_agent.system_prompt
def get_receptionist_prompt(ctx: RunContext[AgentState]) -> str:
    lang = ctx.deps.language if ctx.deps else "ca"
    base = SYSTEM_PROMPTS["receptionist"].get(lang, SYSTEM_PROMPTS["receptionist"]["ca"])
    facts = format_company_knowledge_for_agent(lang if lang in ("ca", "es") else "ca")
    return (
        f"{base}{scheduling_disabled_prompt_suffix(lang)}\n\n"
        "DATOS OFICIALES DE CECSA (fuente de verdad; usa get_company_info si necesitas recordarlos):\n"
        f"{facts}\n"
        "No inventes horarios, cobertura ni teléfono distintos a estos."
    )

@receptionist_agent.tool
def get_company_info(ctx: RunContext[AgentState]) -> str:
    """Datos oficiales de CECSA: cobertura, sede, teléfono, horario y políticas."""
    lang = ctx.deps.language if ctx.deps and ctx.deps.language in ("ca", "es") else "ca"
    return format_company_knowledge_for_agent(lang)


@receptionist_agent.tool
def search_web_knowledge(ctx: RunContext[AgentState], query: str) -> str:
    """Busca en blog, FAQ, fichas comerciales, especies y guías CECSA."""
    from knowledge.retriever import retrieve_relevant_knowledge

    return retrieve_relevant_knowledge(
        query,
        limit=4,
        category=["blog", "faq", "species", "company", "general", "ficha", "comercial"],
    )


@receptionist_agent.tool
def get_ficha_servicio(ctx: RunContext[AgentState]) -> str:
    """Ficha maestra del caso (hostelería grave, negocio, vivienda…). Incluye servicio especial."""
    from api.agents.public.chat_intake import build_unified_diagnostic
    from api.ficha_engine import evaluate_ficha_pricing, find_ficha, format_ficha_context

    lang = ctx.deps.language if ctx.deps else "ca"
    diagnostic = build_unified_diagnostic(ctx.deps, {})
    message = " ".join(str(n) for n in (ctx.deps.technical_notes or [])[-8:])
    ficha = find_ficha(ctx.deps, diagnostic, message=message)
    if not ficha:
        # Fallback: servicio especial hostelería si preguntan por él
        from api.models import FichaServicio

        host = FichaServicio.objects.filter(activa=True, codigo="CUC-GER-HOST").first()
        if host and any(
            k in message.lower()
            for k in ("hosteler", "hostaler", "bar", "restaurant", "especial", "1100", "1.100")
        ):
            ficha = host
        else:
            return "No hay ficha maestra clara aún; pide plaga y tipo de local si falta."
    result = evaluate_ficha_pricing(ctx.deps, diagnostic, message=message, lang=lang)
    lines = [format_ficha_context(ficha, lang)]
    if result:
        lines.append(f"Confianza: {result.confidence}%")
        lines.append(f"Puede presupuestar: {result.can_quote}")
        if result.final_price:
            lines.append(f"Precio regla: {result.final_price}€ + IVA (orientativo)")
        if result.commercial_copy:
            lines.append(result.commercial_copy)
    return "\n".join(lines)


@receptionist_agent.tool
def get_blog_info(ctx: RunContext[AgentState]) -> str:
    """Cuántos artículos hay en el blog y listado de títulos publicados."""
    from api.models import BlogArticle

    articles = list(
        BlogArticle.objects.filter(is_published=True).order_by("-published_at", "-id")
    )
    if not articles:
        return "Blog: 0 artículos publicados."
    lines = [f"Blog CECSA: {len(articles)} artículo(s) publicado(s)."]
    for art in articles:
        lines.append(f"- {art.title} (/{art.slug})")
    return "\n".join(lines)
