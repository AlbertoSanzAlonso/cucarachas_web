from pydantic_ai import Agent, RunContext

from . import bootstrap  # noqa: F401
from .config import AGENT_MODEL
from .models import AgentState, ReceptionistOutput
from .prompts import SYSTEM_PROMPTS

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
    return SYSTEM_PROMPTS["receptionist"].get(lang, SYSTEM_PROMPTS["receptionist"]["ca"])

@receptionist_agent.tool
def get_company_info(ctx: RunContext[AgentState]) -> str:
    """Informació básica sobre CECSA per respondre dubtes inicials."""
    return (
        "CECSA és una empresa de control de plagues 'Ètica i Conscient' a Barcelona. "
        "Especialistes en paneroles, rosegadors i tèrmits."
    )
