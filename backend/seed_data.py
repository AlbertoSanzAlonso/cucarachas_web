import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Species, Service

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
        },
        {
            "name": "Monitoreig Tècnic",
            "slug": "monitor",
            "description": "Seguiment preventiu mitjançant estacions de monitorització.",
            "details": [
                "Instal·lació de trampes amb feromones d'atracció específica.",
                "Revisió periòdica per detectar activitat abans que es converteixi en plaga.",
                "Informes digitals detallats amb el nivell de risc capturat."
            ]
        },
        {
            "name": "Eliminació Directa",
            "slug": "zap",
            "description": "Localitzación precisa i eliminació immediata de nius i focus.",
            "details": [
                "Identificació dels llocs de nidificació mitjançant càmeres tècniques.",
                "Aplicació localitzada de productes d'alta eficàcia i baix impacte.",
                "Eliminació física dels residus i restes biològiques."
            ]
        },
        {
            "name": "Barreres Actives",
            "slug": "barrier",
            "description": "Tractaments residuals per evitar l'entrada de nous insectes.",
            "details": [
                "Aplicació en punts crítics: baixants, esquerdes i zones de pas.",
                "Ús de polímers d'alta persistència que aguanten la neteja diària.",
                "Protecció perimetral de llarga durada (fins a 6 mesos)."
            ]
        },
        {
            "name": "Control Integrat",
            "slug": "thermal",
            "description": "Eliminació ecològica mitjançant calor controlada.",
            "details": [
                "Tractament 100% lliure de químicos, ideal per a indústries alimentàries.",
                "Eficàcia contra totes las fases del cicle de vida (ous inclosos).",
                "Poca preparació necessària i sense terminis de seguretat."
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
    
    # Generic services
    services_data = [
        {"title": "Particulars", "icon": "Home"},
        {"title": "Empreses", "icon": "Building"},
        {"title": "Comunitats", "icon": "Users"},
        {"title": "Urgències 24h", "icon": "Zap"}
    ]

    for item in services_data:
        Service.objects.get_or_create(
            title=item['title'],
            defaults={'icon': item['icon']}
        )

    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
