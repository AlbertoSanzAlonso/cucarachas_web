def __getattr__(name: str):
    if name == "get_cecsa_graph":
        from .builder import get_cecsa_graph

        return get_cecsa_graph
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["get_cecsa_graph"]
