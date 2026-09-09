# Generated manually — seed inicial del blog (mock → DB)

from datetime import date

from django.db import migrations


ARTICLES = [
    {
        "title": "Cómo identificar nidos de cucarachas en la cocina",
        "slug": "identificar-nidos-cucarachas-cocina",
        "excerpt": (
            "Las cucarachas son expertas en ocultarse. Aprende a detectar los "
            "puntos críticos antes de que se conviertan en una plaga incontrolable."
        ),
        "body": (
            "Las cucarachas alemanas y orientales aprovechan microgrietas, "
            "zócalos y la zona tras electrodomésticos para criar sin ser vistas.\n\n"
            "Revisa juntas de encimera, bajo el fregadero, detrás del frigorífico "
            "y el motor del lavavajillas. Manchas oscuras, ootecas y un olor "
            "característico son señales tempranas.\n\n"
            "Si detectas actividad nocturna o varias zonas a la vez, conviene "
            "una inspección técnica antes de que la colonia se estabilice. "
            "En CECSA priorizamos geles de última generación y protocolos "
            "compatibles con el uso diario del hogar."
        ),
        "category": "prevencion",
        "author": "Equipo Técnico CECSA",
        "image": "/assets/cockroach-focus.webp",
        "read_time_minutes": 5,
        "published_at": date(2026, 4, 15),
    },
    {
        "title": "Control de plagas en la industria alimentaria: IFS y BRC",
        "slug": "control-plagas-industria-alimentaria-ifs-brc",
        "excerpt": (
            "Descubre los estándares más estrictos de seguridad alimentaria y "
            "cómo CECSA ayuda a las empresas a cumplirlos con éxito."
        ),
        "body": (
            "Los esquemas IFS y BRC exigen un plan documental de control de "
            "plagas, monitorización trazable y acciones correctivas registradas.\n\n"
            "Para cocinas industriales y almacenes en Catalunya, el foco está "
            "en barreras físicas, trampas de seguimiento y tratamientos "
            "localizados que no interrumpan la producción.\n\n"
            "CECSA trabaja con informes auditables, visitas programadas y "
            "comunicación clara con el responsable de calidad de cada planta."
        ),
        "category": "tecnico",
        "author": "Dirección Técnica",
        "image": "/assets/barcelona-authority.webp",
        "read_time_minutes": 8,
        "published_at": date(2026, 4, 12),
    },
    {
        "title": "Higiene vs. Plagas: El mito de las cocinas limpias",
        "slug": "higiene-vs-plagas-mito-cocinas-limpias",
        "excerpt": (
            "¿Es cierto que las cucarachas solo aparecen en lugares sucios? "
            "Desmontamos uno de los mitos más comunes de la desinsectación."
        ),
        "body": (
            "Una cocina limpia reduce el alimento disponible, pero no elimina "
            "el riesgo: las cucarachas pueden llegar por tuberías, patios "
            "comunitarios o edificios vecinos.\n\n"
            "El mito genera culpa y retraso en la actuación. Lo importante es "
            "detectar focos estructurales y actuar con un protocolo profesional.\n\n"
            "La prevención real combina hábitos, sellado de puntos de entrada "
            "y, cuando hace falta, un tratamiento técnico ético y consciente."
        ),
        "category": "curiosidades",
        "author": "Biología Aplicada",
        "image": "/assets/inspeccion-plagas-cocina-profesional.webp",
        "read_time_minutes": 4,
        "published_at": date(2026, 4, 8),
    },
    {
        "title": "Nueva flota eléctrica: Compromiso Ético y Ecológico",
        "slug": "flota-electrica-compromiso-etico-ecologico",
        "excerpt": (
            "En CECSA seguimos evolucionando. Te presentamos nuestra nueva "
            "flota de vehículos 100% eléctricos para una Barcelona más limpia."
        ),
        "body": (
            "Nuestro eslogan Ético y Consciente también se aplica a cómo "
            "nos desplazamos por Barcelona y el resto de Catalunya.\n\n"
            "La flota eléctrica reduce emisiones en visitas técnicas y "
            "refuerza un servicio discreto, ágil y alineado con la ciudad.\n\n"
            "Seguimos invirtiendo en herramientas y logística que mejoran "
            "la experiencia del cliente sin renunciar al rigor sanitario."
        ),
        "category": "salud",
        "author": "Sostenibilidad",
        "image": "/assets/flota-tecnica-especializada-cecsa.webp",
        "read_time_minutes": 3,
        "published_at": date(2026, 4, 5),
    },
    {
        "title": "Tratamientos de barrera: Prevención a largo plazo",
        "slug": "tratamientos-barrera-prevencion-largo-plazo",
        "excerpt": (
            "Por qué los tratamientos anuales de mantenimiento son la mejor "
            "inversión para tu comunidad de vecinos."
        ),
        "body": (
            "Las comunidades de vecinos concentran zonas comunes, cuartos "
            "de contadores y patios que actúan como corredores de plagas.\n\n"
            "Un plan de barrera anual reduce reinfestaciones y reparte el "
            "coste entre vecinos frente a emergencias repetidas.\n\n"
            "En CECSA diseñamos calendarios de mantenimiento con seguimiento "
            "y comunicación clara a la administración de fincas."
        ),
        "category": "prevencion",
        "author": "Área Operativa",
        "image": "/assets/urban-pests.webp",
        "read_time_minutes": 6,
        "published_at": date(2026, 4, 2),
    },
    {
        "title": "Protocolo Origen: Recuperación de viviendas",
        "slug": "protocolo-origen-recuperacion-viviendas",
        "excerpt": (
            "Un vistazo profundo a cómo transformamos viviendas afectadas por "
            "infestaciones críticas en espacios seguros."
        ),
        "body": (
            "El Protocolo Origen aborda infestaciones severas con diagnóstico "
            "de focos, tratamiento intensivo y verificación posterior.\n\n"
            "No se trata solo de eliminar insectos visibles: recuperamos el "
            "uso seguro del hogar con criterios sanitarios y respeto por "
            "quien habita el espacio.\n\n"
            "Si tu vivienda o la de un familiar necesita una intervención "
            "integral, el equipo de CECSA puede valorar el caso y proponer "
            "un plan paso a paso."
        ),
        "category": "tecnico",
        "author": "Equipo Social",
        "image": "/assets/barcelona-authority.webp",
        "read_time_minutes": 10,
        "published_at": date(2026, 3, 28),
    },
]


def seed_articles(apps, schema_editor):
    BlogArticle = apps.get_model("api", "BlogArticle")
    for item in ARTICLES:
        BlogArticle.objects.update_or_create(
            slug=item["slug"],
            defaults={
                **item,
                "is_published": True,
                "meta_description": item["excerpt"][:320],
            },
        )


def unseed_articles(apps, schema_editor):
    BlogArticle = apps.get_model("api", "BlogArticle")
    BlogArticle.objects.filter(slug__in=[a["slug"] for a in ARTICLES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0013_blog_article"),
    ]

    operations = [
        migrations.RunPython(seed_articles, unseed_articles),
    ]
