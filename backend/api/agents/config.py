import os

# Configuración del modelo de IA
# Por defecto usamos OpenAI GPT-4o-mini, pero se puede sobrescribir vía env var
AGENT_MODEL = os.getenv('AGENT_MODEL', 'openai:gpt-4o-mini')

# Límite de turnos de historial enviados al LLM (reduce tokens por petición)
HISTORY_MAX_TURNS = int(os.getenv('AGENT_HISTORY_MAX_TURNS', '6'))

# Síntesis CRM post-diagnóstico (LLM extra); desactivar con AGENT_ENABLE_CRM=false
ENABLE_CRM_SYNTHESIS = os.getenv('AGENT_ENABLE_CRM', 'true').lower() in ('1', 'true', 'yes')

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

# --- Configuración de Agenda (Cal.com) ---
CAL_EVENT_TYPE_ID = os.getenv('CAL_EVENT_TYPE_ID', '278962')
CAL_API_KEY = os.getenv('CAL_API_KEY', '').strip()
CAL_BASE_URL = "https://api.cal.eu/v2" # Usamos la instancia europea por defecto
