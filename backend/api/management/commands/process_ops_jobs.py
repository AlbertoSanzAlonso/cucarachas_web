"""Procesa la cola OpsJob (acciones ya confirmadas)."""

from __future__ import annotations

import time

from django.core.management.base import BaseCommand

from api.ops_jobs import process_queued_jobs


class Command(BaseCommand):
    help = "Ejecuta OpsJob en cola y deja feedback en el chat de oficina."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=20)
        parser.add_argument(
            "--loop",
            action="store_true",
            help="Sigue procesando (worker). Intervalo con --sleep.",
        )
        parser.add_argument("--sleep", type=int, default=5)

    def handle(self, *args, **options):
        while True:
            done = process_queued_jobs(limit=options["limit"], post_feedback=True)
            self.stdout.write(f"procesados={len(done)}")
            if not options["loop"]:
                return
            time.sleep(max(1, options["sleep"]))
