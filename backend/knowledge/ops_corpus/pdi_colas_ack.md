# Colas PDI iGEO y ACK

Canal real d'iGEO: **RabbitMQ PDI**, no REST de negoci.

## Colas

| Cola | Dirección | Uso |
|------|-----------|-----|
| `importaciones` | CECSA → iGEO | CREATE / UPDATE / DELETE |
| `resultadoImportaciones` | iGEO → CECSA | ACK / errores de importación |
| `exportaciones` | iGEO → CECSA | Cambios empujados (lectura → espejo) |

Consolas: pre `https://pdi.pre.igeoapp.com:15671/` · prod `https://pdi.igeoapp.com:15671/`.
Entorno de pruebas: virtual host `pre_…` hasta validar.

## Envelope mínimo de importación

JSON UTF-8 con:

- `tipoEntidadIgeo` (CLIENTE_POTENCIAL, CLIENTE, SEDE, CONTACTO, ORDEN_DE_TRABAJO, CONTRATO, DOCUMENTO, …)
- `comando`: CREATE | UPDATE | DELETE
- `datos`: objeto con campos de la entidad
- `codigoEntidadIgeo` (si aplica UPDATE/DELETE)
- `remoteOperationId` (idempotencia)

## Interpretar ACK (`resultadoImportaciones`)

- `codigo == "1"` (o equivalente OK documentado) → importación aceptada; actualizar espejo / `IgeoSyncLog`.
- Error / campos `*!` → la operación queda `failed`; corregir datos y **reenviar el mismo** `remoteOperationId` (no crear otro CREATE).
- No fingir éxito si `IGEO_PDI_ENABLED=false` o dry-run: informar a l'operari que només s'ha validat el payload.

## Lectura

No hi ha GET síncron de clients. La lectura operativa és:

1. Consumir `exportaciones` → upsert `IgeoMirrorEntity`.
2. Cercar a l'espill SQL (`search_igeo_espejo` / CRM).

## Flags

- `IGEO_PDI_DRY_RUN=true`: valida sense publicar.
- Sense credencials → comportament dry-run (log, no cua).
