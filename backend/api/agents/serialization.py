import json
from typing import Any, List

from pydantic_ai.messages import ModelMessage
from pydantic import TypeAdapter

from .models import AgentState

messages_adapter = TypeAdapter(List[ModelMessage])


def make_json_safe(data: Any) -> Any:
    """Convierte cualquier estructura a tipos compatibles con JSON (sesión Django)."""
    return json.loads(json.dumps(data, default=str))


def dump_message_history(messages) -> list:
    """Serializa el historial de pydantic-ai de forma segura para la sesión."""
    try:
        raw = messages_adapter.dump_python(messages)
        return make_json_safe(raw)
    except Exception as e:
        print(f"WARNING: Error serializing message history: {e}")
        return []


def state_for_session(state: AgentState) -> dict:
    """Estado del agente listo para guardar en request.session."""
    return make_json_safe(state.model_dump(mode="json"))


def normalize_language(language: str | None) -> str:
    """El backend solo soporta ca/es; el frontend puede enviar 'en' o variantes regionales."""
    if not language:
        return "ca"
    lang = language.lower().split("-")[0]
    return "es" if lang.startswith("es") else "ca"
