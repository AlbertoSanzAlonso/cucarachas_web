"""Siembra conocimiento comercial en TechnicalKnowledge (RAG) y refresca fichas clave."""

from __future__ import annotations

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Upsert política comercial en RAG + ficha CUC-DDD-PREV / objeciones (sin costes internos)."

    def handle(self, *args, **options):
        from api.commercial_seed import COMMERCIAL_KNOWLEDGE_CHUNKS
        from knowledge.models import TechnicalKnowledge

        zero = [0.0] * 3072
        for chunk in COMMERCIAL_KNOWLEDGE_CHUNKS:
            emb = zero
            try:
                import os

                if os.environ.get("GOOGLE_API_KEY"):
                    from knowledge.retriever import get_embedding

                    emb = get_embedding(chunk["content"])
            except Exception as exc:
                self.stdout.write(self.style.WARNING(f"Embedding skip ({chunk['title']}): {exc}"))
                emb = zero

            obj, created = TechnicalKnowledge.objects.update_or_create(
                source_key=f"comercial:{chunk['title'][:120]}",
                defaults={
                    "title": chunk["title"],
                    "content": chunk["content"],
                    "source": "CECSA política comercial",
                    "category": chunk.get("category") or "comercial",
                    "embedding": emb,
                },
            )
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'}: {chunk['title']}"))

        # Refrescar fichas desde seed_data (idempotente)
        try:
            from seed_data import seed as run_seed

            run_seed()
            self.stdout.write(self.style.SUCCESS("Fichas/seed_data actualizadas."))
        except Exception as exc:
            self.stdout.write(self.style.WARNING(f"seed_data no ejecutado: {exc}"))
