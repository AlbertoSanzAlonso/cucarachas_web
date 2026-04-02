import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Service

services = [
    {
        "title": "Desinsectación",
        "description": "Control especializado de cucarachas, hormigas y chinches. Analizamos la biología de la plaga para aplicar el tratamiento más efectivo y discreto.",
        "icon": "Bug",
        "color": "#0080bb"
    },
    {
        "title": "Desratización",
        "description": "Erradicación y prevención de roedores mediante monitorización y exclusión técnica, garantizando espacios libres de ratas y ratones.",
        "icon": "Rat",
        "color": "#3c3c3b"
    },
    {
        "title": "Control de Aves",
        "description": "Gestión integral de poblaciones de aves urbanas (palomas) mediante sistemas de protección pasiva y control ético.",
        "icon": "Bird",
        "color": "#2a6b8c"
    },
    {
        "title": "Tratamientos de Madera",
        "description": "Protección contra termitas y otros agentes xilófagos para preservar estructuras, comunidades y mobiliario.",
        "icon": "TreeDeciduous",
        "color": "#575756"
    },
    {
        "title": "Desinfección",
        "description": "Tratamientos certificados preventivos y curativos con biocidas homologados para garantizar la máxima seguridad sanitaria.",
        "icon": "Sparkles",
        "color": "#005075"
    },
    {
        "title": "HORECA y Comunidades",
        "description": "Servicio serio y discreto con emisión de Certificados Sanitarios oficiales en 24h para negocios y administradores de fincas.",
        "icon": "Hotel",
        "color": "#919191"
    }
]

Service.objects.all().delete()
for s in services:
    Service.objects.get_or_create(**s)

print("Services populated!")
