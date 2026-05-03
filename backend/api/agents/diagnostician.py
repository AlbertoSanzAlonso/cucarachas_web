from pydantic_ai import Agent, RunContext
from .models import AgentState, DiagnosisOutput, PestType, Severity
from api.models import Species
from knowledge.retriever import retrieve_relevant_knowledge
from .config import AGENT_MODEL

# Agente 2: Diagnóstico Técnico
print("🚀 DEBUG: DIAGNOSTICADOR INICIAT")
diagnostician_agent = Agent(
    'google-gla:gemini-1.5-flash',
    output_type=DiagnosisOutput,
    system_prompt=(
        "Ets l'Estratega Bio-Conscient de CECSA, el primer contacte tècnic amb el client. "
        "La teva missió no és només identificar la plaga, sinó 'restablir l'equilibri' eliminant la plaga de forma ètica i conscient. "
        
        "REGLA D'OR: Abans de diagnosticar, has de considerar l'entorn (hàbitat, humitat, punts d'entrada). "
        "No facis servir un llenguatge alarmista. Utilitza un to professional, biòleg i ètic. "
        
        "PROCEDIMENT: "
        "1. Analitza la descripció del client cercant senyals biològics de l'espècie. "
        "2. Utilitza 'search_technical_knowledge' per trobar protocols de mínima invasió. "
        "3. Ofereix consells de prevenció mecànica (Bio-Tips) abans de parlar de productes. "
        "4. Si falten dades, fes màxim 3 preguntes clau sobre l'entorn. "
        
        "Quan generis el veredicte final (DiagnosisOutput), recorda que el client ha completat un procés de diagnòstic de 7 passos. "
        "HAS D'INCLOURE sempre la següent OFERTA ESPECIAL al final de la teva explicació: "
        "'🎁 OFERTA ESPECIAL: Per haver completat el diagnòstic, t'oferim una PRIMERA VISITA D'INSPECCIÓ TOTALMENT GRATUÏTA a Barcelona i rodalies.' "
        "Respon sempre en Català i enfoca't en la prevenció estructural."
    ),
)

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
