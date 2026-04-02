from api.models import Service

services = [
    {
        "title": "Control de Cucarachas",
        "description": "Eliminación completa de plagas de cucarachas en hogares y negocios utilizando métodos seguros y eficaces.",
        "icon": "Bug",
        "color": "#8EBC00"
    },
    {
        "title": "Desratización",
        "description": "Control preventivo y correctivo de roedores para evitar daños materiales y riesgos sanitarios.",
        "icon": "Rat",
        "color": "#FF9D00"
    },
    {
        "title": "Desinsectación",
        "description": "Tratamientos contra todo tipo de insectos rastreros y voladores.",
        "icon": "Ant",
        "color": "#D1E231"
    },
    {
        "title": "Control de Aves",
        "description": "Sistemas de protección para evitar el anidamiento y posamiento de aves en edificios.",
        "icon": "Bird",
        "color": "#0099FF"
    },
    {
        "title": "Tratamientos de Madera",
        "description": "Protección contra termitas y carcoma para preservar estructuras y muebles.",
        "icon": "TreeDeciduous",
        "color": "#8B4513"
    },
    {
        "title": "Desinfección",
        "description": "Eliminación de bacterias, virus y hongos en espacios públicos y privados.",
        "icon": "Sparkles",
        "color": "#00C2FF"
    }
]

for s in services:
    Service.objects.get_or_create(**s)

print("Services populated!")
