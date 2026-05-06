import asyncio
import json
import dataclasses
from typing import Optional, List
from pydantic_ai.messages import ModelMessage
from .models import AgentState, Intent, AgentDeps
from .receptionist import receptionist_agent
from .diagnostician import diagnostician_agent
from .pricer import pricer_agent
from .scheduler import scheduler_agent
from .prompts import ORCHESTRATOR_MESSAGES

def serialize_message(m):
    """Serializador universal para mensajes de Pydantic-AI (ModelRequest/Response)."""
    if hasattr(m, 'model_dump'):
        return m.model_dump()
    if hasattr(m, 'dict'):
        return m.dict()
    if dataclasses.is_dataclass(m):
        return dataclasses.asdict(m)
    return m # Dejar que pydantic intente lo mejor

class CECSAOrchestrator:
    def __init__(self):
        self.state = AgentState()

    def _get_history(self) -> List[ModelMessage]:
        """Convierte el historial de dicts (desde la sesión) a objetos ModelMessage de Pydantic-AI."""
        from pydantic_ai.messages import ModelMessage
        messages = []
        for m in self.state.history:
            try:
                # Cada mensaje en history es un dict que Pydantic-AI puede validar
                messages.append(ModelMessage.model_validate(m))
            except Exception as e:
                print(f"DEBUG: Error recuperando mensaje del historial: {e}")
                continue
        return messages

    async def process_message(self, message: str):
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
        try:
            if self.state.intent == Intent.APPOINTMENT:
                context = (
                    f"Context del client: Plaga identificada: {self.state.pest_type or 'no especificada'}, "
                    f"Severitat: {self.state.severity}, Ciutat: {self.state.city or 'Barcelona'}. "
                    f"Missatge: {message}"
                )
                print(f"DEBUG: Calling Scheduler Agent for: {message}")
                sched_response = await asyncio.wait_for(
                    scheduler_agent.run(context, deps=deps, message_history=self._get_history()), 
                    timeout=45.0
                )
                self.state.history = [serialize_message(m) for m in sched_response.all_messages()]
                output = sched_response.output

                return {
                    "message": output.message,
                    "slots": output.available_slots,
                    "booking_confirmed": output.booking_confirmed,
                    "booking_uid": output.booking_uid
                }
        except asyncio.TimeoutError:
            print("TIMEOUT in Scheduler Agent")
            return {"message": ORCHESTRATOR_MESSAGES[self.state.language]["timeout_error"]}
        except Exception as e:
            print(f"ERROR in Scheduler Agent: {str(e)}")
            msg = ORCHESTRATOR_MESSAGES[self.state.language]["error_scheduler"]
            return {"message": f"{msg} (Error: {str(e)})"}

        # 3. Fase de Recepción
        try:
            if (not self.state.intent or not self.state.city) and self.state.intent != Intent.QUOTE:
                print(f"DEBUG: Calling Receptionist Agent for: {message}")
                response = await asyncio.wait_for(
                    receptionist_agent.run(
                        f"Context actual: {self.state.model_dump_json()}\nMissatge usuari: {message}", 
                        deps=deps,
                        message_history=self._get_history()
                    ),
                    timeout=40.0
                )
                self.state = response.output.collected_data
                self.state.history = [serialize_message(m) for m in response.all_messages()]
                self.state.language = deps.language # Mantener idioma

                if response.output.next_agent == "scheduler":
                    self.state.intent = Intent.APPOINTMENT
                    return await self.process_message(message)

                return {"message": response.output.message}
        except asyncio.TimeoutError:
            print("TIMEOUT in Receptionist Agent")
            return {"message": ORCHESTRATOR_MESSAGES[self.state.language]["timeout_error"]}
        except Exception as e:
            print(f"ERROR in Receptionist Agent: {str(e)}")
            msg = ORCHESTRATOR_MESSAGES[self.state.language]["general_error"].format(error=str(e))
            return {"message": msg}

        # 4. Fase de Diagnóstico / Presupuesto
        try:
            # A. Presupuesto (solo si ya tenemos diagnóstico)
            if self.state.pest_type and (self.state.intent == Intent.QUOTE or "pressupost" in message.lower() or "presupuesto" in message.lower()):
                print(f"DEBUG: Calling Pricer Agent for: {message}")
                price_response = await asyncio.wait_for(
                    pricer_agent.run(
                        f"Context: {self.state.model_dump_json()}", 
                        deps=deps,
                        message_history=self._get_history()
                    ),
                    timeout=20.0
                )
                self.state.history = [serialize_message(m) for m in price_response.all_messages()]
                output = price_response.output
                
                # Formateo manual usando la plantilla centralizada para asegurar consistencia de idioma
                msg = ORCHESTRATOR_MESSAGES[self.state.language]["pricing_template"].format(
                    min=output.price_range_min,
                    max=output.price_range_max,
                    breakdown=', '.join(output.breakdown),
                    months=output.guarantee_months
                )
                return {"message": msg}

            # B. Diagnóstico Inicial
            if self.state.intent in [Intent.QUOTE, Intent.URGENCY] and not self.state.pest_type:
                print(f"DEBUG: Calling Diagnostician Agent for: {message}")
                diag_response = await asyncio.wait_for(
                    diagnostician_agent.run(
                        f"Context: {self.state.model_dump_json()}\nClient: {message}",
                        deps=deps,
                        message_history=self._get_history()
                    ),
                    timeout=50.0
                )
                self.state.history = [serialize_message(m) for m in diag_response.all_messages()]
                if diag_response.output.identified_pest:
                    self.state.pest_type = diag_response.output.identified_pest
                    self.state.severity = diag_response.output.severity

                return {"message": diag_response.output.explanation}
        except asyncio.TimeoutError:
            print("TIMEOUT in Diagnosis/Pricer Phase")
            return {"message": ORCHESTRATOR_MESSAGES[self.state.language]["timeout_error"]}
        except Exception as e:
            print(f"ERROR in Diagnosis/Pricer Phase: {str(e)}")
            msg = ORCHESTRATOR_MESSAGES[self.state.language]["error_diagnosis"]
            return {"message": f"{msg} (Error: {str(e)})"}

        return {"message": ORCHESTRATOR_MESSAGES[self.state.language]["fallback"]}
