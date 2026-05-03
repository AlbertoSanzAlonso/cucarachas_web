from pydantic_ai import Agent, RunContext
from .models import AgentState, PricingOutput
from api.models import Tratamiento

# Agente 3: Presupuestador
# Rol: Calcular precio basado en reglas de negocio y catálogo oficial.
pricer_agent = Agent(
    'google-gla:gemini-1.5-flash-8b',
    output_type=PricingOutput,
    system_prompt=(
        "Ets el Calculador de Pressupostos de CECSA. "
        "Calcula un preu estimat o tancat basant-te en el catàleg oficial. "
        "Regles generals: "
        "- Barcelona ciutat: Desplaçament inclòs. "
        "- Fora de Barcelona: +30€ desplaçament. "
        "- Urgència (mateix dia): +50€ tarifa plana. "
        "- Pisos < 100m2: Preu base del tractament. "
        "- Negocis/Locals: Preu base + 50% (més complexitat). "
        "Sigues transparent amb el desglossament."
    ),
)

@pricer_agent.tool
def get_official_prices(ctx: RunContext[None]) -> str:
    """Llista de tractaments i preus base de CECSA."""
    treatments = Tratamiento.objects.all()
    return "\n".join([f"{t.nombre}: {t.precio_base}€ - {t.descripcion}" for t in treatments])
