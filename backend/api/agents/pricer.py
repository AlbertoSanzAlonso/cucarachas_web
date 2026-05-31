from pydantic_ai import Agent, RunContext

from api.models import Tratamiento

from . import bootstrap  # noqa: F401
from .config import AGENT_MODEL
from .models import AgentDeps, PricingOutput
from .prompts import SYSTEM_PROMPTS

pricer_agent = Agent(
    AGENT_MODEL,
    deps_type=AgentDeps,
    output_type=PricingOutput,
    retries=3,
)


@pricer_agent.system_prompt
def get_pricer_prompt(ctx: RunContext[AgentDeps]) -> str:
    lang = ctx.deps.language if ctx.deps else "ca"
    return SYSTEM_PROMPTS["pricer"].get(lang, SYSTEM_PROMPTS["pricer"]["ca"])


@pricer_agent.tool
def get_official_prices(ctx: RunContext[AgentDeps]) -> str:
    """Llista de tractaments i preus base de CECSA."""
    treatments = Tratamiento.objects.all()
    return "\n".join([f"{t.nombre}: {t.precio_base}€ - {t.descripcion}" for t in treatments])
