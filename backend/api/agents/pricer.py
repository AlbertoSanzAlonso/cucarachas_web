from pydantic_ai import Agent, RunContext
from .models import AgentState, PricingOutput, AgentDeps
from api.models import Tratamiento
from .config import AGENT_MODEL
from .prompts import SYSTEM_PROMPTS

# Agente 3: Presupuestador
pricer_agent = Agent(
    AGENT_MODEL,
    deps_type=AgentDeps,
    output_type=PricingOutput,
    retries=3
)

@pricer_agent.tool
def get_official_prices(ctx: RunContext[None]) -> str:
    """Llista de tractaments i preus base de CECSA."""
    treatments = Tratamiento.objects.all()
    return "\n".join([f"{t.nombre}: {t.precio_base}€ - {t.descripcion}" for t in treatments])
