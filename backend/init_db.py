import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Service

services = [
    {
        "title": "Cucaracha Alemana",
        "description": "Blattella germanica. Control agresivo en hostelería y hogares mediante geles tecnológicos de última generación.",
        "icon": "Bug",
        "color": "#0080bb"
    },
    {
        "title": "Cucaracha Americana",
        "description": "Periplaneta americana. Erradicación en redes de saneamiento y sellado de puntos críticos en grandes infraestructuras.",
        "icon": "ShieldCheck",
        "color": "#3c3c3b"
    },
    {
        "title": "Cucaracha Oriental",
        "description": "Blatta orientalis. Gestión de humedad y tratamientos de choque en plantas bajas y zonas de riesgo elevado.",
        "icon": "Droplets",
        "color": "#005075"
    }
]

Service.objects.all().delete()
for s in services:
    Service.objects.get_or_create(**s)

print("Cockroach species data populated in the Services table!")

