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
def get_official_prices(ctx: RunContext[AgentState]) -> str:
    """Llista de tractaments i preus base de CECSA."""
    treatments = Tratamiento.objects.all()
    return "\n".join([f"{t.nombre}: {t.precio_base}€ - {t.descripcion}" for t in treatments])
