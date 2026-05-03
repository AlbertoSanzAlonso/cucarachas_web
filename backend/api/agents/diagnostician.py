from pydantic_ai import Agent, RunContext
from .models import AgentState, DiagnosisOutput, PestType, Severity, AgentDeps
from api.models import Species
from knowledge.retriever import retrieve_relevant_knowledge
from .config import AGENT_MODEL
from .prompts import SYSTEM_PROMPTS

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
def search_technical_knowledge(ctx: RunContext[None], query: str) -> str:
    """Busca protocols tècnics i informació científica a la base de dades RAG de CECSA."""
    return retrieve_relevant_knowledge(query)

@diagnostician_agent.tool
def get_bio_prevention_tips(ctx: RunContext[None], pest_type: str) -> str:
    """Retorna consells immediats d'exclusió mecànica i prevenció ètica basats en l'espècie."""
    tips = {
        "alemanya": "Revisa el segellat del motor de la nevera i neteja restes orgàniques darrere els electrodomèstics.",
        "americana": "Bloqueja els desguassos durant la nit i revisa les juntes de les tapes de clavegueram.",
        "orientalis": "Redueix la humitat en zones fosques i segella esquerdes en el paviment del soterrani."
    }
    return tips.get(pest_type, "Mantenir la zona neta i seca, i segellar possibles punts d'entrada estructurals.")

@diagnostician_agent.tool
def lookup_pest_database(ctx: RunContext[None], keyword: str) -> str:
    """Consulta la base de dades tècnica d'espècies de CECSA."""
    species = Species.objects.filter(name__icontains=keyword) | Species.objects.filter(description__icontains=keyword)
    if not species.exists():
        return "Cap espècie trobada a la base de dades."
    
    results = []
    for s in species[:2]:
        results.append(f"{s.name}: {s.description}. Detalls: {s.details}")
    return "\n".join(results)
