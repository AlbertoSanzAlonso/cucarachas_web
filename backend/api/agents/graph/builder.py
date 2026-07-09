from functools import lru_cache

from langgraph.graph import END, START, StateGraph

from .. import bootstrap  # noqa: F401 — inicializa API keys una sola vez
from . import nodes
from .routing import after_diagnostician, after_receptionist, choose_agent_route
from .state import CECSAGraphState


def _route_map() -> dict:
    return {
        "scheduler": "scheduler",
        "receptionist": "receptionist",
        "pricer": "pricer",
        "diagnostician": "diagnostician",
        "intake": "intake",
        "fallback": "fallback",
    }


@lru_cache(maxsize=1)
def get_cecsa_graph():
    """Grafo compilado (singleton) para no recompilar en cada petición."""
    graph = StateGraph(CECSAGraphState)

    graph.add_node("preprocess", nodes.preprocess_node)
    graph.add_node("receptionist", nodes.receptionist_node)
    graph.add_node("scheduler", nodes.scheduler_node)
    graph.add_node("pricer", nodes.pricer_node)
    graph.add_node("diagnostician", nodes.diagnostician_node)
    graph.add_node("intake", nodes.intake_node)
    graph.add_node("crm", nodes.crm_node)
    graph.add_node("fallback", nodes.fallback_node)

    graph.add_edge(START, "preprocess")
    graph.add_conditional_edges("preprocess", choose_agent_route, _route_map())

    graph.add_conditional_edges(
        "receptionist",
        after_receptionist,
        {
            "scheduler": "scheduler",
            "diagnostician": "diagnostician",
            "pricer": "pricer",
            "intake": "intake",
            "done": END,
        },
    )
    graph.add_conditional_edges(
        "diagnostician",
        after_diagnostician,
        {"crm": "crm", "done": END},
    )

    for terminal in ("scheduler", "pricer", "intake", "crm", "fallback"):
        graph.add_edge(terminal, END)

    return graph.compile()
