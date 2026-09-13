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
                {"condition": {"field": "metros_cuadrados", "op": "lt", "value": 80}, "precio_venta": 240},
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
                        "ja que és la forma d'oferir garantia de solució segons condicions i reduir el risc de reaparició."
                    ),
                    "respuesta_es": (
                        "Podemos realizar una única actuación, aunque nuestra recomendación profesional son dos tratamientos, "
                        "ya que es la forma de ofrecer garantía de solución según condiciones y reducir el riesgo de reaparición."
                    ),
                },
                {
                    "trigger": "caro",
                    "respuesta_ca": (
                        "Entenem que el pressupost pot ser una dificultat. Preferim una visita tècnica per ajustar "
                        "espècie, focus i abast abans d'oferir un tractament més barat que no resolgui el problema."
                    ),
                    "respuesta_es": (
                        "Entendemos que el presupuesto puede ser una dificultad. Preferimos una visita técnica para ajustar "
                        "especie, focos y alcance antes de ofrecer un tratamiento más barato que no resuelva el problema."
                    ),
                },
                {
                    "trigger": "más barato",
                    "respuesta_ca": (
                        "Si el preu és el principal problema, podem fer una visita tècnica i proposar la solució "
                        "més ajustada que puguem garantir tècnicament, sense prometre una rebaixa a cegues."
                    ),
                    "respuesta_es": (
                        "Si el precio es el principal problema, podemos hacer una visita técnica y proponer la solución "
                        "más ajustada que podamos garantizar técnicamente, sin prometer una rebaja a ciegas."
                    ),
                },
                {
                    "trigger": "barato",
                    "respuesta_ca": (
                        "Si el preu és el principal problema, podem fer una visita tècnica i proposar la solució "
                        "més ajustada que puguem garantir tècnicament."
                    ),
                    "respuesta_es": (
                        "Si el precio es el principal problema, podemos hacer una visita técnica y proponer la solución "
                        "más ajustada que podamos garantizar técnicamente."
                    ),
                },
            ],
            "venta_cruzada": [
                {"detecta": "jardin", "pregunta_ca": "Has observat mosquits?", "pregunta_es": "¿Ha observado mosquitos?"},
            ],
            "seguimiento": {"24h": "whatsapp", "7d": "email", "30d": "email"},
            "garantia_meses": 12,
        },
        {
            "codigo": "CUC-GER-NEG",
            "nombre_comercial": "Control de cucaracha alemana en negocio",
            "pest_type": "german_cockroach",
            "tipos_cliente": ["negoci"],
            "lugares": ["cocina", "almacen", "banos", "clientes", "exterior"],
            "preguntas_obligatorias": {
                "negoci": ["business_type", "metros_cuadrados", "where"],
            },
            "reglas_diagnostico": [
                {"keywords": ["noche", "nit"], "severity": "low"},
                {"keywords": ["día", "dia", "clientes"], "severity": "high"},
            ],
            "prioridad_default": "alta",
            "sistema_recomendado": {
                "recomendar": ["gel", "trampas", "monitorización", "seguimiento", "programa eliminación"],
                "no_recomendar": ["pulverizar en cocina abierta", "solo certificado preventivo DDD"],
            },
            "tiempo_medio": {"visita_1": 60, "visita_2": 45},
            "material_medio": ["6 trampas", "40g gel", "monitorización HACCP"],
            "riesgo": "alto",
            "dificultad": 4,
            "coste_interno": {"tiempo_tecnico": 85, "material": 35, "desplazamiento": 15},
            "reglas_comerciales": [
                {"condition": {"field": "metros_cuadrados", "op": "lt", "value": 150}, "precio_venta": 380},
                {"condition": {"field": "metros_cuadrados", "op": "gt", "value": 150}, "precio_venta": 520},
                {"condition": {"field": "business_type", "op": "eq", "value": "hotel"}, "precio_venta": 450},
            ],
            "bloqueos_presupuesto": [
                {"condition": {"field": "metros_cuadrados", "op": "gt", "value": 800}, "message_key": "metros_excesivos"},
            ],
            "copy_comercial": {
                "ca": (
                    "Amb infestació activa (p. ex. panerola germànica) cal un programa d'eliminació amb "
                    "actuacions i seguiment, no un certificat preventiu DDD. El preu es confirma amb diagnòstic "
                    "i històric; si falta abast, fem visita tècnica."
                ),
                "es": (
                    "Con infestación activa (p. ej. cucaracha germánica) hace falta un programa de eliminación con "
                    "actuaciones y seguimiento, no un certificado preventivo DDD. El precio se confirma con diagnóstico "
                    "e histórico; si falta alcance, hacemos visita técnica."
                ),
            },
            "objeciones": [
                {
                    "trigger": "certificado",
                    "respuesta_ca": (
                        "Si ja hi ha paneroles actives, el certificat preventiu DDD no resol el problema. "
                        "Cal un programa d'eliminació; et demanem dades o visita tècnica per valorar-lo."
                    ),
                    "respuesta_es": (
                        "Si ya hay cucarachas activas, el certificado preventivo DDD no resuelve el problema. "
                        "Hace falta un programa de eliminación; te pedimos datos o visita técnica para valorarlo."
                    ),
                },
                {
                    "trigger": "caro",
                    "respuesta_ca": (
                        "Entenem la preocupació pel preu. Preferim visita tècnica per ajustar el programa "
                        "d'eliminació abans d'oferir un servei preventiu més barat que no elimini la plaga."
                    ),
                    "respuesta_es": (
                        "Entendemos la preocupación por el precio. Preferimos visita técnica para ajustar el programa "
                        "de eliminación antes de ofrecer un servicio preventivo más barato que no elimine la plaga."
                    ),
                },
            ],
            "venta_cruzada": [],
            "seguimiento": {"24h": "whatsapp", "7d": "email", "30d": "email"},
            "garantia_meses": 12,
        },
        {
            "codigo": "CUC-DDD-PREV",
            "nombre_comercial": "Prevención y certificado DDD (sin infestación activa)",
            "pest_type": "",
            "tipos_cliente": ["negoci"],
            "lugares": ["cocina", "almacen", "banos", "clientes"],
            "preguntas_obligatorias": {
                "negoci": ["business_type", "metros_cuadrados", "certificate"],
            },
            "reglas_diagnostico": [],
            "prioridad_default": "media",
            "sistema_recomendado": {
                "recomendar": ["monitorización", "certificado DDD", "prevención"],
                "no_recomendar": ["programa eliminación germánica sin plaga activa"],
            },
            "tiempo_medio": {"visita_1": 45},
            "material_medio": ["trampas monitorización", "informe DDD"],
            "riesgo": "bajo",
            "dificultad": 2,
            "coste_interno": {},
            "reglas_comerciales": [
                {"action": "visita_tecnica"},
            ],
            "bloqueos_presupuesto": [],
            "copy_comercial": {
                "ca": (
                    "Servei preventiu amb certificat DDD per a establiments sense infestació activa. "
                    "Si detectem panerola germànica activa, cal passar al programa d'eliminació."
                ),
                "es": (
                    "Servicio preventivo con certificado DDD para establecimientos sin infestación activa. "
                    "Si detectamos cucaracha germánica activa, hay que pasar al programa de eliminación."
                ),
            },
            "objeciones": [
                {
                    "trigger": "cucarach",
                    "respuesta_ca": (
                        "Si ja veus paneroles, aquest servei preventiu no és l'adequat: cal un programa d'eliminació. "
                        "Explica'ns on apareixen i des de quan, o demana visita tècnica."
                    ),
                    "respuesta_es": (
                        "Si ya ves cucarachas, este servicio preventivo no es el adecuado: hace falta un programa de eliminación. "
                        "Cuéntanos dónde aparecen y desde cuándo, o pide visita técnica."
                    ),
                },
            ],
            "venta_cruzada": [],
            "seguimiento": {"30d": "email"},
            "garantia_meses": 6,
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
