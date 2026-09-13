from asgiref.sync import sync_to_async
from pydantic_ai import Agent, RunContext

from api.models import Tratamiento

from . import bootstrap  # noqa: F401
from .config import AGENT_MODEL
from .models import AgentState, PricingOutput
from .prompts import SYSTEM_PROMPTS

pricer_agent = Agent(
    AGENT_MODEL,
    deps_type=AgentState,
    output_type=PricingOutput,
    retries=3,
)


@pricer_agent.system_prompt
def get_pricer_prompt(ctx: RunContext[AgentState]) -> str:
    lang = ctx.deps.language if ctx.deps else "ca"
    return SYSTEM_PROMPTS["pricer"].get(lang, SYSTEM_PROMPTS["pricer"]["ca"])


@pricer_agent.tool
async def get_historical_budget_cases(ctx: RunContext[AgentState]) -> str:
    """Presupuestos históricos reales (CRM) parecidos al caso actual."""
    from api.pricing_reference import format_historical_pricing

    lang = ctx.deps.language if ctx.deps else "ca"
    return await sync_to_async(format_historical_pricing)(ctx.deps, lang)


@pricer_agent.tool
async def get_ficha_servicio(ctx: RunContext[AgentState]) -> str:
    """Reglas de negocio de la Ficha Maestra para el caso actual (precio, bloqueos, copy)."""
    from api.agents.chat_intake import build_unified_diagnostic
    from api.ficha_engine import evaluate_ficha_pricing, find_ficha, format_ficha_context

    lang = ctx.deps.language if ctx.deps else "ca"
    diagnostic = build_unified_diagnostic(ctx.deps, {})
    message = " ".join(str(n) for n in (ctx.deps.technical_notes or [])[-8:])

    def _load() -> str:
        ficha = find_ficha(ctx.deps, diagnostic, message=message)
        if not ficha:
            return "No hay ficha maestra para este caso."
        result = evaluate_ficha_pricing(ctx.deps, diagnostic, message=message, lang=lang)
        lines = [format_ficha_context(ficha, lang)]
        if result:
            lines.append(f"Confianza: {result.confidence}%")
            lines.append(f"Puede presupuestar: {result.can_quote}")
            if result.final_price:
                lines.append(f"Precio regla: {result.final_price}€")
            if result.block_reason:
                lines.append(f"Bloqueo: {result.block_reason}")
        return "\n".join(lines)

    return await sync_to_async(_load)()


@pricer_agent.tool
async def search_commercial_policy(ctx: RunContext[AgentState]) -> str:
    """Política comercial + fichas/refs anonimizadas (RAG). Sin costes internos ni PII."""
    from api.agents.company_knowledge import format_commercial_policy
    from knowledge.retriever import retrieve_relevant_knowledge

    lang = ctx.deps.language if ctx.deps else "ca"
    pest = ctx.deps.pest_type.value if ctx.deps and ctx.deps.pest_type else ""
    prop = ctx.deps.property_type or ""
    query = f"presupuesto {pest} {prop} hostelería bar restaurante servicio especial 1100 CUC-GER-HOST"

    def _load() -> str:
        from_db = format_commercial_policy(lang)
        rag = retrieve_relevant_knowledge(
            query,
            limit=5,
            category=["comercial", "company", "ficha", "presupuesto_ref", "tratamiento"],
        )
        parts = []
        if from_db:
            parts.append(f"--- Política CompanyProfile ---\n{from_db}")
        if rag and "No s'han trobat" not in rag and "No s'ha pogut" not in rag:
            parts.append(rag)
        return "\n\n".join(parts) if parts else "Sin política comercial en BD."

    return await sync_to_async(_load)()


@pricer_agent.tool
async def get_official_prices(ctx: RunContext[AgentState]) -> str:
    """Llista de tractaments i preus base de CECSA."""

    def _load() -> str:
        treatments = Tratamiento.objects.all()
        return "\n".join([f"{t.nombre}: {t.precio_base}€ - {t.descripcion}" for t in treatments])

    return await sync_to_async(_load)()
