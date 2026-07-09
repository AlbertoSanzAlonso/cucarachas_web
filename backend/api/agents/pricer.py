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
def get_historical_budget_cases(ctx: RunContext[AgentState]) -> str:
    """Presupuestos históricos reales (CRM) parecidos al caso actual."""
    from api.pricing_reference import format_historical_pricing

    lang = ctx.deps.language if ctx.deps else "ca"
    return format_historical_pricing(ctx.deps, lang)


@pricer_agent.tool
def get_ficha_servicio(ctx: RunContext[AgentState]) -> str:
    """Reglas de negocio de la Ficha Maestra para el caso actual (precio, bloqueos, copy)."""
    from api.agents.chat_intake import build_unified_diagnostic
    from api.ficha_engine import evaluate_ficha_pricing, find_ficha, format_ficha_context

    lang = ctx.deps.language if ctx.deps else "ca"
    diagnostic = build_unified_diagnostic(ctx.deps, {})
    ficha = find_ficha(ctx.deps, diagnostic)
    if not ficha:
        return "No hay ficha maestra para este caso."
    result = evaluate_ficha_pricing(ctx.deps, diagnostic, lang=lang)
    lines = [format_ficha_context(ficha, lang)]
    if result:
        lines.append(f"Confianza: {result.confidence}%")
        lines.append(f"Puede presupuestar: {result.can_quote}")
        if result.final_price:
            lines.append(f"Precio regla: {result.final_price}€")
        if result.block_reason:
            lines.append(f"Bloqueo: {result.block_reason}")
    return "\n".join(lines)


@pricer_agent.tool
def get_official_prices(ctx: RunContext[AgentState]) -> str:
    """Llista de tractaments i preus base de CECSA."""
    treatments = Tratamiento.objects.all()
    return "\n".join([f"{t.nombre}: {t.precio_base}€ - {t.descripcion}" for t in treatments])
