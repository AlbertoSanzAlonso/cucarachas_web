import sys
import traceback
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def debug_system(request):
    """Endpoint para diagnosticar fallos críticos de importación y versiones."""
    info = {
        "python_version": sys.version,
        "path": sys.path,
        "imports": {}
    }
    
    # Probar importaciones críticas una a una
    try:
        import pydantic
        info["imports"]["pydantic"] = pydantic.__version__
        from pydantic import TypeAdapter
        info["imports"]["TypeAdapter"] = "OK"
    except Exception as e:
        info["imports"]["pydantic_error"] = str(e)

    try:
        import pydantic_ai
        info["imports"]["pydantic_ai"] = "Installed"
    except Exception as e:
        info["imports"]["pydantic_ai_error"] = str(e)

    try:
        # Intentar cargar el orquestador (aquí es donde sospecho el 500)
        from api.agents.orchestrator import CECSAOrchestrator
        info["imports"]["orchestrator"] = "OK"
    except Exception as e:
        info["imports"]["orchestrator_error"] = traceback.format_exc()

    return Response(info)
