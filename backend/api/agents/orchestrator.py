import asyncio
import json
import dataclasses
from typing import Optional, List
from pydantic import TypeAdapter
from pydantic_ai.messages import ModelMessage
from .models import AgentState, Intent, AgentDeps
from .receptionist import receptionist_agent
from .diagnostician import diagnostician_agent
from .pricer import pricer_agent
from .scheduler import scheduler_agent
from .crm_agent import crm_agent
from .prompts import ORCHESTRATOR_MESSAGES

# Adaptador para serializar/deserializar la lista de mensajes de Pydantic-AI
messages_adapter = TypeAdapter(List[ModelMessage])

def serialize_message(m):
    """Serializador universal para mensajes de Pydantic-AI."""
    if hasattr(m, 'model_dump'):
        return m.model_dump()
    if dataclasses.is_dataclass(m):
        return dataclasses.asdict(m)
    if hasattr(m, 'dict'):
        return m.dict()
    return m

class CECSAOrchestrator:
    def __init__(self):
        self.state = AgentState()

    def _get_history(self) -> List[ModelMessage]:
        """Convierte el historial de dicts a objetos ModelMessage usando TypeAdapter."""
        if not self.state.history:
            return []
        try:
            return messages_adapter.validate_python(self.state.history)
        except Exception as e:
            print(f"DEBUG: Error validando historial con TypeAdapter: {e}")
            return []

    async def process_message(self, message: str):
        try:
            # 0. Detección de Idioma (Hint del frontend o detección por keywords)
            msg_lower = message.lower()
            if 'idioma: es' in msg_lower or any(word in msg_lower for word in ['tengo', 'hay', 'donde', 'quiero', 'cita', 'presupuesto']):
                self.state.language = 'es'
            elif 'idioma: ca' in msg_lower or any(word in msg_lower for word in ['tinc', 'hi ha', 'on', 'vull', 'pressupost', 'quan']):
                self.state.language = 'ca'
            
            # Crear dependencias para los agentes
            deps = AgentDeps(language=self.state.language)

            # 1. Detectar si es el prompt del diagnóstico interactivo de 7 pasos
            diagnostic_keywords = ['diagnòstic interactiu', 'diagnóstico interactivo', 'veredicte personalitzat']
            if any(kw in message.lower() for kw in diagnostic_keywords):
                self.state.intent = Intent.QUOTE
                if 'barcelona' in message.lower():
                    self.state.city = 'Barcelona'

            # Detectar intención de cita directamente por keywords
            scheduling_keywords = ['cita', 'visita', 'agendar', 'reservar', 'quan podeu', 'cuando']
            if any(kw in message.lower() for kw in scheduling_keywords) and self.state.intent != Intent.QUOTE:
                self.state.intent = Intent.APPOINTMENT

            # 2. Routing por intención de cita → Scheduler Agent
            if self.state.intent == Intent.APPOINTMENT:
                try:
                    context = (
                        f"Context del client: Plaga identificada: {self.state.pest_type or 'no especificada'}, "
                        f"Severitat: {self.state.severity}, Ciutat: {self.state.city or 'Barcelona'}. "
                        f"Missatge: {message}"
                    )
                    print(f"DEBUG: Calling Scheduler Agent for: {message}")
                    sched_response = await asyncio.wait_for(
                        scheduler_agent.run(context, deps=deps, message_history=self._get_history()), 
                        timeout=20.0
                    )
                    try:
                        self.state.history = messages_adapter.dump_python(sched_response.all_messages())
                    except Exception as e:
                        print(f"WARNING: Error saving scheduler history: {e}")
                    output = sched_response.output

                    return {
                        "message": output.message,
                        "slots": output.available_slots,
                        "booking_confirmed": output.booking_confirmed,
                        "booking_uid": output.booking_uid
                    }
                except Exception as e:
                    print(f"ERROR in Scheduler phase: {e}")
                    # Fallback al siguiente bloque

            # 3. Fase de Recepción
            if (not self.state.intent or not self.state.city) and self.state.intent != Intent.QUOTE:
                try:
                    print(f"DEBUG: Calling Receptionist Agent for: {message}")
                    context_recep = f"Idioma: {self.state.language}. Ciudad actual: {self.state.city or 'Desconocida'}. Intención: {self.state.intent or 'Desconocida'}."
                    response = await asyncio.wait_for(
                        receptionist_agent.run(
                            f"Context: {context_recep}\nUsuario: {message}", 
                            deps=deps,
                            message_history=self._get_history()
                        ),
                        timeout=20.0
                    )
                    self.state = response.output.collected_data
                    try:
                        self.state.history = messages_adapter.dump_python(response.all_messages())
                    except Exception as e:
                        print(f"WARNING: Error saving receptionist history: {e}")
                    self.state.language = deps.language # Mantener idioma

                    if response.output.next_agent == "scheduler":
                        self.state.intent = Intent.APPOINTMENT
                        return await self.process_message(message)

                    return {"message": response.output.message}
                except Exception as e:
                    print(f"ERROR in Receptionist phase: {e}")

            # 4. Fase de Diagnóstico / Presupuesto
            # A. Presupuesto (solo si ya tenemos diagnóstico)
            if self.state.pest_type and (self.state.intent == Intent.QUOTE or "pressupost" in message.lower() or "presupuesto" in message.lower()):
                try:
                    print(f"DEBUG: Calling Pricer Agent for: {message}")
                    context_price = f"Plaga: {self.state.pest_type}. Gravedad: {self.state.severity}. Ciudad: {self.state.city}."
                    price_response = await asyncio.wait_for(
                        pricer_agent.run(
                            f"Context: {context_price}", 
                            deps=deps,
                            message_history=self._get_history()
                        ),
                        timeout=20.0
                    )
                    try:
                        self.state.history = messages_adapter.dump_python(price_response.all_messages())
                    except Exception as e:
                        print(f"WARNING: Error saving price history: {e}")
                    
                    output = price_response.output
                    msg = ORCHESTRATOR_MESSAGES[self.state.language]["pricing_template"].format(
                        min=output.price_range_min,
                        max=output.price_range_max,
                        breakdown=', '.join(output.breakdown),
                        months=output.guarantee_months
                    )
                    return {"message": msg}
                except Exception as e:
                    print(f"ERROR in Pricing phase: {e}")

            # B. Diagnóstico Inicial
            if self.state.intent in [Intent.QUOTE, Intent.URGENCY] and not self.state.pest_type:
                try:
                    print(f"DEBUG: Calling Diagnostician Agent for: {message}")
                    context_diag = f"Ciudad: {self.state.city}. Datos previo: {message}"
                    diag_response = await asyncio.wait_for(
                        diagnostician_agent.run(
                            f"Resum dades: {context_diag}",
                            deps=deps,
                            message_history=self._get_history()
                        ),
                        timeout=25.0
                    )
                    try:
                        self.state.history = messages_adapter.dump_python(diag_response.all_messages())
                    except Exception as e:
                        print(f"WARNING: Error saving diag history: {e}")

                    if diag_response.output.identified_pest:
                        self.state.pest_type = diag_response.output.identified_pest
                        self.state.severity = diag_response.output.severity

                        # --- PASO DE SÍNTESIS INTELIGENTE (CRM AGENT) ---
                        try:
                            print(f"DEBUG: Calling CRM Agent for Synthesis...")
                            crm_res = await asyncio.wait_for(
                                crm_agent.run(
                                    f"Dades identificades: {self.state.pest_type}, Severitat: {self.state.severity}. Usuari diu: {message}",
                                    deps=deps
                                ),
                                timeout=20.0
                            )
                            self.state.summary = crm_res.output.summary
                            # Devolvemos la síntesis profesional en lugar de la explicación cruda
                            return {"message": crm_res.output.summary}
                        except Exception as e:
                            print(f"WARNING: Error in CRM Synthesis: {e}")
                            return {"message": diag_response.output.explanation}

                    return {"message": diag_response.output.explanation}
                except Exception as e:
                    print(f"ERROR in Diagnosis phase: {e}")

            return {"message": ORCHESTRATOR_MESSAGES[self.state.language]["fallback"]}

        except Exception as e:
            import traceback
            print(f"FATAL ERROR in Orchestrator: {traceback.format_exc()}")
            return {"message": f"CECSA Assistant Error: {str(e)}"}
