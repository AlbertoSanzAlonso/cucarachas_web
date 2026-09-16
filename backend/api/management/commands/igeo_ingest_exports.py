"""Ingesta de exportaciones iGEO al espejo local (sin credenciales: --demo o --file)."""

from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = (
        "Ingerexa missatges PDI (exportaciones) a l'espill SQL. "
        "Sense credencials: --demo o --file. Amb cua: --from-queue."
    )

    def add_arguments(self, parser):
        parser.add_argument("--file", dest="json_file", help="JSON (objecte o llista) amb payloads PDI")
        parser.add_argument("--demo", action="store_true", help="Carrega 4 entitats de prova CECSA")
        parser.add_argument(
            "--from-queue",
            action="store_true",
            help="Consumeix la cua exportaciones (requereix credencials PDI)",
        )
        parser.add_argument("--max", type=int, default=50, help="Màxim de missatges de la cua")

    def handle(self, *args, **options):
        from api.igeo.ingest import ingest_export_batch, mirror_counts

        payloads: list[dict] = []
        source = "file"
        if options["demo"]:
            from api.igeo.demo import demo_export_payloads

            payloads = demo_export_payloads()
            source = "demo"
        elif options["json_file"]:
            path = Path(options["json_file"])
            if not path.is_file():
                raise CommandError(f"No existeix el fitxer: {path}")
            raw = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(raw, list):
                payloads = [p for p in raw if isinstance(p, dict)]
            elif isinstance(raw, dict):
                payloads = [raw]
            else:
                raise CommandError("El JSON ha de ser un objecte o una llista.")
            source = "file"
        elif options["from_queue"]:
            from api.igeo.client import IgeoPdiClient

            client = IgeoPdiClient()
            payloads = client.peek_exports(max_messages=options["max"])
            source = "export"
            if not payloads:
                self.stdout.write(
                    self.style.WARNING(
                        "Cua buida o PDI en dry-run / sense credencials. "
                        "Usa --demo mentre no hi hagi RabbitMQ."
                    )
                )
        else:
            raise CommandError("Indica --demo, --file PATH o --from-queue.")

        stats = ingest_export_batch(payloads, source=source)
        self.stdout.write(
            f"ingesta source={source} created={stats['created']} "
            f"updated={stats['updated']} errors={stats['errors']} total={stats['total']}"
        )
        self.stdout.write(mirror_counts())
