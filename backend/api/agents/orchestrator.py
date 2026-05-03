import asyncio
from typing import Optional
from .models import AgentState, Intent
from .receptionist import receptionist_agent
from .diagnostician import diagnostician_agent
from .pricer import pricer_agent
from .scheduler import scheduler_agent

class CECSAOrchestrator:
    def __init__(self):
        self.state = AgentState()

    async def process_message(self, message: str):
        # 0. Detectar si es el prompt del diagnóstico interactivo de 7 pasos
        diagnostic_keywords = ['diagnòstic interactiu', 'diagnóstico interactivo', 'veredicte personalitzat']
        if any(kw in message.lower() for kw in diagnostic_keywords):
            self.state.intent = Intent.PRESSUPOST
            # Si es el diagnóstico, intentamos extraer la ciudad si existe
            if 'barcelona' in message.lower():
                self.state.city = 'Barcelona'

        # Detectar intención de cita directamente por keywords si no tenemos intent
        scheduling_keywords = ['cita', 'visita', 'agendar', 'reservar', 'quan podeu', 'cuando']
        if any(kw in message.lower() for kw in scheduling_keywords) and self.state.intent != Intent.PRESSUPOST:
            self.state.intent = Intent.CITA

        # 1. Routing por intención de cita → Scheduler Agent
        try:
            if self.state.intent == Intent.CITA:
                context = (
                    f"Context del client: Plaga identificada: {self.state.pest_type or 'no especificada'}, "
                    f"Severitat: {self.state.severity}, Ciutat: {self.state.city or 'Barcelona'}. "
                    f"Missatge: {message}"
                )
                print(f"DEBUG: Calling Scheduler Agent for: {message}")
                sched_response = await scheduler_agent.run(context)
                output = sched_response.output

                return {
                    "message": output.message,
                    "slots": output.available_slots,
                    "booking_confirmed": output.booking_confirmed,
                    "booking_uid": output.booking_uid
                }
        except Exception as e:
            print(f"ERROR in Scheduler Agent: {str(e)}")
            return {"message": f"Ho sento, tinc problemes per connectar amb l'agenda. (Error: {str(e)})"}

        # 2. Fase de Recepción
        try:
            # Si NO es un diagnóstico (PRESSUPOST) y nos falta ciudad o intención, llamamos al recepcionista
            if (not self.state.intent or not self.state.city) and self.state.intent != Intent.PRESSUPOST:
                print(f"DEBUG: Calling Receptionist Agent for: {message}")
                response = await receptionist_agent.run(message)
                self.state = response.output.collected_data

                if response.output.next_agent == "scheduler":
                    self.state.intent = Intent.CITA
                    return await self.process_message(message)

                return {"message": response.output.message}
        except Exception as e:
            print(f"ERROR in Receptionist Agent: {str(e)}")
            return {"message": f"Sóc l'assistent de CECSA. He tingut un petit problema tècnic: {str(e)}"}

        # 3. Fase de Diagnóstico
        try:
            # A. Si el cliente ya tiene un diagnóstico y pide el presupuesto explícitamente
            if self.state.pest_type and (self.state.intent == Intent.PRESSUPOST or "pressupost" in message.lower()):
                print(f"DEBUG: Calling Pricer Agent for: {message}")
                price_response = await pricer_agent.run(f"Context: {self.state.model_dump_json()}")
                output = price_response.output
                return {
                    "message": (
                        f"Basant-nos en el diagnòstic tècnic, aquí tens l'estimació del servei:\n\n"
                        f"💰 **Pressupost estimat**: {output.price_range_min}€ - {output.price_range_max}€\n"
                        f"📋 **Desglossament**: {', '.join(output.breakdown)}\n"
                        f"🛡️ **Garantia**: {output.guarantee_months} mesos de cobertura total.\n\n"
                        "Vols agendar la inspecció gratuïta per confirmar aquests detalls?"
                    )
                }

            # B. Fase de diagnóstico inicial (si aún no sabemos la plaga)
            if self.state.intent in [Intent.PRESSUPOST, Intent.URGENCIA] and not self.state.pest_type:
                print(f"DEBUG: Calling Diagnostician Agent for: {message}")
                diag_response = await diagnostician_agent.run(
                    f"Context: {self.state.model_dump_json()}\nClient: {message}"
                )
                if diag_response.output.identified_pest:
                    self.state.pest_type = diag_response.output.identified_pest
                    self.state.severity = diag_response.output.severity

                return {"message": diag_response.output.explanation}
        except Exception as e:
            print(f"ERROR in Diagnosis/Pricer Phase: {str(e)}")
            return {"message": "He analitzat la teva sol·licitud, però necessito que un tècnic humà revisi els detalls. Et trucarem el més aviat possible."}

        return {"message": "Gràcies. Un agent humà es posarà en contacte amb tu per finalitzar els detalls."}
