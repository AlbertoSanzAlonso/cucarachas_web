"""Sincronización de contenido dinámico público → TechnicalKnowledge (pgvector).

Sin PII: no indexa Cliente, Presupuesto CRM crudo, direcciones ni costes internos.
"""

from __future__ import annotations

import json
import os
from typing import Any, Iterable

from knowledge.models import TechnicalKnowledge

ZERO_EMBEDDING = [0.0] * 3072
EMBEDDING_TIMEOUT_SEC = 20

SOURCE_KINDS = (
    "blog",
    "faq",
    "company",
    "species",
    "tratamiento",
    "ficha",
    "presupuesto_ref",
)

# Si True, upsert usa vector cero (más rápido; el fallback textual del retriever sigue funcionando).
_SKIP_EMBEDDINGS = False


def set_skip_embeddings(skip: bool) -> None:
    global _SKIP_EMBEDDINGS
    _SKIP_EMBEDDINGS = bool(skip)


def _safe_embedding(text: str) -> list[float]:
    """Genera embedding; si falla/timeout/skip, vector cero (sigue sirviendo el fallback textual)."""
    if _SKIP_EMBEDDINGS or not os.environ.get("GOOGLE_API_KEY"):
        return list(ZERO_EMBEDDING)
    from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout

    try:
        from knowledge.retriever import get_embedding

        with ThreadPoolExecutor(max_workers=1) as pool:
            fut = pool.submit(get_embedding, text)
            emb = fut.result(timeout=EMBEDDING_TIMEOUT_SEC)
        if emb and len(emb) == 3072:
            return list(emb)
        print(f"WARNING: embedding size {len(emb) if emb else 0} != 3072, using zero vector")
    except FuturesTimeout:
        print(f"WARNING: embedding timeout after {EMBEDDING_TIMEOUT_SEC}s")
    except Exception as exc:
        print(f"WARNING: embedding failed for sync: {exc}")
    return list(ZERO_EMBEDDING)


def upsert_knowledge(
    *,
    source_key: str,
    title: str,
    content: str,
    category: str,
    source: str = "",
    audience: str = TechnicalKnowledge.Audience.PUBLIC,
) -> TechnicalKnowledge:
    """Crea o actualiza un chunk RAG por source_key."""
    content = (content or "").strip()
    title = (title or "").strip()[:255] or source_key
    aud = (audience or TechnicalKnowledge.Audience.PUBLIC).strip().lower()
    if aud not in (
        TechnicalKnowledge.Audience.PUBLIC,
        TechnicalKnowledge.Audience.OPS,
        TechnicalKnowledge.Audience.BOTH,
    ):
        aud = TechnicalKnowledge.Audience.PUBLIC
    emb = _safe_embedding(f"{title}\n{content}"[:8000])
    obj, _ = TechnicalKnowledge.objects.update_or_create(
        source_key=source_key,
        defaults={
            "title": title,
            "content": content,
            "category": category,
            "source": source or source_key,
            "audience": aud,
            "embedding": emb,
        },
    )
    return obj


def delete_knowledge(source_key: str) -> int:
    """Elimina el chunk asociado a source_key. Devuelve filas borradas."""
    deleted, _ = TechnicalKnowledge.objects.filter(source_key=source_key).delete()
    return deleted


def _json_block(label: str, value: Any) -> str:
    if value is None or value == "" or value == [] or value == {}:
        return ""
    try:
        body = json.dumps(value, ensure_ascii=False, indent=2, default=str)
    except TypeError:
        body = str(value)
    return f"{label}:\n{body}"


# ---------------------------------------------------------------------------
# Builders (sin PII / sin costes internos)
# ---------------------------------------------------------------------------


def blog_source_key(slug: str) -> str:
    return f"blog:{slug}"


def build_blog_chunk(article) -> dict[str, str] | None:
    if not getattr(article, "is_published", False):
        return None
    parts = [
        f"Título: {article.title}",
        f"Categoría blog: {article.category}",
        f"Resumen: {article.excerpt}",
        f"Contenido:\n{article.body}",
    ]
    if article.meta_description:
        parts.insert(2, f"Meta: {article.meta_description}")
    return {
        "source_key": blog_source_key(article.slug),
        "title": f"Blog: {article.title}"[:255],
        "content": "\n\n".join(parts),
        "category": TechnicalKnowledge.Category.BLOG,
        "source": f"blog/{article.slug}",
    }


