import os

# --- Configuración de IA (Groq) ---
# Usamos Gemini 1.5 Flash para evitar límites de Groq en producción
AGENT_MODEL = 'google-gla:gemini-1.5-flash'

# Asegurar que la API Key esté presente en el entorno
def setup_ai_keys():
    # Soportamos tanto Groq (preferido) como Gemini
    groq_key = os.getenv('GROQ_API_KEY')
    if groq_key:
        os.environ['GROQ_API_KEY'] = groq_key
        return groq_key
    
    api_key = os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY')
    if api_key:
        os.environ['GEMINI_API_KEY'] = api_key
    return api_key

# --- Configuración de Agenda (Cal.com) ---
CAL_EVENT_TYPE_ID = os.getenv('CAL_EVENT_TYPE_ID', '277401')
CAL_API_KEY = os.getenv('CAL_API_KEY', '').strip()
CAL_BASE_URL = "https://api.cal.eu/v2" # Usamos la instancia europea por defecto
