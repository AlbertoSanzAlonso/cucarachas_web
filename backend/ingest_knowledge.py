import os
import django
from google import genai
from django.conf import settings

# Configuración de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from knowledge.models import TechnicalKnowledge

def generate_embedding(text: str):
    """Genera un embedding de 768 dimensiones usando Gemini."""
    client = genai.Client(api_key=os.environ.get('GOOGLE_API_KEY'))
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )
    return result.embeddings[0].values

def ingest_text(title, content, source="Manual CECSA", category="tecnico"):
    """Crea una entrada en la base de conocimiento con su embedding."""
    print(f"Ingestant: {title}...")
    embedding = generate_embedding(content)
    
    obj = TechnicalKnowledge.objects.create(
        title=title,
        content=content,
        source=source,
        category=category,
        embedding=embedding
    )
    print(f"✅ Guardat amb ID: {obj.id}")

if __name__ == "__main__":
    # Datos de ejemplo: Protocolo de Panerola Alemanya
    sample_data = [
        {
            "title": "Protocol d'Actuació: Panerola Alemanya (Blattella germanica)",
            "content": (
                "La panerola alemanya prefereix llocs càlids i humits (cuines, motors de nevera, cafeteres). "
                "Tractament recomanat: Aplicació de gel insecticida d'alta palatabilitat en esquerdes i zones de niu. "
                "No utilitzar aerosols en zones on s'hagi posat gel, ja que poden contaminar l'esquer i fer que la plaga l'eviti. "
                "La inspecció s'ha de centrar en punts crítics de calor."
            ),
            "category": "cucarachas"
        },
        {
            "title": "Prevenció Ètica i Conscient",
            "content": (
                "Seguint la filosofia de CECSA, abans d'aplicar productes químics, cal assegurar la 'exclusió': "
                "segellar esquerdes, eliminar punts d'aigua i mantenir la neteja de greixos. "
                "Això redueix la dependència de biocides i millora l'eficàcia a llarg termini."
            ),
            "category": "filosofia"
        }
    ]

    for item in sample_data:
        ingest_text(item['title'], item['content'], category=item['category'])
