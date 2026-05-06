from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum

class PestType(str, Enum):
    GERMAN_COCKROACH = "german_cockroach"
    AMERICAN_COCKROACH = "american_cockroach"
    ORIENTAL_COCKROACH = "oriental_cockroach"
    BROWN_BANDED_COCKROACH = "brown_banded_cockroach"
    OTHER = "other"

class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Intent(str, Enum):
    QUOTE = "quote"
    URGENCY = "urgency"
    APPOINTMENT = "appointment"
    DOUBT = "doubt"
    FOLLOW_UP = "follow_up"

Language = Literal["ca", "es"]

class AgentDeps(BaseModel):
    language: Language = "ca"

# Estado compartido que viaja entre agentes
class AgentState(BaseModel):
    customer_name: Optional[str] = None
    city: Optional[str] = None
    property_type: Optional[Literal["particular", "negoci", "comunitat"]] = None
    pest_type: Optional[PestType] = None
    intent: Optional[Intent] = None
    severity: Severity = Severity.LOW
    technical_notes: List[str] = []
    estimated_price: Optional[float] = None
    is_urgent: bool = False
    language: Language = "ca" # Soporte para catalán y español

# Respuesta del Agente Recepcionista
class ReceptionistOutput(BaseModel):
    message: str
    detected_intent: Optional[Intent]
    collected_data: AgentState
    next_agent: Literal["diagnostician", "receptionist", "pricer", "scheduler", "human"]

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

# Respuesta del Agente Agendador
class SchedulerOutput(BaseModel):
    message: str = Field(description="Mensaje amable para el usuario")
    available_slots: Optional[List[dict]] = Field(default=None, description="Lista de slots [{date, time, slot_time}] si el usuario aún no ha elegido uno")
    booking_confirmed: Optional[bool] = Field(default=False, description="Solo poner True si la reserva se ha creado REALMENTE con éxito")
    booking_uid: Optional[str] = Field(default=None, description="El UID retornado por la herramienta create_booking")
