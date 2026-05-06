from pydantic_ai import Agent, RunContext
from api.models import Species, Tratamiento
from typing import List, Optional
from pydantic import BaseModel
import os
from .config import AGENT_MODEL
# Definimos los modelos de respuesta estructurada
class TreatmentInfo(BaseModel):
    name: str
    price: float
    description: str

class CRMResponse(BaseModel):
    explanation: str
    recommended_treatments: List[TreatmentInfo]
    next_steps: str

# Inicializamos el agente de PydanticAI
# Usamos el modelo configurado
crm_agent = Agent(
    AGENT_MODEL,
    output_type=CRMResponse,
    system_prompt=(
        "Ets l'assistent virtual expert de CECSA Control de Plagues a Catalunya. "
        "El teu nom és 'CECSA Agent Conscient'. "
        "La teva filosofia és 'Ètic i Conscient': prioritzem l'eficàcia sense danyar l'entorn innecessàriament. "
        "Sempre respons en Català (idioma primari). "
        "El teu objectiu és ajudar els clients a identificar el seu problema de plagues "
        "i recomanar-los el tractament més adequat de la nostra llista oficial. "
        "Sigues professional, autoritari però amable."
    ),
)

@crm_agent.tool
def get_available_treatments(ctx: RunContext[None]) -> List[dict]:
    """
    Consulta la base de dades de CECSA per obtenir els tractaments actuals, 
    els seus preus i descripcions.
    """
    treatments = Tratamiento.objects.all()
    return [
        {
            "nombre": t.nombre,
            "precio": float(t.precio_base),
            "descripcion": t.descripcion,
            "icon": t.icon
        } for t in treatments
    ]

@crm_agent.tool
def identify_pest(ctx: RunContext[None], description: str) -> dict:
    """
    Busca informació tècnica sobre una espècie basada en una descripció o nom.
    """
    # Busqueda simple por texto en nombre o descripción
    species = Species.objects.filter(description__icontains=description) | Species.objects.filter(name__icontains=description)
    
    if not species.exists():
        return {"error": "No hem trobat una espècie que coincideixi exactament amb la descripció. Cal inspecció tècnica."}
    
    s = species.first()
    return {
        "name": s.name,
        "description": s.description,
        "technical_details": s.details
    }