def faq_source_key(slug: str) -> str:
    return f"faq:{slug}"


def build_faq_chunk(item) -> dict[str, str] | None:
    if not getattr(item, "is_published", False):
        return None
    parts = [
        f"FAQ slug: {item.slug}",
        f"Categoría: {item.category}",
        f"Pregunta (CA): {item.question_ca}",
        f"Respuesta (CA): {item.answer_ca}",
        f"Pregunta (ES): {item.question_es}",
        f"Respuesta (ES): {item.answer_es}",
    ]
    if item.question_en or item.answer_en:
        parts.append(f"Pregunta (EN): {item.question_en}")
        parts.append(f"Respuesta (EN): {item.answer_en}")
    return {
        "source_key": faq_source_key(item.slug),
        "title": f"FAQ: {item.question_ca}"[:255],
        "content": "\n\n".join(parts),
        "category": TechnicalKnowledge.Category.FAQ,
        "source": f"faq/{item.slug}",
    }


def company_source_key() -> str:
    return "company:1"


def build_company_chunk(profile) -> dict[str, str]:
    parts = [
        f"Marca: {profile.brand_name}",
        f"Razón social: {profile.legal_name}",
        f"Teléfono: {profile.phone}",
        f"WhatsApp: {profile.whatsapp}",
        f"Email: {profile.email}",
        f"Dirección oficina: {profile.address}",
        f"Hero ES: {profile.hero_title_es}",
        f"Hero CA: {profile.hero_title_ca}",
        f"Subtítulo ES: {profile.hero_subtitle_es}",
        f"Subtítulo CA: {profile.hero_subtitle_ca}",
        f"Zona servicio ES: {profile.service_area_es}",
        f"Zona servicio CA: {profile.service_area_ca}",
        f"Horario ES: {profile.business_hours_es}",
        f"Horario CA: {profile.business_hours_ca}",
        f"Políticas ES: {profile.policies_es}",
        f"Políticas CA: {profile.policies_ca}",
    ]
    if profile.commercial_policy_es:
        parts.append(f"Política comercial ES: {profile.commercial_policy_es}")
    if profile.commercial_policy_ca:
        parts.append(f"Política comercial CA: {profile.commercial_policy_ca}")
    if profile.agent_notes_es:
        parts.append(f"Notas agente ES: {profile.agent_notes_es}")
    if profile.agent_notes_ca:
        parts.append(f"Notas agente CA: {profile.agent_notes_ca}")
    if profile.coverage_places:
        parts.append(_json_block("Cobertura (lugares)", profile.coverage_places))
    if profile.outside_places:
        parts.append(_json_block("Fuera de cobertura", profile.outside_places))
    return {
        "source_key": company_source_key(),
        "title": f"Empresa: {profile.brand_name}"[:255],
        "content": "\n\n".join(p for p in parts if p),
        "category": TechnicalKnowledge.Category.COMPANY,
        "source": "company_profile",
    }


def species_source_key(slug: str) -> str:
    return f"species:{slug}"


def build_species_chunk(species) -> dict[str, str]:
    details = species.details or []
    detail_txt = "\n".join(f"- {d}" for d in details) if details else ""
    parts = [
        f"Especie: {species.name}",
        f"Slug: {species.slug}",
        f"Descripción: {species.description}",
    ]
    if detail_txt:
        parts.append(f"Detalles:\n{detail_txt}")
    return {
        "source_key": species_source_key(species.slug),
        "title": f"Especie: {species.name}"[:255],
        "content": "\n\n".join(parts),
        "category": TechnicalKnowledge.Category.SPECIES,
        "source": f"species/{species.slug}",
    }


def tratamiento_source_key(pk: int) -> str:
    return f"tratamiento:{pk}"


