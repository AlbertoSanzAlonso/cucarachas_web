import os
import django
from google import genai
from django.conf import settings
from django.db.models import Q
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

def _format_rows(results) -> str:
    formatted_results = []
    for res in results:
        formatted_results.append(f"--- {res.title} ---\n{res.content}")
    return "\n\n".join(formatted_results)

def _apply_category_filter(qs, category: str | list[str] | tuple[str, ...] | None):
    if not category:
        return qs
    if isinstance(category, (list, tuple, set)):
        cats = [c for c in category if c]
        if cats:
            return qs.filter(category__in=cats)
        return qs
    return qs.filter(category=category)

def retrieve_relevant_knowledge(
    query: str,
    limit=3,
    category: str | list[str] | tuple[str, ...] | None = None,
):
    """
    Busca los fragmentos más cercanos en la DB usando distancia de coseno.
    Nunca lanza excepción: un fallo en RAG no debe tumbar el chat de diagnóstico.
    Si category está definida (str o lista), filtra. Fallback por texto si no hay embeddings.
    """
    try:
        qs = TechnicalKnowledge.objects.all()
        qs = _apply_category_filter(qs, category)

        if os.environ.get('GOOGLE_API_KEY'):
            try:
                query_embedding = get_embedding(query)
                results = list(
                    qs.annotate(
                        distance=CosineDistance('embedding', query_embedding)
                    ).order_by('distance')[:limit]
                )
                if results:
                    return _format_rows(results)
            except Exception as emb_err:
                print(f"WARNING: embedding search failed, text fallback: {emb_err}")

        # Fallback textual (sin API o embedding fallido)
        tokens = [t for t in (query or "").lower().split() if len(t) > 3][:6]
        text_qs = qs
        if tokens:
            q_filter = Q()
            for tok in tokens:
                q_filter |= Q(title__icontains=tok) | Q(content__icontains=tok)
            text_qs = qs.filter(q_filter)
        results = list(text_qs.order_by('-updated_at')[:limit])
        if not results and category:
            results = list(qs.order_by('-updated_at')[:limit])
        if not results:
            return "No s'han trobat protocols específics per a aquesta consulta."
        return _format_rows(results)
    except Exception as e:
        print(f"WARNING: retrieve_relevant_knowledge failed: {e}")
        return "No s'ha pogut consultar la base de coneixement tècnic en aquest moment."
