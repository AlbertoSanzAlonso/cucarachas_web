from pydantic_ai import Agent, RunContext
from .models import AgentState, DiagnosisOutput
from api.models import Species
from knowledge.retriever import retrieve_relevant_knowledge
from .config import AGENT_MODEL, setup_ai_keys
from .prompts import BIO_TIPS, SYSTEM_PROMPTS

setup_ai_keys()

# Agente 2: Diagnóstico Técnico
diagnostician_agent = Agent(
    AGENT_MODEL,
    deps_type=AgentState,
    output_type=DiagnosisOutput,
    retries=3
)

@diagnostician_agent.system_prompt
def get_diagnostician_prompt(ctx: RunContext[AgentState]) -> str:
    lang = ctx.deps.language if ctx.deps else "ca"
    return SYSTEM_PROMPTS["diagnostician"].get(lang, SYSTEM_PROMPTS["diagnostician"]["ca"])

@diagnostician_agent.tool
def search_technical_knowledge(ctx: RunContext[AgentState], query: str) -> str:
    """Searches technical protocols and scientific information in the CECSA RAG database."""
    return retrieve_relevant_knowledge(query)

@diagnostician_agent.tool
def get_bio_prevention_tips(ctx: RunContext[AgentState], pest_type: str) -> str:
    """Returns immediate mechanical exclusion and ethical prevention tips based on the species."""
    lang = ctx.deps.language if ctx.deps else "ca"
    tips = BIO_TIPS.get(lang, BIO_TIPS["ca"])
    return tips.get(pest_type, tips["default"])

@diagnostician_agent.tool
def lookup_pest_database(ctx: RunContext[AgentState], keyword: str) -> str:
    """Queries the CECSA technical database for species information."""
    lang = ctx.deps.language if ctx.deps else "ca"
    
    species = Species.objects.filter(name__icontains=keyword) | Species.objects.filter(description__icontains=keyword)
    if not species.exists():
        return "Cap espècie trobada a la base de dades." if lang == "ca" else "Ninguna especie encontrada en la base de datos."
    
    results = []
    for s in species[:2]:
        results.append(f"{s.name}: {s.description}. Details: {s.details}")
    return "\n".join(results)
