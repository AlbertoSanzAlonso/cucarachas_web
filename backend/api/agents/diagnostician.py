from pydantic_ai import Agent, RunContext
from .models import AgentState, DiagnosisOutput, PestType, Severity
from api.models import Species
from knowledge.retriever import retrieve_relevant_knowledge

# Agente 2: Diagnóstico Técnico
# Rol: Hacer preguntas inteligentes y clasificar la plaga/gravedad.
diagnostician_agent = Agent(
    'google-gla:gemini-2.5-flash', # Gemini 2.5 para diagnóstico técnico
    output_type=DiagnosisOutput,
    system_prompt=(
        "Ets el Tècnic de Diagnòstic de CECSA. "
        "Tens accés a la Base de Coneixement Tècnica (RAG). "
        "Basant-te en la descripció del client, has de classificar la plaga i la seva gravetat. "
        "Si no estàs segur, utilitza la eina 'search_technical_knowledge' per trobar protocols oficials. "
        "Si encara falten dades, fes preguntes intel·ligents (max 3). "
        "Utilitza el to 'Conscient' i respon siempre en Català."
    ),
)

@diagnostician_agent.tool
def search_technical_knowledge(ctx: RunContext[None], query: str) -> str:
    """Busca protocols tècnics i informació científica a la base de dades RAG de CECSA."""
    return retrieve_relevant_knowledge(query)

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
