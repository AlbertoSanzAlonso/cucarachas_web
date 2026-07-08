from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        from api.agents.config import setup_ai_keys
        from api import signals  # noqa: F401 — sincroniza presupuestos → referencia pricer

        setup_ai_keys()
