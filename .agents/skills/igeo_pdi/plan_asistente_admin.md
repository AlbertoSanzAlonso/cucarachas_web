# Plan de acción: asistente administrativo CECSA ↔ iGEO

Documento operativo para ejecutar **cuando iGEO entregue credenciales PDI**.
iGEO sigue siendo el sistema central. CECSA no sustituye el ERP: lo opera con instrucciones en lenguaje natural (texto y, más adelante, voz), desde el panel y cualquier dispositivo.

## Principio de arquitectura (no negociable)

```
Persona (texto/voz/dispositivo)
  → panel o canal CECSA
  → backend CECSA (reglas, permisos, idempotencia, auditoría)
  → funciones concretas (tools)
  → PDI iGEO (colas)
  → iGEO aplica el cambio
  → resultado + exportaciones → espejo CECSA
  → el asistente responde con datos del espejo, no “a ciegas”
```

La IA **no** escribe en la BD de iGEO ni publica JSON libre.
Solo invoca **funciones con contrato** (`buscar_cliente`, `crear_potencial`, `programar_odt`, …).
El backend valida, deduplica, audita y publica.

Canal real de iGEO: **PDI (RabbitMQ)**, no REST de negocio.
- Escritura: cola `importaciones` (`CREATE` / `UPDATE` / `DELETE`)
- ACK: cola `resultadoImportaciones`
- Lectura: cola `exportaciones` + **espejo local** (búsquedas síncronas)

Entorno de pruebas: virtual host `pre_…` hasta validar. Producción solo con checklist de go-live.

---

## Día 0 — al recibir credenciales (1–2 días)

Checklist mínimo:

1. Guardar secretos **solo** en Coolify / `.env` local (nunca git):
   - `IGEO_PDI_HOST`, `IGEO_PDI_PORT`, `IGEO_PDI_SSL`
   - `IGEO_PDI_USER`, `IGEO_PDI_PASSWORD`, `IGEO_PDI_VHOST` (pre)
   - `IGEO_DEFAULT_DELEGACION`, `IGEO_DEFAULT_GESTOR`
2. Entrar en consola pre: `https://pdi.pre.igeoapp.com:15671/`
3. Verificar colas: `importaciones`, `resultadoImportaciones`, `exportaciones`
4. Migrar backend (`0020_cliente_igeo_sync`) y `IGEO_PDI_ENABLED=true` + `IGEO_PDI_DRY_RUN=false` **solo en pre**
5. Publicar un `CLIENTE_POTENCIAL` de prueba (MCP o script) con `remoteOperationId` único
6. Leer `resultadoImportaciones`: `codigo == "1"` o corregir campos `*!`
7. Anotar códigos maestros reales (delegación, gestor, actividad, zona, línea de negocio, técnicos)

Si el ACK falla: no pasar a fase 1. Completar mapeo de campos con iGEO.

---

## Circuito objetivo (mapa entidad ↔ función)

| Paso CECSA | Entidad iGEO | Función del backend | Confirmación humana |
|------------|--------------|---------------------|---------------------|
| Identificar contacto | espejo `CLIENTE` / `CONTACTO` / `SEDE` | `buscar_ficha` (tel, email, nombre, dirección) | No |
| Alta si no existe | `CLIENTE_POTENCIAL` | `crear_potencial` | No (si datos mínimos) |
| Incidencia / repaso | OT / nota / incidencia* | `registrar_incidencia` | Sí si hay duda contrato vs garantía |
| Presupuesto | presupuesto / potencial | `crear_presupuesto` / sync local+iGEO | Sí si precio excepcional |
| Aceptación → cliente | `CLIENTE` + `SEDE` | `convertir_potencial_a_cliente` | Sí |
| Contrato | `CONTRATO` | `crear_actualizar_contrato` | Sí |
| Planificación | `ORDEN_DE_TRABAJO` + horarios | `programar_visita` | Sí si cambia planning de otro técnico |
| Certificado / docs | `DOCUMENTO` | `adjuntar_documento` | No |
| Factura / cobro | `FACTURA` | `emitir_factura` / `registrar_cobro` | Sí |
| Renovación | `CONTRATO` | `listar_renovaciones` / `renovar` | Sí |

\*Si iGEO no exporta “incidencia” como entidad, se modela como OT de tipo repaso + notas + vínculo a contrato.

Reglas internas CECSA (motor, no prompt):
- Distinguir **aplicación prevista** (contrato) vs **repaso sin coste** (garantía / incidencia)
- Resolver contrato por **sede**, no solo por cliente
- Asignar técnico, franja y duración según planning espejo
- Completar zonas a tratar antes de cerrar OT
- Si falta dato obligatorio o hay excepción → **handoff humano**, no inventar

---

## Fases de entrega

### Fase 0 — ya hecha (código actual)

- Cliente PDI compartido (`backend/api/igeo/`)
- Dry-run, payloads mínimos, `IgeoSyncLog`, `Cliente.igeo_codigo`
- Hook chat → `CLIENTE_POTENCIAL` al confirmar cita
- MCP Cursor + tools genéricas en scheduler/CRM
- Skill PDI

No cubre aún: worker de exportaciones, chat admin, permisos por rol, voz, facturación.

### Fase 1 — Espejo operativo y búsqueda (sustituye “consultar en el browser”)