def build_tratamiento_chunk(tratamiento) -> dict[str, str]:
    parts = [
        f"Tratamiento: {tratamiento.nombre}",
        f"Precio base: {tratamiento.precio_base}€",
        f"Descripción: {tratamiento.descripcion}",
    ]
    return {
        "source_key": tratamiento_source_key(tratamiento.pk),
        "title": f"Tratamiento: {tratamiento.nombre}"[:255],
        "content": "\n\n".join(parts),
        "category": TechnicalKnowledge.Category.TRATAMIENTO,
        "source": f"tratamiento/{tratamiento.pk}",
    }


def ficha_source_key(codigo: str) -> str:
    return f"ficha:{codigo}"


def build_ficha_chunk(ficha) -> dict[str, str] | None:
    """Indexa ficha comercial/operativa. Nunca incluye coste_interno."""
    if not getattr(ficha, "activa", True):
        return None
    parts = [
        f"Ficha: {ficha.codigo} — {ficha.nombre_comercial}",
        f"Pest type: {ficha.pest_type or 'n/a'}",
        f"Prioridad default: {ficha.prioridad_default}",
        f"Riesgo: {ficha.riesgo}",
        f"Dificultad: {ficha.dificultad}",
        f"Garantía meses: {ficha.garantia_meses}",
        _json_block("Tipos cliente", ficha.tipos_cliente),
        _json_block("Lugares", ficha.lugares),
        _json_block("Preguntas obligatorias", ficha.preguntas_obligatorias),
        _json_block("Reglas diagnóstico", ficha.reglas_diagnostico),
        _json_block("Sistema recomendado", ficha.sistema_recomendado),
        _json_block("Tiempo medio", ficha.tiempo_medio),
        _json_block("Material medio", ficha.material_medio),
        _json_block("Reglas comerciales", ficha.reglas_comerciales),
        _json_block("Bloqueos presupuesto", ficha.bloqueos_presupuesto),
        _json_block("Copy comercial", ficha.copy_comercial),
        _json_block("Objeciones", ficha.objeciones),
        _json_block("Venta cruzada", ficha.venta_cruzada),
        _json_block("Seguimiento", ficha.seguimiento),
    ]
    content = "\n\n".join(p for p in parts if p)
    return {
        "source_key": ficha_source_key(ficha.codigo),
        "title": f"Ficha: {ficha.codigo} {ficha.nombre_comercial}"[:255],
        "content": content,
        "category": TechnicalKnowledge.Category.FICHA,
        "source": f"ficha/{ficha.codigo}",
    }


def presupuesto_ref_source_key(pk: int) -> str:
    return f"presupuesto_ref:{pk}"


def build_presupuesto_ref_chunk(ref) -> dict[str, str]:
    """
    Caso histórico anonimizado: ciudad sí, dirección/zone_detail/cliente no.
    """
    lines = [
        "Presupuesto de referencia (anonimizado, sin datos personales).",
        f"Plaga: {ref.pest_type or 'n/a'}",
        f"Severidad: {ref.severity or 'n/a'}",
        f"Tipo inmueble: {ref.property_type or 'n/a'}",
        f"Ciudad: {ref.city or 'n/a'}",
        f"Importe total: {ref.total_monto}€",
        f"Garantía: {ref.garantia_meses} meses",
        f"Origen: {ref.source}",
    ]
    if ref.codigo:
        lines.append(f"Código modelo: {ref.codigo}")
    breakdown = ref.breakdown or []
    if breakdown:
        item_lines = []
        for row in breakdown:
            if not isinstance(row, dict):
                continue
            nombre = row.get("nombre") or row.get("concepto") or "Concepto"
            precio = row.get("precio_unitario", row.get("precio", ""))
            cant = row.get("cantidad", 1)
            item_lines.append(f"- {nombre}: {precio}€ x{cant}")
        if item_lines:
            lines.append("Conceptos:\n" + "\n".join(item_lines))
    if ref.notes:
        # Solo notas genéricas; evitar filtrar PII obvia
        notes = str(ref.notes)
        # No incluir notas que parezcan dirección o teléfono
        if not any(x in notes.lower() for x in ("calle", "carrer", "avinguda", "tel", "+34")):
            lines.append(f"Notas: {notes[:300]}")
    return {
        "source_key": presupuesto_ref_source_key(ref.pk),
        "title": f"Ref presupuesto {ref.total_monto}€ — {ref.city or 'sin ciudad'}"[:255],
        "content": "\n".join(lines),
        "category": TechnicalKnowledge.Category.PRESUPUESTO_REF,
        "source": f"presupuesto_ref/{ref.pk}",
    }


