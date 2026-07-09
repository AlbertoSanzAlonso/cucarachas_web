import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Species, Tratamiento, FichaServicio

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

    fichas_data = [
        {
            "codigo": "CUC-GER-PISO",
            "nombre_comercial": "Control de cucaracha alemana en piso",
            "pest_type": "german_cockroach",
            "tipos_cliente": ["particular"],
            "lugares": ["cocina", "bano", "dormitorio", "salon", "garaje"],
            "preguntas_obligatorias": {
                "particular": ["codigo_postal", "metros_cuadrados", "where"],
            },
            "reglas_diagnostico": [
                {"keywords": ["noche", "nit", "nits"], "severity": "low"},
                {"keywords": ["día", "dia", "durante el día"], "severity": "high"},
                {"keywords": ["ooteca", "cápsula", "capsula", "huevos"], "severity": "critical"},
            ],
            "prioridad_default": "media",
            "sistema_recomendado": {
                "recomendar": ["gel", "trampas", "monitorización", "seguimiento"],
                "no_recomendar": ["pulverizar"],
            },
            "tiempo_medio": {"visita_1": 45, "visita_2": 30},
            "material_medio": ["3 trampas", "25g gel", "2 pares guantes"],
            "riesgo": "medio",
            "dificultad": 3,
            "coste_interno": {"tiempo_tecnico": 52, "material": 18, "desplazamiento": 12},
            "reglas_comerciales": [
                {"condition": {"field": "metros_cuadrados", "op": "lt", "value": 80}, "precio_venta": 220},
                {"condition": {"field": "metros_cuadrados", "op": "gt", "value": 120}, "precio_venta": 250},
                {"condition": {"field": "metros_cuadrados", "op": "gt", "value": 200}, "action": "visita_tecnica"},
            ],
            "bloqueos_presupuesto": [
                {
                    "condition": {"field": "where_comunidad", "op": "eq", "value": "todo_edificio"},
                    "message_key": "comunidad_completa",
                },
                {"condition": {"field": "metros_cuadrados", "op": "gt", "value": 500}, "message_key": "metros_excesivos"},
            ],
            "copy_comercial": {
                "ca": (
                    "Segons la informació facilitada, recomanem un tractament professional compost per "
                    "dues actuacions, amb gel insecticida d'alta eficàcia i trampes de monitorització. "
                    "Aquest sistema manté el producte actiu durant més temps i està cobert per la garantia CECSA."
                ),
                "es": (
                    "Según la información facilitada, recomendamos un tratamiento profesional compuesto por "
                    "dos actuaciones, con gel insecticida de alta eficacia y trampas de monitorización. "
                    "Este sistema mantiene el producto activo durante más tiempo y está cubierto por la garantía CECSA."
                ),
            },
            "objeciones": [
                {
                    "trigger": "solo una visita",
                    "respuesta_ca": (
                        "Podem fer una única actuació, tot i que la recomanació professional són dos tractaments, "
                        "ja que és l'única forma d'oferir una garantia completa i reduir el risc de reaparició."
                    ),
                    "respuesta_es": (
                        "Podemos realizar una única actuación, aunque nuestra recomendación profesional son dos tratamientos, "
                        "ya que es la única forma de ofrecer una garantía completa y reducir significativamente el riesgo de reaparición."
                    ),
                },
            ],
            "venta_cruzada": [
                {"detecta": "jardin", "pregunta_ca": "Has observat mosquits?", "pregunta_es": "¿Ha observado mosquitos?"},
            ],
            "seguimiento": {"24h": "whatsapp", "7d": "email", "30d": "email"},
            "garantia_meses": 12,
        },
    ]

    for item in fichas_data:
        FichaServicio.objects.update_or_create(
            codigo=item["codigo"],
            defaults=item,
        )

    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
