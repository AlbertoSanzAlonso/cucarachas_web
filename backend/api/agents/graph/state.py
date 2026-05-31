from typing import Any, NotRequired, TypedDict


class CECSAGraphState(TypedDict):
    """Estado compartido del grafo LangGraph (serializable vía sesión Django)."""

    message: str
    language: str
    agent_state: dict
    source: NotRequired[str]
    route: NotRequired[str]
    result: NotRequired[dict[str, Any]]
