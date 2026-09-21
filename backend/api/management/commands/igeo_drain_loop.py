"""Drena exportaciones y resultadoImportaciones hacia el espejo local."""

from __future__ import annotations

import time

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Consume colas PDI (exportaciones + ACK) e ingiere el espejo. Solo PRE en operación real."

    def add_arguments(self, parser):
        parser.add_argument("--max", type=int, default=20)
        parser.add_argument("--once", action="store_true", help="Una pasada y sale.")
        parser.add_argument("--sleep", type=int, default=20)

    def handle(self, *args, **options):
        from api.igeo.client import IgeoPdiClient
        from api.igeo.ingest import ingest_export_batch

        client = IgeoPdiClient()
        while True:
            exports = client.peek_exports(max_messages=options["max"])
            stats = ingest_export_batch(exports, source="export") if exports else {
                "created": 0, "updated": 0, "errors": 0, "total": 0,
            }
            acks = client.get_import_results(max_messages=options["max"])
            self.stdout.write(
                f"exports={stats['total']} created={stats['created']} "
                f"updated={stats['updated']} acks={len(acks)}"
            )
            if options["once"]:
                return
            time.sleep(max(5, options["sleep"]))
