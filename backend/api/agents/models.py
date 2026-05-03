from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum

class PestType(str, Enum):
    GERMAN_COCKROACH = "german_cockroach"
    AMERICAN_COCKROACH = "american_cockroach"
    ORIENTAL_COCKROACH = "oriental_cockroach"
    RAT = "rat"
    MOUSE = "mouse"
    TERMITE = "termite"
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
    message: str
    available_slots: List[dict] = []  # [{"date": "...", "time": "...", "slot_time": "ISO"}]
    booking_confirmed: bool = False
    booking_uid: Optional[str] = None
