import asyncio
from typing import Optional
from .models import AgentState, Intent
from .receptionist import receptionist_agent
from .diagnostician import diagnostician_agent
from .pricer import pricer_agent

class CECSAOrchestrator:
    def __init__(self):
        self.state = AgentState()

    async def process_message(self, message: str):
        # 1. Fase de Recepción (Siempre pasa primero si no tenemos datos básicos)
        if not self.state.intent or not self.state.city:
            response = await receptionist_agent.run(message)
            self.state = response.output.collected_data
            
            if response.output.next_agent == "diagnostician":
                # Si ya captamos intención, saltamos al diagnóstico en el mismo turno si es posible
                # o simplemente devolvemos el mensaje del recepcionista.
                return response.output.message
            return response.output.message

        # 2. Fase de Diagnóstico
        if self.state.intent in [Intent.PRESSUPOST, Intent.URGENCIA] and not self.state.pest_type:
            diag_response = await diagnostician_agent.run(
                f"Context: {self.state.json()}\nClient: {message}"
            )
            if diag_response.output.identified_pest:
                self.state.pest_type = diag_response.output.identified_pest
                self.state.severity = diag_response.output.severity
            
            if diag_response.output.needs_more_info:
                return diag_response.output.explanation # Retorna las preguntas técnicas
            
            # Si ya tenemos diagnóstico, pasamos a precio
            price_response = await pricer_agent.run(f"Context: {self.state.json()}")
            return f"{diag_response.output.explanation}\n\nPressupost estimat: {price_response.output.price_range_min}€ - {price_response.output.price_range_max}€.\nDesglossament: {', '.join(price_response.output.breakdown)}"

        return "Gràcies. Un agent humà es posarà en contacte amb tu per finalitzar els detalls."

# Ejemplo de uso:
# orchestrator = CECSAOrchestrator()
# reply = await orchestrator.process_message("Hola, tinc paneroles al bar de Barcelona")
