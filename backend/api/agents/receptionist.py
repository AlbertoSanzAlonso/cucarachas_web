import os
from pydantic_ai import Agent, RunContext
from .models import ReceptionistOutput, AgentState, AgentDeps
from .config import setup_ai_keys, AGENT_MODEL
from .prompts import SYSTEM_PROMPTS

# Inicializar configuración global
setup_ai_keys()

# Agente 1: Recepcionista
receptionist_agent = Agent(
    AGENT_MODEL,
    deps_type=AgentDeps,
    output_type=ReceptionistOutput,
)

@receptionist_agent.system_prompt
def get_receptionist_prompt(ctx: RunContext[AgentDeps]) -> str:
    lang = ctx.deps.language if ctx.deps else "ca"
    return SYSTEM_PROMPTS["receptionist"].get(lang, SYSTEM_PROMPTS["receptionist"]["ca"])

@receptionist_agent.tool
def get_company_info(ctx: RunContext[AgentDeps]) -> str:
    """Informació básica sobre CECSA per respondre dubtes inicials."""
    return (
        "CECSA és una empresa de control de plagues 'Ètica i Conscient' a Barcelona. "
        "Especialistes en paneroles, rosegadors i tèrmits."
    )
