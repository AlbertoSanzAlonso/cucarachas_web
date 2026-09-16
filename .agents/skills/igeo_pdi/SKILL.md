---
name: igeo-pdi
description: >-
  Integración iGEO ERP vía PDI (RabbitMQ): cliente compartido, MCP Cursor,
  sync de leads tras reserva. Consultar antes de tocar backend/api/igeo/ o mcp-igeo/.
---

# Skill: iGEO PDI (CECSA ↔ iGEO ERP)

## Modelo mental

iGEO **no** ofrece REST CRUD de negocio. El PDI es **RabbitMQ**:

| Cola | Dirección | Uso |
|------|-----------|-----|
| `importaciones` | CECSA → iGEO | CREATE / UPDATE / DELETE |
| `resultadoImportaciones` | iGEO → CECSA | ACK / errores |
| `exportaciones` | iGEO → CECSA | Cambios empujados (lectura) |

Guía: `Import Export Programmers Guide PDI English v3.docx (1).pdf` en la raíz del repo.

Consolas: pre `https://pdi.pre.igeoapp.com:15671/` · prod `https://pdi.igeoapp.com:15671/`

## Archivos

| Área | Ruta |
|------|------|
| Cliente / payloads | `backend/api/igeo/` |
| Hook post-cita | `backend/api/agenda/engine.py` → `publish_lead_from_booking` |
| Tools agentes públicos | `backend/api/agents/public/igeo_tools.py` (scheduler + sintetizador) |
| Asistente oficina | `backend/api/agents/ops/agent.py` |
| MCP Cursor | `mcp-igeo/server.py` (+ `mcp-igeo/README.md`) |
| Espejo | `IgeoMirrorEntity` (SQL) + `Cliente.igeo_codigo` + `IgeoSyncLog` |
| Ingesta | `python manage.py igeo_ingest_exports --demo` (sense cua) o `--from-queue` |

## Env (Coolify)

```
IGEO_PDI_ENABLED=true
IGEO_PDI_HOST=pdi.pre.igeoapp.com
IGEO_PDI_PORT=5671
IGEO_PDI_SSL=true
IGEO_PDI_USER=...
IGEO_PDI_PASSWORD=...
IGEO_PDI_VHOST=pre_cecsa
IGEO_PDI_DRY_RUN=true   # quitar en prod real
IGEO_DEFAULT_DELEGACION=...
IGEO_DEFAULT_GESTOR=...
IGEO_DEFAULT_IDIOMA=es_ES
IGEO_DEFAULT_ACTIVIDAD=   # opcional
IGEO_DEFAULT_ZONA_COMERCIAL=  # opcional
```

Sin credenciales → dry-run (loguea payload, no publica).

## Plan de acción (asistente admin, circuito completo)

Cuando existan credenciales PDI, seguir
[`.agents/skills/igeo_pdi/plan_asistente_admin.md`](plan_asistente_admin.md):
Día 0 → espejo/búsqueda → chat admin con tools → comercial → planning/facturación → voz.

Principio: la IA no escribe en iGEO; el backend CECSA valida, audita y llama funciones concretas.

## Chat admin (backoffice)

Pestanya **Assistent** (`ops`): `AdminOpsChat.jsx` + `POST /api/ops/conversations/{id}/messages/`.
Selector de model (`GET /api/ops/models/`, allowlist a `OPS_AGENT_MODELS`). El camp `model` s’envia amb text i veu; si no és de la llista, cau al default.
WhatsApp: `backend/api/openwa/` parla amb el contenidor (`OPENWA_API_URL`, per defecte `http://openwa:2785/api`). Tools `whatsapp_status` i `send_whatsapp`. Només envia si l’operari ho demana. Sense `OPENWA_ENABLED` o sense sessió → dry-run.
Veu: `audio` multipart → Whisper intern + resposta TTS. No comparteix sessió ni prompt amb el Bio-Assistent públic.

## Espejo (fase 1, sense credencials)

Còpia **relacional** a Postgres (`IgeoMirrorEntity`). No és el RAG del Bio-Assistent.

```bash
python manage.py migrate
python manage.py igeo_ingest_exports --demo
```

L’assistent d’oficina busca amb `search_igeo_espejo`. Quan hi hagi PDI: `igeo_ingest_exports --from-queue`.

## Flujo v1

1. Usuario confirma cita en chat.
2. Agenda Django crea `AgendaAppointment` (fuente de verdad de slots).
3. Si `IGEO_PDI_ENABLED`, se publica `CLIENTE_POTENCIAL` con `remoteOperationId` = uid cita.
4. Resultados: consumir `resultadoImportaciones` (MCP tool o job futuro).

## MCP Cursor

Ver `mcp-igeo/README.md` y `mcp-igeo/mcp.json.example`. **No** commitear passwords.

Tools: `igeo_status`, `igeo_create_lead`, `igeo_publish_entity`, `igeo_get_import_results`, `igeo_peek_exports`.

## Anti-patterns

- Sustituir la agenda propia por iGEO en v1.
- Asumir GET síncrono de clientes (usar exportaciones + espejo).
- Hardcodear user/password o códigos de producción.
- Publicar OT sin códigos maestros (delegación, sede, tratamiento) validados en pre.
