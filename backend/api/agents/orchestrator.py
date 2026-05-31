from .models import AgentState
from .graph import get_cecsa_graph
from .graph.state import CECSAGraphState


class CECSAOrchestrator:
    """Orquestador CECSA basado en LangGraph (enrutado determinista + nodos Pydantic-AI)."""

    def __init__(self):
        self.state = AgentState()
        self._graph = get_cecsa_graph()

    async def process_message(self, message: str, *, source: str | None = None) -> dict:
        try:
            initial: CECSAGraphState = {
                "message": message,
                "language": self.state.language,
                "agent_state": self.state.model_dump(mode="json"),
            }
            if source:
                initial["source"] = source
            final = await self._graph.ainvoke(initial)
            self.state = AgentState.model_validate(final.get("agent_state") or self.state.model_dump())
            result = final.get("result") or {"message": ""}
            return {
                "message": result.get("message", ""),
                "slots": result.get("slots", []),
                "booking_confirmed": result.get("booking_confirmed", False),
                "booking_uid": result.get("booking_uid"),
            }
        except Exception as e:
            import traceback

            print(f"FATAL ERROR in Orchestrator: {traceback.format_exc()}")
            from .prompts import ORCHESTRATOR_MESSAGES

            lang = self.state.language or "ca"
            return {"message": ORCHESTRATOR_MESSAGES[lang]["general_error"].format(error=str(e))}
