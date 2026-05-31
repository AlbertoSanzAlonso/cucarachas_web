from pydantic_ai import Agent, RunContext
from api.models import Species, Tratamiento
from typing import List, Optional
from pydantic import BaseModel
import os
import dataclasses
from . import bootstrap  # noqa: F401
from .config import AGENT_MODEL
from .models import AgentState

# Modelo para la síntesis final del caso
class CaseSynthesis(BaseModel):
    summary: str # Resumen ejecutivo del caso
    pest_confirmed: str # Especie identificada
    severity_rating: str # Alta, Media, Baja
    suggested_treatments: List[str] # Lista de nombres de tratamientos oficiales
    technical_notes: str # Notas para el técnico humano

# Inicializamos el Agente de Síntesis (CRM)
crm_agent = Agent(
    AGENT_MODEL,
    deps_type=AgentState,
    output_type=CaseSynthesis,
    system_prompt=(
        "Ets l'Agent Sintetitzador de CECSA. El teu rol és agafar tota la informació "
        "d'una conversa de diagnòstic i generar un veredicte professional final. "
        "Has de ser precís, ètic i conscient. "
        "Utilitza les eines disponibles per recomanar tractaments reals de la nostra base de dades. "
        "Sempre respon en l'idioma que et demani el client (Català per defecte)."
    ),
)

@crm_agent.tool
def get_official_treatments(ctx: RunContext[AgentState]) -> str:
    """Consulta el catàleg oficial de tractaments de CECSA."""
    try:
        treatments = Tratamiento.objects.all()
        if not treatments:
            return "No hi ha tractaments definits actualment."

        lines = []
        for t in treatments:
            lines.append(f"- {t.nombre}: {t.precio_base}€ ({t.descripcion})")
        return "\n".join(lines)
    except Exception as e:
        print(f"WARNING: get_official_treatments failed: {e}")
        return "Catàleg de tractaments no disponible temporalment."

@crm_agent.tool
def get_species_info(ctx: RunContext[AgentState], name: str) -> str:
    """Obté detalls tècnics d'una espècie de la base de dades."""
    try:
        species = Species.objects.filter(name__icontains=name).first()
        if species:
            return f"Espècie: {species.name}. Detalls: {species.details}"
        return "No s'ha trobat informació tècnica específica."
    except Exception as e:
        print(f"WARNING: get_species_info failed: {e}")
        return "No s'ha pogut consultar la base de dades d'espècies."
