import os

# Configuración del modelo de IA
# Por defecto usamos OpenAI GPT-4o-mini, pero se puede sobrescribir vía env var
AGENT_MODEL = os.getenv('AGENT_MODEL', 'openai:gpt-4o-mini')

# Modelos permitidos en el selector del asistente de oficina (allowlist).
OPS_AGENT_MODELS = (
    {"id": "openai:gpt-6-astra", "label": "GPT-6 Astra"},
    {"id": "openai:gpt-5.6", "label": "GPT-5.6"},
    {"id": "openai:gpt-5.6-terra", "label": "GPT-5.6 Terra"},
    {"id": "openai:gpt-5.6-luna", "label": "GPT-5.6 Luna"},
    {"id": "openai:gpt-4.1", "label": "GPT-4.1"},
    {"id": "openai:gpt-4o", "label": "GPT-4o"},
    {"id": "openai:gpt-4o-mini", "label": "GPT-4o mini"},
    {"id": "google:gemini-3.8-flash", "label": "Gemini 3.8 Flash"},
    {"id": "google:gemini-3.7-flash", "label": "Gemini 3.7 Flash"},
    {"id": "google:gemini-3.5-flash", "label": "Gemini 3.5 Flash"},
    {"id": "google:gemini-3.1-pro-preview", "label": "Gemini 3.1 Pro"},
    {"id": "google:gemini-2.5-pro", "label": "Gemini 2.5 Pro"},
)

_OPS_MODEL_IDS = {item["id"] for item in OPS_AGENT_MODELS}
_OPS_MODEL_ALIASES = {
    "google-gla:gemini-2.0-flash": "google:gemini-3.8-flash",
    "google-gla:gemini-2.5-flash": "google:gemini-2.5-pro",
    "google:gemini-2.0-flash": "google:gemini-3.8-flash",
    "openai:gpt-4.1-mini": "openai:gpt-5.6-luna",
}


def resolve_ops_model(requested: str | None) -> str:
    """Solo modelos de la allowlist. Si no vale, AGENT_MODEL o gpt-4o-mini."""
    raw = (requested or "").strip()
    raw = _OPS_MODEL_ALIASES.get(raw, raw)
    if raw in _OPS_MODEL_IDS:
        return raw
    if AGENT_MODEL in _OPS_MODEL_IDS:
        return AGENT_MODEL
    return "openai:gpt-4o-mini"


# Límite de turnos de historial enviados al LLM (reduce tokens por petición)
HISTORY_MAX_TURNS = int(os.getenv('AGENT_HISTORY_MAX_TURNS', '6'))

# Síntesis CRM post-diagnóstico (LLM extra); desactivar con AGENT_ENABLE_CRM=false
ENABLE_CRM_SYNTHESIS = os.getenv('AGENT_ENABLE_CRM', 'true').lower() in ('1', 'true', 'yes')

# Reserva de citas en el chat cliente. Off por defecto: no hay agenda iGEO.
# Reactivar: AGENT_ENABLE_CLIENT_SCHEDULING=true (+ VITE_ENABLE_CLIENT_SCHEDULING=true)
ENABLE_CLIENT_SCHEDULING = os.getenv('AGENT_ENABLE_CLIENT_SCHEDULING', 'false').lower() in (
    '1',
    'true',
    'yes',
)

# Timeouts por nodo (segundos)
AGENT_TIMEOUTS = {
    'receptionist': float(os.getenv('AGENT_TIMEOUT_RECEPTIONIST', '20')),
    'scheduler': float(os.getenv('AGENT_TIMEOUT_SCHEDULER', '20')),
    'pricer': float(os.getenv('AGENT_TIMEOUT_PRICER', '20')),
    'diagnostician': float(os.getenv('AGENT_TIMEOUT_DIAGNOSTICIAN', '25')),
    'crm': float(os.getenv('AGENT_TIMEOUT_CRM', '20')),
}

# Asegurar que las API Keys estén presentes en el entorno
def setup_ai_keys(model_name: str = AGENT_MODEL):
    """
    Configura solo la llave necesaria según el proveedor del modelo seleccionado.
    Evita el 'Side Effect' de configurar llaves que no se van a usar.
    """
    if not model_name:
        return None

    # Extrae el proveedor (ej: 'openai', 'groq', 'google', 'gemini')
    provider = model_name.split(':')[0].lower()
    
    keys = {
        'openai': os.getenv('OPENAI_API_KEY'),
        'groq': os.getenv('GROQ_API_KEY'),
        'google': os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY'),
        'gemini': os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY'),
        'google-gla': os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    }

    key = keys.get(provider)

    if key:
        # Mapeo de nombre de variable de entorno según el proveedor
        if provider in ['google', 'gemini', 'google-gla']:
            env_var_name = 'GEMINI_API_KEY'
        else:
            env_var_name = f"{provider.upper()}_API_KEY"
            
        os.environ[env_var_name] = key
        print(f"✅ AI Config: Cargada llave para {provider} en {env_var_name}")
        return key
    
    print(f"❌ AI Config: No se ha encontrado ninguna llave para el proveedor {provider}")
    return None
