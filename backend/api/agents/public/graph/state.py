from typing import Any, NotRequired, TypedDict


class CECSAGraphState(TypedDict):
    """Estado compartido del grafo LangGraph (serializable vía sesión Django)."""

    message: str
    language: str
    agent_state: dict
    source: NotRequired[str]
    diagnostic: NotRequired[dict[str, Any]]
    route: NotRequired[str]
    result: NotRequired[dict[str, Any]]
    missing_intake_fields: NotRequired[list[str]]
