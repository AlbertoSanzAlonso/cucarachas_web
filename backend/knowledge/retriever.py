import os
import django
import numpy as np
from google import genai
from django.conf import settings
from pgvector.django import CosineDistance

# Configuración de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
if not settings.configured:
    django.setup()

from knowledge.models import TechnicalKnowledge

def get_embedding(text: str):
    """Genera embedding para la búsqueda."""
    client = genai.Client(api_key=os.environ.get('GOOGLE_API_KEY'))
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )
    return result.embeddings[0].values

def retrieve_relevant_knowledge(query: str, limit=3):
    """
    Busca los fragmentos más cercanos en la DB usando distancia de coseno.
    Nunca lanza excepción: un fallo en RAG no debe tumbar el chat de diagnóstico.
    """
    try:
        if not os.environ.get('GOOGLE_API_KEY'):
            return "Base de coneixement tècnic no disponible temporalment."

        query_embedding = get_embedding(query)

        results = TechnicalKnowledge.objects.annotate(
            distance=CosineDistance('embedding', query_embedding)
        ).order_by('distance')[:limit]

        if not results:
            return "No s'han trobat protocols específics per a aquesta consulta."

        formatted_results = []
        for res in results:
            formatted_results.append(f"--- {res.title} ---\n{res.content}")

        return "\n\n".join(formatted_results)
    except Exception as e:
        print(f"WARNING: retrieve_relevant_knowledge failed: {e}")
        return "No s'ha pogut consultar la base de coneixement tècnic en aquest moment."
