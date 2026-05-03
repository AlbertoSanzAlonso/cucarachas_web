from pydantic_ai import Agent, RunContext
from .models import AgentState, DiagnosisOutput, PestType, Severity, AgentDeps
from api.models import Species
from knowledge.retriever import retrieve_relevant_knowledge
from .config import AGENT_MODEL
from .prompts import SYSTEM_PROMPTS, BIO_TIPS

# Agente 2: Diagnóstico Técnico
diagnostician_agent = Agent(
    AGENT_MODEL,
    deps_type=AgentDeps,
    output_type=DiagnosisOutput,
)

@diagnostician_agent.system_prompt
def get_diagnostician_prompt(ctx: RunContext[AgentDeps]) -> str:
    lang = ctx.deps.language if ctx.deps else "ca"
    return SYSTEM_PROMPTS["diagnostician"].get(lang, SYSTEM_PROMPTS["diagnostician"]["ca"])

@diagnostician_agent.tool
def search_technical_knowledge(ctx: RunContext[AgentDeps], query: str) -> str:
    """Searches technical protocols and scientific information in the CECSA RAG database."""
    return retrieve_relevant_knowledge(query)

@diagnostician_agent.tool
def get_bio_prevention_tips(ctx: RunContext[AgentDeps], pest_type: str) -> str:
    """Returns immediate mechanical exclusion and ethical prevention tips based on the species."""
    lang = ctx.deps.language if ctx.deps else "ca"
    tips = BIO_TIPS.get(lang, BIO_TIPS["ca"])
    return tips.get(pest_type, tips["default"])

@diagnostician_agent.tool
def lookup_pest_database(ctx: RunContext[AgentDeps], keyword: str) -> str:
    """Queries the CECSA technical database for species information."""
    lang = ctx.deps.language if ctx.deps else "ca"
    
    species = Species.objects.filter(name__icontains=keyword) | Species.objects.filter(description__icontains=keyword)
    if not species.exists():
        return "Cap espècie trobada a la base de dades." if lang == "ca" else "Ninguna especie encontrada en la base de datos."
    
    results = []
    for s in species[:2]:
        results.append(f"{s.name}: {s.description}. Details: {s.details}")
    return "\n".join(results)
