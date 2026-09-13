"""Reindexa contenido dinámico público en TechnicalKnowledge (pgvector)."""

from __future__ import annotations

from django.core.management.base import BaseCommand

from knowledge.sync import SOURCE_KINDS, sync_all


class Command(BaseCommand):
    help = (
        "Sincroniza blog, FAQ, empresa, especies, tratamientos, fichas y "
        "referencias de presupuesto (anonimizadas) hacia la base vectorial RAG."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Cuenta chunks sin escribir en la BD.",
        )
        parser.add_argument(
            "--only",
            nargs="+",
            choices=list(SOURCE_KINDS),
            help="Limita a una o más fuentes (ej. --only blog faq).",
        )
        parser.add_argument(
            "--skip-embeddings",
            action="store_true",
            help=(
                "No llama a Gemini: guarda vector cero. Más rápido; "
                "el retriever sigue funcionando por búsqueda textual."
            ),
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        only = options.get("only")
        skip_embeddings = options["skip_embeddings"]
        if skip_embeddings:
            self.stdout.write(self.style.WARNING("Embeddings desactivados (--skip-embeddings)."))

        def on_progress(kind: str, key: str) -> None:
            self.stdout.write(f"  → {kind}: {key}")
            self.stdout.flush()

        self.stdout.write("Iniciando sync_web_knowledge…")
        self.stdout.flush()
        counts = sync_all(
            only=only,
            dry_run=dry_run,
            skip_embeddings=skip_embeddings,
            on_progress=None if dry_run else on_progress,
        )
        total = sum(counts.values())
        prefix = "[dry-run] " if dry_run else ""
        for kind, n in counts.items():
            if only and kind not in only:
                continue
            self.stdout.write(f"{prefix}{kind}: {n}")
        self.stdout.write(self.style.SUCCESS(f"{prefix}Total chunks: {total}"))
