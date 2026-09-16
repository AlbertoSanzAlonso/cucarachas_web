"""Reindexa corpus operativo (oficina / iGEO) en TechnicalKnowledge (audience=ops)."""

from __future__ import annotations

from django.core.management.base import BaseCommand

from knowledge.ops_sync import sync_all_ops


class Command(BaseCommand):
    help = (
        "Sincroniza playbooks ops, skill iGEO y la guía PDI (PDF) "
        "hacia la base vectorial RAG con audience=ops."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Cuenta chunks sin escribir en la BD.",
        )
        parser.add_argument(
            "--skip-embeddings",
            action="store_true",
            help=(
                "No llama a Gemini: guarda vector cero. Más rápido; "
                "el retriever sigue funcionando por búsqueda textual."
            ),
        )
        parser.add_argument(
            "--skip-pdf",
            action="store_true",
            help="No indexa el PDF PDI (útil en CI sin el archivo).",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        skip_embeddings = options["skip_embeddings"]
        skip_pdf = options["skip_pdf"]
        if skip_embeddings:
            self.stdout.write(self.style.WARNING("Embeddings desactivados (--skip-embeddings)."))
        if skip_pdf:
            self.stdout.write(self.style.WARNING("PDF PDI omitido (--skip-pdf)."))

        def on_progress(kind: str, key: str) -> None:
            self.stdout.write(f"  → {kind}: {key}")
            self.stdout.flush()

        self.stdout.write("Iniciando sync_ops_knowledge…")
        self.stdout.flush()
        counts = sync_all_ops(
            dry_run=dry_run,
            skip_embeddings=skip_embeddings,
            skip_pdf=skip_pdf,
            on_progress=None if dry_run else on_progress,
        )
        total = sum(counts.values())
        prefix = "[dry-run] " if dry_run else ""
        for kind, n in counts.items():
            self.stdout.write(f"{prefix}{kind}: {n}")
        self.stdout.write(self.style.SUCCESS(f"{prefix}Total chunks: {total}"))
