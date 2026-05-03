import asyncio
from typing import Optional
from .models import AgentState, Intent, AgentDeps
from .receptionist import receptionist_agent
from .diagnostician import diagnostician_agent
from .pricer import pricer_agent
from .scheduler import scheduler_agent

class CECSAOrchestrator:
    def __init__(self):
        self.state = AgentState()

    async def process_message(self, message: str):
        # 0. Detección de Idioma
        if 'idioma: es' in message.lower():
            self.state.language = 'es'
        elif 'idioma: ca' in message.lower():
            self.state.language = 'ca'
        
        # Crear dependencias para los agentes
        deps = AgentDeps(language=self.state.language)

        # 1. Detectar si es el prompt del diagnóstico interactivo de 7 pasos
        diagnostic_keywords = ['diagnòstic interactiu', 'diagnóstico interactivo', 'veredicte personalitzat']
        if any(kw in message.lower() for kw in diagnostic_keywords):
            self.state.intent = Intent.PRESSUPOST
            if 'barcelona' in message.lower():
                self.state.city = 'Barcelona'

        # Detectar intención de cita directamente por keywords
        scheduling_keywords = ['cita', 'visita', 'agendar', 'reservar', 'quan podeu', 'cuando']
        if any(kw in message.lower() for kw in scheduling_keywords) and self.state.intent != Intent.PRESSUPOST:
            self.state.intent = Intent.CITA

        # 2. Routing por intención de cita → Scheduler Agent
        try:
            if self.state.intent == Intent.CITA:
                context = (
                    f"Context del client: Plaga identificada: {self.state.pest_type or 'no especificada'}, "
                    f"Severitat: {self.state.severity}, Ciutat: {self.state.city or 'Barcelona'}. "
                    f"Missatge: {message}"
                )
                print(f"DEBUG: Calling Scheduler Agent for: {message}")
                sched_response = await scheduler_agent.run(context, deps=deps)
                output = sched_response.output

                return {
                    "message": output.message,
                    "slots": output.available_slots,
                    "booking_confirmed": output.booking_confirmed,
                    "booking_uid": output.booking_uid
                }
        except Exception as e:
            print(f"ERROR in Scheduler Agent: {str(e)}")
            msg = "Ho sento, tinc problemes amb l'agenda." if self.state.language == 'ca' else "Lo siento, tengo problemas con la agenda."
            return {"message": f"{msg} (Error: {str(e)})"}

        # 3. Fase de Recepción
        try:
            if (not self.state.intent or not self.state.city) and self.state.intent != Intent.PRESSUPOST:
                print(f"DEBUG: Calling Receptionist Agent for: {message}")
                response = await receptionist_agent.run(message, deps=deps)
                self.state = response.output.collected_data
                self.state.language = deps.language # Mantener idioma

                if response.output.next_agent == "scheduler":
                    self.state.intent = Intent.CITA
                    return await self.process_message(message)

                return {"message": response.output.message}
        except Exception as e:
            print(f"ERROR in Receptionist Agent: {str(e)}")
            return {"message": f"CECSA Assistant Error: {str(e)}"}

        # 4. Fase de Diagnóstico / Presupuesto
        try:
            # A. Presupuesto (solo si ya tenemos diagnóstico)
            if self.state.pest_type and (self.state.intent == Intent.PRESSUPOST or "pressupost" in message.lower() or "presupuesto" in message.lower()):
                print(f"DEBUG: Calling Pricer Agent for: {message}")
                price_response = await pricer_agent.run(f"Context: {self.state.model_dump_json()}", deps=deps)
                output = price_response.output
                
                # Formateo manual para asegurar consistencia de idioma
                if self.state.language == 'es':
                    msg = (
                        f"Basándonos en el diagnóstico técnico, aquí tienes la estimación del servicio:\n\n"
                        f"💰 **Presupuesto estimado**: {output.price_range_min}€ - {output.price_range_max}€\n"
                        f"📋 **Desglose**: {', '.join(output.breakdown)}\n"
                        f"🛡️ **Garantía**: {output.guarantee_months} meses de cobertura total.\n\n"
                        "¿Quieres agendar la inspección gratuita para confirmar estos detalles?"
                    )
                else:
                    msg = (
                        f"Basant-nos en el diagnòstic tècnic, aquí tens l'estimació del servei:\n\n"
                        f"💰 **Pressupost estimat**: {output.price_range_min}€ - {output.price_range_max}€\n"
                        f"📋 **Desglossament**: {', '.join(output.breakdown)}\n"
                        f"🛡️ **Garantia**: {output.guarantee_months} mesos de cobertura total.\n\n"
                        "Vols agendar la inspecció gratuïta per confirmar aquests detalls?"
                    )
                return {"message": msg}

            # B. Diagnóstico Inicial
            if self.state.intent in [Intent.PRESSUPOST, Intent.URGENCIA] and not self.state.pest_type:
                print(f"DEBUG: Calling Diagnostician Agent for: {message}")
                diag_response = await diagnostician_agent.run(
                    f"Context: {self.state.model_dump_json()}\nClient: {message}",
                    deps=deps
                )
                if diag_response.output.identified_pest:
                    self.state.pest_type = diag_response.output.identified_pest
                    self.state.severity = diag_response.output.severity

                return {"message": diag_response.output.explanation}
        except Exception as e:
            print(f"ERROR in Diagnosis/Pricer Phase: {str(e)}")
            msg = "Ho sento, necessito que un tècnic humà revisi això." if self.state.language == 'ca' else "Lo siento, necesito que un técnico humano revise esto."
            return {"message": f"{msg} (Error: {str(e)})"}

        return {"message": "Gràcies / Gracias. Un agent humà es posarà en contacte amb tu."}
