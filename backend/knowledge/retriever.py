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

# Audiencias visibles para el Bio-Assistent público (nunca ops-only).
_PUBLIC_AUDIENCES = (
    TechnicalKnowledge.Audience.PUBLIC,
    TechnicalKnowledge.Audience.BOTH,
)
# Audiencias visibles para el asistente de oficina.
_OPS_AUDIENCES = (
    TechnicalKnowledge.Audience.OPS,
    TechnicalKnowledge.Audience.BOTH,
)


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


def _apply_audience_filter(qs, audience: str | list[str] | tuple[str, ...] | None):
    """Filtra por audience. Por defecto: solo público (+ both)."""
    if audience is None:
        return qs.filter(audience__in=_PUBLIC_AUDIENCES)
    if isinstance(audience, (list, tuple, set)):
        auds = [a for a in audience if a]
        if auds:
            return qs.filter(audience__in=auds)
        return qs.filter(audience__in=_PUBLIC_AUDIENCES)
    aud = (audience or "").strip().lower()
    if aud == "ops":
        return qs.filter(audience__in=_OPS_AUDIENCES)
    if aud == "public":
        return qs.filter(audience__in=_PUBLIC_AUDIENCES)
    if aud == "both":
        return qs.filter(audience=TechnicalKnowledge.Audience.BOTH)
    if aud in (
        TechnicalKnowledge.Audience.PUBLIC,
        TechnicalKnowledge.Audience.OPS,
        TechnicalKnowledge.Audience.BOTH,
    ):
        return qs.filter(audience=aud)
    return qs.filter(audience__in=_PUBLIC_AUDIENCES)

def retrieve_relevant_knowledge(
    query: str,
    limit=3,
    category: str | list[str] | tuple[str, ...] | None = None,
    audience: str | list[str] | tuple[str, ...] | None = None,
):
    """
    Busca los fragmentos más cercanos en la DB usando distancia de coseno.
    Nunca lanza excepción: un fallo en RAG no debe tumbar el chat de diagnóstico.
    Si category está definida (str o lista), filtra. Fallback por texto si no hay embeddings.
    audience=None → solo público (+ both). Para oficina usar audience="ops".
    """
    try:
        qs = TechnicalKnowledge.objects.all()
        qs = _apply_audience_filter(qs, audience)
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
        tokens = [
            t.strip(".,;:!?¿¡()[]\"'")
            for t in (query or "").lower().split()
            if len(t.strip(".,;:!?¿¡()[]\"'")) > 3
        ][:8]
        text_qs = qs
        if tokens:
            q_filter = Q()
            stems = []
            for tok in tokens:
                q_filter |= Q(title__icontains=tok) | Q(content__icontains=tok)
                if len(tok) >= 6:
                    stem = tok[:6]
                    stems.append(stem)
                    q_filter |= Q(title__icontains=stem) | Q(content__icontains=stem)
            text_qs = qs.filter(q_filter)
            candidates = list(text_qs.order_by("-updated_at")[:24])

            def _score(row) -> int:
                title = (row.title or "").lower()
                content = (row.content or "").lower()
                score = 0
                for tok in tokens:
                    if tok in title:
                        score += 6
                    elif tok in content:
                        score += 2
                for stem in stems:
                    if stem in title:
                        score += 5
                    elif stem in content:
                        score += 1
                # Preferir blog frente a FAQ genérica cuando empatan
                if getattr(row, "category", "") == "blog":
                    score += 1
                return score

            candidates.sort(key=lambda r: (_score(r), r.updated_at), reverse=True)
            results = candidates[:limit]
        else:
            results = list(text_qs.order_by("-updated_at")[:limit])
        if not results and category:
            results = list(qs.order_by("-updated_at")[:limit])
        if not results:
            return "No s'han trobat protocols específics per a aquesta consulta."
        return _format_rows(results)
    except Exception as e:
        print(f"WARNING: retrieve_relevant_knowledge failed: {e}")
        return "No s'ha pogut consultar la base de coneixement tècnic en aquest moment."


def retrieve_ops_knowledge(
    query: str,
    limit: int = 5,
    category: str | list[str] | tuple[str, ...] | None = None,
) -> str:
    """RAG del asistente de oficina (iGEO / SOPs). Nunca expone solo audience=public."""
    empty_ops = "No s'ha trobat procediment intern per a aquesta consulta."
    try:
        result = retrieve_relevant_knowledge(
            query,
            limit=limit,
            category=category,
            audience="ops",
        )
        if not (result or "").strip():
            return empty_ops
        if "No s'han trobat" in result or "No s'ha pogut" in result:
            return empty_ops
        return result
    except Exception as e:
        print(f"WARNING: retrieve_ops_knowledge failed: {e}")
        return "No s'ha pogut consultar el coneixement operatiu en aquest moment."
