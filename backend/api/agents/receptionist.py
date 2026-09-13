from pydantic_ai import Agent, RunContext

from . import bootstrap  # noqa: F401
from .company_knowledge import format_company_knowledge_for_agent
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
    base = SYSTEM_PROMPTS["receptionist"].get(lang, SYSTEM_PROMPTS["receptionist"]["ca"])
    facts = format_company_knowledge_for_agent(lang if lang in ("ca", "es") else "ca")
    return (
        f"{base}\n\n"
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
    """Busca en blog, FAQ y guías CECSA (cómo identificar, prevención, consejos)."""
    from knowledge.retriever import retrieve_relevant_knowledge

    return retrieve_relevant_knowledge(
        query,
        limit=3,
        category=["blog", "faq", "species", "company", "general"],
    )
