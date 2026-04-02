import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Service

services = [
    {
        "title": "Control de Cucarachas",
        "description": "Eliminación completa de plagas de cucarachas en hogares y negocios utilizando métodos seguros y eficaces.",
        "icon": "Bug",
        "color": "#0080bb"
    },
    {
        "title": "Desratización",
        "description": "Control preventivo y correctivo de roedores para evitar daños materiales y riesgos sanitarios.",
        "icon": "Rat",
        "color": "#3c3c3b"
    },
    {
        "title": "Desinsectación",
        "description": "Tratamientos contra todo tipo de insectos rastreros y voladores.",
        "icon": "Ant",
        "color": "#2a6b8c"
    },
    {
        "title": "Control de Aves",
        "description": "Sistemas de protección para evitar el anidamiento y posamiento de aves en edificios.",
        "icon": "Bird",
        "color": "#575756"
    },
    {
        "title": "Tratamientos de Madera",
        "description": "Protección contra termitas y carcoma para preservar estructuras y muebles.",
        "icon": "TreeDeciduous",
        "color": "#005075"
    },
    {
        "title": "Desinfección",
        "description": "Eliminación de bacterias, virus y hongos en espacios públicos y privados.",
        "icon": "Sparkles",
        "color": "#919191"
    }
]

Service.objects.all().delete()
for s in services:
    Service.objects.get_or_create(**s)

print("Services populated!")