# ---------------------------------------------------------------------------
# Sync por instancia / bulk
# ---------------------------------------------------------------------------


def sync_blog_article(article) -> TechnicalKnowledge | None:
    key = blog_source_key(article.slug)
    chunk = build_blog_chunk(article)
    if not chunk:
        delete_knowledge(key)
        return None
    return upsert_knowledge(**chunk)


def sync_faq_item(item) -> TechnicalKnowledge | None:
    key = faq_source_key(item.slug)
    chunk = build_faq_chunk(item)
    if not chunk:
        delete_knowledge(key)
        return None
    return upsert_knowledge(**chunk)


def sync_company_profile(profile) -> TechnicalKnowledge:
    return upsert_knowledge(**build_company_chunk(profile))


def sync_species(species) -> TechnicalKnowledge:
    return upsert_knowledge(**build_species_chunk(species))


def sync_tratamiento(tratamiento) -> TechnicalKnowledge:
    return upsert_knowledge(**build_tratamiento_chunk(tratamiento))


def sync_ficha_servicio(ficha) -> TechnicalKnowledge | None:
    key = ficha_source_key(ficha.codigo)
    chunk = build_ficha_chunk(ficha)
    if not chunk:
        delete_knowledge(key)
        return None
    return upsert_knowledge(**chunk)


def sync_presupuesto_referencia(ref) -> TechnicalKnowledge:
    return upsert_knowledge(**build_presupuesto_ref_chunk(ref))


def sync_all(
    *,
    only: Iterable[str] | None = None,
    dry_run: bool = False,
    skip_embeddings: bool = False,
    on_progress=None,
) -> dict[str, int]:
    """Reindexa todas las fuentes (o un subconjunto)."""
    from api.models import (
        BlogArticle,
        CompanyProfile,
        FaqItem,
        FichaServicio,
        PresupuestoReferencia,
        Species,
        Tratamiento,
    )

    set_skip_embeddings(skip_embeddings)
    kinds = set(only) if only else set(SOURCE_KINDS)
    counts = {k: 0 for k in SOURCE_KINDS}

    def _apply(chunk: dict[str, str] | None, kind: str) -> None:
        if not chunk:
            return
        counts[kind] += 1
        if on_progress:
            on_progress(kind, chunk.get("source_key") or chunk.get("title") or "")
        if not dry_run:
            upsert_knowledge(**chunk)

    if "blog" in kinds:
        for art in BlogArticle.objects.all():
            chunk = build_blog_chunk(art)
            if chunk:
                _apply(chunk, "blog")
            elif not dry_run:
                delete_knowledge(blog_source_key(art.slug))

    if "faq" in kinds:
        for item in FaqItem.objects.all():
            chunk = build_faq_chunk(item)
            if chunk:
                _apply(chunk, "faq")
            elif not dry_run:
                delete_knowledge(faq_source_key(item.slug))

    if "company" in kinds:
        profile = CompanyProfile.get_solo()
        _apply(build_company_chunk(profile), "company")

    if "species" in kinds:
        for sp in Species.objects.all():
            _apply(build_species_chunk(sp), "species")

    if "tratamiento" in kinds:
        for tr in Tratamiento.objects.all():
            _apply(build_tratamiento_chunk(tr), "tratamiento")

    if "ficha" in kinds:
        for fi in FichaServicio.objects.all():
            chunk = build_ficha_chunk(fi)
            if chunk:
                _apply(chunk, "ficha")
            elif not dry_run:
                delete_knowledge(ficha_source_key(fi.codigo))

    if "presupuesto_ref" in kinds:
        for ref in PresupuestoReferencia.objects.all():
            _apply(build_presupuesto_ref_chunk(ref), "presupuesto_ref")

    return counts
