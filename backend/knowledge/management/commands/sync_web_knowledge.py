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

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        only = options.get("only")
        counts = sync_all(only=only, dry_run=dry_run)
        total = sum(counts.values())
        prefix = "[dry-run] " if dry_run else ""
        for kind, n in counts.items():
            if only and kind not in only:
                continue
            self.stdout.write(f"{prefix}{kind}: {n}")
        self.stdout.write(self.style.SUCCESS(f"{prefix}Total chunks: {total}"))
