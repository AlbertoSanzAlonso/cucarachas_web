from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum

class PestType(str, Enum):
    CUCARACHA_ALEMANA = "alemanya"
    CUCARACHA_AMERICANA = "americana"
    CUCARACHA_ORIENTAL = "orientalis"
    RATA = "rata"
    RATOLI = "ratoli"
    TERMITA = "termita"
    ALTRE = "altre"

class Severity(str, Enum):
    BAIXA = "baixa"
    MITJA = "mitja"
    ALTA = "alta"
    CRITICA = "critica"

class Intent(str, Enum):
    PRESSUPOST = "pressupost"
    URGENCIA = "urgencia"
    CITA = "cita"
    DUDA = "duda"
    SEGUIMENT = "seguiment"

# Estado compartido que viaja entre agentes
class AgentState(BaseModel):
    customer_name: Optional[str] = None
    city: Optional[str] = None
    property_type: Optional[Literal["particular", "negoci", "comunitat"]] = None
    pest_type: Optional[PestType] = None
    intent: Optional[Intent] = None
    severity: Severity = Severity.BAIXA
    technical_notes: List[str] = []
    estimated_price: Optional[float] = None
    is_urgent: bool = False

# Respuesta del Agente Recepcionista
class ReceptionistOutput(BaseModel):
    message: str
    detected_intent: Optional[Intent]
    collected_data: AgentState
    next_agent: Literal["diagnostician", "receptionist", "pricer", "human"]

# Respuesta del Agente Diagnóstico
class DiagnosisOutput(BaseModel):
    questions: List[str] # Preguntas para profundizar
    identified_pest: Optional[PestType]
    severity: Severity
    needs_more_info: bool
    explanation: str

# Respuesta del Agente Presupuestador
class PricingOutput(BaseModel):
    price_range_min: float
    price_range_max: float
    final_price: Optional[float]
    currency: str = "EUR"
    breakdown: List[str]
    guarantee_months: int
