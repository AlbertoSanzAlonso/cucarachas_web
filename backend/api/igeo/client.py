"""Cliente AMQP / dry-run para colas PDI iGEO."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any

from .config import IgeoPdiSettings, get_igeo_settings

logger = logging.getLogger(__name__)

QUEUE_IMPORTACIONES = "importaciones"
QUEUE_RESULTADOS = "resultadoImportaciones"
QUEUE_EXPORTACIONES = "exportaciones"


@dataclass
class PublishResult:
    ok: bool
    dry_run: bool
    remote_operation_id: str | None
    message: str
    payload: dict[str, Any] = field(default_factory=dict)


class IgeoPdiClient:
    """Publica en importaciones y consume resultadoImportaciones / exportaciones."""

    def __init__(self, settings: IgeoPdiSettings | None = None):
        self.settings = settings or get_igeo_settings()

    def publish(self, payload: dict[str, Any]) -> PublishResult:
        remote_id = payload.get("remoteOperationId")
        if isinstance(remote_id, str):
            remote_id = remote_id.strip() or None
        else:
            remote_id = None

        body = json.dumps(payload, ensure_ascii=False, indent=None)
        if not self.settings.enabled:
            return PublishResult(
                ok=False,
                dry_run=True,
                remote_operation_id=remote_id,
                message="IGEO_PDI_ENABLED=false; publicación omitida",
                payload=payload,
            )

        if self.settings.dry_run or not self.settings.credentials_ready:
            logger.info(
                "iGEO PDI dry-run publish tipo=%s comando=%s remote=%s",
                payload.get("tipoEntidadIgeo"),
                payload.get("comando"),
                remote_id,
            )
            logger.debug("iGEO PDI dry-run body=%s", body)
            return PublishResult(
                ok=True,
                dry_run=True,
                remote_operation_id=remote_id,
                message="Dry-run: payload validado, no enviado a RabbitMQ",
                payload=payload,
            )

        try:
            self._publish_amqp(body)
        except Exception as exc:
            logger.exception("iGEO PDI publish failed")
            return PublishResult(
                ok=False,
                dry_run=False,
                remote_operation_id=remote_id,
                message=f"Error publicando en importaciones: {exc}",
                payload=payload,
            )

        return PublishResult(
            ok=True,
            dry_run=False,
            remote_operation_id=remote_id,
            message="Mensaje publicado en cola importaciones",
            payload=payload,
        )

    def drain_queue(
        self,
        queue_name: str,
        *,
        max_messages: int = 20,
        tipo_filtro: str | None = None,
    ) -> list[dict[str, Any]]:
        """Consume hasta max_messages (ack). En dry-run / sin credenciales → []."""
        if not self.settings.credentials_ready or self.settings.dry_run:
            logger.info("iGEO PDI drain skipped (dry-run or missing credentials): %s", queue_name)
            return []

        messages: list[dict[str, Any]] = []
        connection = None
        skipped = 0
        try:
            connection = self._connect()
            channel = connection.channel()
            max_get = max(1, min(max_messages, 100))
            # Extra gets allow skipping filtered messages without spinning forever
            attempts = max_get * 3 if tipo_filtro else max_get
            for _ in range(attempts):
                if len(messages) >= max_get:
                    break
                method, _props, body = channel.basic_get(queue=queue_name, auto_ack=False)
                if method is None:
                    break
                parsed = self._parse_body(body)
                if tipo_filtro:
                    tipo = (
                        parsed.get("tipoEntidadIgeo")
                        or parsed.get("claseEntidadIgeo")
                        or parsed.get("tipoEntidadigeo")
                        or ""
                    )
                    if str(tipo).upper() != tipo_filtro.strip().upper():
                        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
                        skipped += 1
                        if skipped > max_get * 2:
                            break
                        continue
                channel.basic_ack(delivery_tag=method.delivery_tag)
                messages.append(parsed)
        except Exception:
            logger.exception("iGEO PDI drain failed queue=%s", queue_name)
            raise
        finally:
            if connection is not None and connection.is_open:
                connection.close()
        return messages

    def get_import_results(self, *, max_messages: int = 20) -> list[dict[str, Any]]:
        return self.drain_queue(QUEUE_RESULTADOS, max_messages=max_messages)

    def peek_exports(
        self,
        *,
        max_messages: int = 20,
        tipo_entidad: str | None = None,
    ) -> list[dict[str, Any]]:
        return self.drain_queue(
            QUEUE_EXPORTACIONES,
            max_messages=max_messages,
            tipo_filtro=tipo_entidad,
        )

    def _publish_amqp(self, body: str) -> None:
        connection = self._connect()
        try:
            channel = connection.channel()
            channel.basic_publish(
                exchange="importaciones_exchange",
                routing_key=QUEUE_IMPORTACIONES,
                body=body.encode("utf-8"),
                properties=__import__("pika").BasicProperties(
                    content_type="application/json",
                    content_encoding="utf-8",
                    delivery_mode=2,
                ),
            )
        finally:
            if connection.is_open:
                connection.close()

    def _connect(self):
        import pika

        credentials = pika.PlainCredentials(self.settings.user, self.settings.password)
        params = pika.ConnectionParameters(
            host=self.settings.host,
            port=self.settings.port,
            virtual_host=self.settings.vhost,
            credentials=credentials,
            ssl_options=pika.SSLOptions(context=__import__("ssl").create_default_context())
            if self.settings.use_ssl
            else None,
            heartbeat=30,
            blocked_connection_timeout=30,
            connection_attempts=2,
            retry_delay=1,
        )
        return pika.BlockingConnection(params)

    @staticmethod
    def _parse_body(body: bytes | str | None) -> dict[str, Any]:
        if body is None:
            return {}
        text = body.decode("utf-8") if isinstance(body, (bytes, bytearray)) else str(body)
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            return {"raw": text}
        if isinstance(data, dict):
            # Rabbit HTTP API wraps payload as string sometimes
            inner = data.get("payload")
            if isinstance(inner, str):
                try:
                    parsed_inner = json.loads(inner)
                    if isinstance(parsed_inner, dict):
                        return parsed_inner
                except json.JSONDecodeError:
                    pass
            return data
        return {"data": data}
