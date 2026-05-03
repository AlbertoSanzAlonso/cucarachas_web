import os

# --- Configuración de IA (Gemini) ---
# Modelo predeterminado para todos los agentes
AGENT_MODEL = 'google-gla:gemini-1.5-flash-latest'

# Asegurar que la API Key esté presente en el entorno para pydantic-ai
def setup_ai_keys():
    api_key = os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY')
    if api_key:
        os.environ['GEMINI_API_KEY'] = api_key
    return api_key

# --- Configuración de Agenda (Cal.com) ---
CAL_EVENT_TYPE_ID = os.getenv('CAL_EVENT_TYPE_ID', '277401')
CAL_API_KEY = os.getenv('CAL_API_KEY', '').strip()
CAL_BASE_URL = "https://api.cal.eu/v2" # Usamos la instancia europea por defecto
