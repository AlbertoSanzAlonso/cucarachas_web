from pydantic_ai import Agent, RunContext
from .models import AgentState, ReceptionistOutput, Intent
from typing import Optional

# Agente 1: Recepcionista
# Rol: Saludar, detectar intención y captar datos básicos.
receptionist_agent = Agent(
    'google-gla:gemini-2.5-flash', # Usamos Gemini 2.5 Flash (2026)
    output_type=ReceptionistOutput,
    system_prompt=(
        "Ets el Recepcionista de CECSA Control de Plagues. "
        "La teva missió és saludar amablement i identificar què necessita el client. "
        "Has de recollir: Ciutat, Tipus d'immoble (particular/negoci) i el Problema. "
        "Sigues directe però empàtic. "
        "Si el client té una urgència, marca l'intent com a 'urgencia'. "
        "Sempre respon en Català."
    ),
)

@receptionist_agent.tool
def get_company_info(ctx: RunContext[None]) -> str:
    """Informació básica sobre CECSA per respondre dubtes inicials."""
    return (
        "CECSA és una empresa de control de plagues 'Ètica i Conscient' a Barcelona. "
        "Especialistes en paneroles, rosegadors i tèrmits."
    )