Objetivo: el asistente **encuentra** lo que hoy se busca a mano en iGEO.

- Worker continuo: consume `exportaciones` y `resultadoImportaciones`
- Tablas espejo (mínimo): Cliente, Contacto, Sede, Contrato, OT, Factura (IDs/códigos iGEO + campos de búsqueda)
- Idempotencia: `remoteOperationId` + `idempotency_key` (hash de acción + entidad)
- Dedup: teléfono normalizado, email, `codigoIdentificacion`, dirección+CP
- `buscar_ficha(query)`: exacto SQL primero; semántico solo sobre notas/docs
- **No** vectorizar la BD entera. Vectores: notas, incidencias, cláusulas, normativa, resúmenes de contrato

Criterio de hecho: “busca este cliente por teléfono” devuelve ficha + sedes + contratos en <2 s desde el espejo.

### Fase 2 — Asistente en el AdminDashboard (órdenes en lenguaje natural)

Objetivo: sustituir ChatGPT+navegador para el día a día.

- Chat interno autenticado (token Django, no público)
- El modelo **solo** llama tools; no puede publicar payloads arbitrarios
- Permisos por usuario (mínimo): `consulta` | `comercial` | `planificacion` | `facturacion` | `admin`
- Confirmación **solo** en: alta cliente, contrato, factura, delete, cambio de técnico ajeno, precio fuera de tarifa
- Auditoría por acción: quién, cuándo, tool, argumentos, payload, ACK iGEO, resultado al usuario
- Entrada inicial: texto. Voz = STT en el cliente → mismo backend (fase 5)

Tools fase 2:
- `buscar_ficha`
- `crear_potencial`
- `actualizar_contacto_sede`
- `crear_incidencia_o_repaso`
- `programar_odt` (fecha, hora, técnico, duración, zonas)

Criterio de hecho: una recepción puede hacer el ejemplo “correo/llamada → identificar → potencial o incidencia” sin abrir iGEO.

### Fase 3 — Circuito comercial (potencial → presupuesto → cliente/contrato)

- Presupuesto: seguir motor CECSA (`ficha_engine` / `presupuesto_agent`) como fuente de reglas de precio; empujar a iGEO cuando el mapeo de entidad esté validado en pre
- Conversión potencial → `CLIENTE` + `SEDE`
- Alta/ajuste `CONTRATO` con línea de negocio y zonas
- Listado “renovaciones de octubre” sobre espejo (fecha fin / próximo servicio)

Criterio de hecho: presupuesto aceptado genera cliente+contrato en iGEO sin duplicar si se reintenta.

### Fase 4 — Planning, certificados, facturación, cobro

- OT previstas vs ejecutadas; aplicaciones; garantías
- Documentos/certificados (`DOCUMENTO`)
- Facturas, vencimientos, cobros, remesas **solo** con rol `facturacion`
- Reconciliar ACK: si iGEO rechaza, la operación queda `failed` y se puede reenviar **el mismo** `remoteOperationId` sin duplicar

Criterio de hecho: “programa mañana 7:30 con Toni” crea OT en iGEO y aparece en planning espejo; “emite factura de la OT X” exige confirmación y rol.

### Fase 5 — Multicanal (voz y cualquier dispositivo)

- Misma API de órdenes; UI móvil/admin responsive
- Voz: transcripción → intención → mismas tools
- Canales extra (email/WhatsApp interno) **después** de permisos y auditoría sólidos
- El Bio-Assistent **público** (web clientes) no gana poderes de ERP; solo el panel interno

---

## Controles técnicos (obligatorios en cada fase)

| Control | Cómo |
|---------|------|
| Sin duplicados | Dedup espejo + iGEO `codigo` / teléfono / factura número |
| Reintentos seguros | `remoteOperationId` estable; no CREATE nuevo si ya hay ACK OK |
| Auditoría | `IgeoSyncLog` + usuario Django + tool + diff |
| Permisos | roles en backend; el LLM no elige el rol |
| Confirmación | flag `requires_confirmation` por tool/umbral |
| RGPD | secretos en env; PII fuera de vectores públicos; retention de logs |
| Errores | estado `pending` / `acked` / `failed`; cola de revisión humana |
| Pre vs prod | vhost `pre_` hasta go-live; feature flag `IGEO_PDI_ENABLED` |

## Qué no hará la IA

- Publicar a iGEO sin pasar por una tool
- Inventar códigos de técnico, delegación o tratamiento
- Borrar facturas/contratos sin confirmación explícita
- Mezclar agenda web pública (slots chat) con planning iGEO hasta que se decida una sola fuente (fase 4+)

## Go-live producción

1. Mismas pruebas en vhost prod con un potencial dummy
2. `DRY_RUN=false`, feature flag por rol
3. Semana en paralelo: asistente + comprobación en UI iGEO
4. Retirar el flujo “ChatGPT en el browser” para las operaciones cubiertas

## Orden de trabajo el día que existan credenciales

1. Día 0 (conexión + ACK de un potencial)
2. Fase 1 (espejo + búsqueda)
3. Fase 2 (chat admin + 5 tools)
4. Fases 3–4 según prioridad de recepción / oficina
5. Fase 5 voz/móvil

Hasta Día 0, no hay más código de escritura real: el cuello de botella es el PDI y los códigos maestros.
