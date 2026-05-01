import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Species, Tratamiento

def seed():
    # Cockroach species from translation.json
    species_data = [
        {
            "name": "Panerola alemanya",
            "slug": "germanica",
            "description": "La més comuna en cuines i habitatges de Barcelona.",
            "details": [
                "Detectades habitualment en motors d'electrodomèstics.",
                "Garantia d'eliminació mitjançant gel de cebo tècnic.",
                "No requereix desallotjar l'habitatge."
            ]
        },
        {
            "name": "Panerola americana",
            "slug": "americana",
            "description": "Gran, rogenca i experta en xarxes de clavegueram.",
            "details": [
                "Especialistes en comunitats de veïns i locals.",
                "Tractament de barrera perimetral d'alta persistència.",
                "Control focalitzat en punts d'entrada de sanejament."
            ]
        },
        {
            "name": "Panerola oriental",
            "slug": "orientalis",
            "description": "Negra i robusta, prefereix zones fresques i humides.",
            "details": [
                "Comuna en canalitzacions d'aigua i baixants antigues.",
                "Tractament mitjançant pulverització dirigida i encebat.",
                "Prevenció d'accessos des del subsòl."
            ]
        },
        {
            "name": "Panerola banda cafè",
            "slug": "banded",
            "description": "Petita, prefereix mobles i sostres elevats. No sol trobar-se a les cuines.",
            "details": [
                "Detectades sovint en marcs de quadres i motors de rellotge.",
                "Prefereixen llocs càlids i secs, a diferència de l'alemanya.",
                "Control expert per evitar la dispersió pel mobiliari."
            ]
        }
    ]

    for item in species_data:
        Species.objects.get_or_create(
            slug=item['slug'],
            defaults={
                'name': item['name'],
                'description': item['description'],
                'details': item['details']
            }
        )
    
    # Treatments (previously called services in old model)
    treatments_data = [
        {
            "nombre": "Monitoreig Tècnic",
            "descripcion": "Seguiment preventiu mitjançant estacions de monitorització.",
            "precio_base": 45.00,
            "icon": "Activity"
        },
        {
            "nombre": "Eliminació Directa",
            "descripcion": "Localitzación precisa i eliminació immediata de nius i focus.",
            "precio_base": 120.00,
            "icon": "Zap"
        },
        {
            "nombre": "Barreres Actives",
            "descripcion": "Tractaments residuals per evitar l'entrada de nous insectes.",
            "precio_base": 85.00,
            "icon": "Shield"
        },
        {
            "nombre": "Control Integrat",
            "descripcion": "Eliminació ecològica mitjançant calor controlada.",
            "precio_base": 150.00,
            "icon": "Thermometer"
        }
    ]

    for item in treatments_data:
        Tratamiento.objects.get_or_create(
            nombre=item['nombre'],
            defaults={
                'descripcion': item['descripcion'],
                'precio_base': item['precio_base'],
                'icon': item['icon']
            }
        )

    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
