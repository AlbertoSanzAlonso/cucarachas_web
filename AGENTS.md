# Mantenimiento mediante Agentes AI (CECSA Control de Plagas)

Este proyecto está diseñado para ser mantenido y evolucionado por agentes de IA. Para garantizar la consistencia, se han definido una serie de **Skills** que definen las reglas y procedimientos para cada área.

## 🏷 Nombre de Marca y Enfoque

- **Nombre Oficial**: **CECSA Control de Plagas** (anteriormente Urban Plagas).
- **Nicho Especializado**: El sitio está especializado exclusivamente en el **control de cucarachas** (desinsectación técnica).
- **Eslógan**: **"Ético y Consciente"** (eliminar cualquier referencia a "Científico").
- **Localización Principal**: **Catalunya / Barcelona**.

## 🌍 Internacionalización (i18n)

- **Idioma Primario**: **Catalán** (`ca`).
- **Idiomas Secundarios**: Castellano (`es`) e Inglés (`en`).
- Todos los componentes deben usar el hook `useTranslation` de `react-i18next`. Los textos estáticos en JSX están prohibidos para contenido de negocio.

## 🎨 Sistema de Diseño Activo: "Sanitary Premium Clean"

- **Patrón**: Trust & Authority + Conversion (centralizado en `index.css`).
- **Tokens de Marca (Variables CSS)**:
  - **Corporativo**: `--primary-blue` (`#0080bb`), `--primary-blue-hv` (`#006fa3`).
  - **Acción/CTA**: `--accent-green` (`#34d399`), `--accent-green-hv` (`#10b981`).
  - **Neutrales**: `--secondary-gray` (`#3c3c3b`), `--bg-light` (`#f8fafc`).
- **Jerarquía de Texto**: Usar `--text-white-dim` y `--text-white-muted` para contenidos secundarios sobre fondos azules.
- **Inline styles obligatorios**: Usar siempre `style={{}}` en Navbar, Footer y FloatingCTA, PERO **siempre invocando las variables CSS** (ej: `background: 'var(--primary-blue)'`) para mantener la centralización.

## 🚀 Infraestructura de Despliegue

| Capa | Plataforma | URL |
|------|-----------|-----|
| **Frontend (React/Vite)** | **Vercel** | `https://cucarachasbarcelona.cat` |
| **Backend (Django/Uvicorn)** | **Coolify (Hetzner)** | `https://api.cucarachasbarcelona.cat` |
| **Base de datos** | **PostgreSQL en Coolify** | via `DATABASE_URL` env var |

> ⚠️ **InsForge NO se usa para nada.** No desplegar el frontend en InsForge. El auth es Django nativo (DRF Token). Ignorar cualquier archivo `.insforge/` que pueda existir.

### Variables de entorno requeridas

**Vercel (Frontend):**
- `VITE_API_URL` = `https://api.cucarachasbarcelona.cat`

**Coolify (Backend):**
- `DATABASE_URL` = connection string PostgreSQL
- `AGENDA_TIMEZONE` = `Europe/Madrid` (opcional)
- `AGENDA_SLOT_MINUTES` = `30` (opcional)
- `AGENDA_DAYS_AHEAD` = `14` (ventana de slots del chat)
- `DJANGO_SECRET_KEY` = clave secreta Django
- `OPENAI_API_KEY` = clave de OpenAI (principal para los agentes)
- `GOOGLE_API_KEY` = clave de Google (usada para Geocoding y fallback de agentes)
- `IGEO_PDI_ENABLED` = `true` para sync leads → iGEO tras reserva (opcional)
- `IGEO_PDI_HOST` / `IGEO_PDI_PORT` / `IGEO_PDI_SSL` / `IGEO_PDI_USER` / `IGEO_PDI_PASSWORD` / `IGEO_PDI_VHOST` = credenciales RabbitMQ PDI
- `IGEO_PDI_DRY_RUN` = `true` en pre (valida sin publicar)
- `IGEO_DEFAULT_DELEGACION` / `IGEO_DEFAULT_GESTOR` = códigos maestros CECSA en iGEO (*! para leads)
- Espejo iGEO: `python manage.py igeo_ingest_exports --demo` (local, sin cola)
- `AGENT_ENABLE_CLIENT_SCHEDULING` = `true` para reactivar citas por el chat (off por defecto: sin agenda iGEO)
- `OPENWA_ENABLED` = `true` para que el asistente de oficina envíe WhatsApp vía el contenedor OpenWA
- `OPENWA_API_URL` = `http://openwa:2785/api` (hostname interno Coolify del contenedor)
- `OPENWA_API_KEY` / `OPENWA_SESSION_ID` = clave y sesión conectada (QR escaneado)
- `OPENWA_DRY_RUN` = `true` valida el envío sin llamar al contenedor
- Email SMTP (citas + presupuestos + asistente oficina `send_email`): `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` / `EMAIL_USE_TLS` / `DEFAULT_FROM_EMAIL`
- `OPS_EMAIL_DRY_RUN` = `true` valida el correo del asistente sin llamar a SMTP
- `CORS_EXTRA_ORIGINS` = orígenes extra (coma-separados) si el front no es Vercel/`cucarachasbarcelona.cat`
- `DJANGO_ALLOWED_HOSTS` = hosts extra del API (coma-separados); `.sslip.io` de Coolify se acepta por defecto

### Crear usuario administrador en producción
Desde la **Terminal del contenedor** en Coolify:
```bash
python manage.py createsuperuser --email info@cecsaddd.com
python manage.py migrate  # necesario tras nuevos modelos
```

## 🤖 Sistema Agéntico (Bio-Assistent)

El proyecto dispone de un ecosistema de agentes de IA en el backend (`/backend/api/agents/`) que orquestan la atención al cliente de forma autónoma.

### Arquitectura de Agentes

| Agente | Archivo | Rol | Output |
|--------|---------|-----|--------|
| **Recepcionista** | `public/receptionist.py` | Primer contacto, detecta intención y capta ciudad/tipo cliente | `ReceptionistOutput` |
| **Diagnosticador** | `public/diagnostician.py` | Identifica espècie, severitat, dona Bio-Tips de prevenció | `DiagnosisOutput` |
| **Presupuestador** | `public/pricer.py` | Calcula preu basant-se en catàleg oficial, zona i complexitat | `PricingOutput` |
| **Agendador** | `public/scheduler.py` | Consulta slots reals de l'agenda pròpia i crea reserves confirmades | `SchedulerOutput` |
| **Sintetizador** | `public/case_synthesizer.py` | Resumen interno post-diagnóstico (no habla con el cliente) | `CaseSynthesis` |
| **Oficina** | `ops/agent.py` | Chat interno del dashboard (iGEO, CRM, WhatsApp, email) | `OpsAgentOutput` |

### Orquestador (LangGraph + Pydantic-AI)

- **Grafo**: `backend/api/agents/public/graph/` — compilado en `builder.py` (`get_cecsa_graph`).
- **Fachada API**: `public/orchestrator.py` (`CECSAOrchestrator`) invoca el grafo y persiste `AgentState` en sesión Django.
- **Enrutado sin LLM**: `public/graph/routing.py` — función clave `wants_scheduling(msg)`; **no** enrutar a agenda solo por sesión antigua con `APPOINTMENT`.
- **Fusión diagnóstico**: `public/diagnostic_merge.py` — datos del wizard → `AgentState` (ciudad, notas, tipo cliente).
- **Estado unificado**: `AgentState` (`agents/models.py`) es a la vez el estado del grafo LangGraph **y** `deps_type` de todos los agentes Pydantic-AI (`ctx.deps`). No existe clase `AgentDeps` separada; `public/graph/nodes.py` pasa `agent_state` directamente a `agent.run(deps=agent_state)`.
- **Reserva directa**: `public/booking.py` + agenda propia — sin LLM cuando el frontend envía `booking` en el body. Tras éxito, sync opcional `CLIENTE_POTENCIAL` → iGEO PDI (`api/igeo/`). **Temporalmente desactivada** (`ENABLE_CLIENT_SCHEDULING=false`): el chat no muestra horarios ni confirma citas; deriva a **933 309 169**. Reactivar con `AGENT_ENABLE_CLIENT_SCHEDULING=true` y `VITE_ENABLE_CLIENT_SCHEDULING=true`.
- **Nodos**: cada agente Pydantic-AI en su módulo; `scheduler_node` usa **fast path** (slots agenda propia sin LLM) si el mensaje pide cita explícitamente.
- **Optimización** (`config.py`): `AGENT_HISTORY_MAX_TURNS`, `AGENT_ENABLE_CRM`, `AGENT_ENABLE_CLIENT_SCHEDULING`, `AGENT_TIMEOUT_*`.
- Retorna **siempre** un dict con `message`, `slots`, `booking_confirmed`, `booking_uid`.

### API de chat (`POST /api/chat/`)

| Campo | Uso |
|-------|-----|
| `message` | Texto del usuario (puede ir vacío si solo `booking`) |
| `language` | `ca` / `es` (normalizado en backend) |
| `source` | `"home"` en FloatingCTA — evita mostrar slots en saludos sin intención de cita |
| `diagnostic` | Objeto con respuestas del wizard (modal): `who`, `where`, `quantity`, `since`, … |
| `booking` | `{ slot_time, name, phone, address }` — confirma cita presencial en agenda propia |

Respuesta JSON: `{ reply, slots, booking_confirmed, booking_uid }`.

### Frontend: Bio-Assistent Modal (`/frontend/src/components/Agent/AgentHeroModal.jsx`)

- **Estructura Modular**: Separación estricta de lógica y presentación:
    - `useAgentChat.js`: Hook personalizado que gestiona el estado de los mensajes, escritura y llamadas a la API.
    - `DiagnosticFlow.jsx`: Orquestador del flujo interactivo (7–10 pasos según rama, incluyendo recolección de info extra).
    - `buildStaticVerdict.js`: Veredictos preparados sin LLM cuando el textarea final está vacío.
    - `ChatMessage.jsx`: Renderizado de burbujas inteligentes con soporte para veredictos de IA y CTAs integrados.
    - `BookingContactForm.jsx`: Reserva en 3 pasos (nombre → **dirección** → teléfono).
    - `AddressPicker.jsx`: Mapa Leaflet/OSM, búsqueda y entrada manual de dirección.
    - `ChatInput.jsx`: Componente de entrada desacoplado (GPS opcional en chat libre).
- **Flujo de Diagnóstico**: 4 ramas (`particular`, `empresa`, `admin`, `comunidad`) que culminan en un paso final con textarea opcional.
- **Veredicto estático (sin LLM)**: Si el usuario **no rellena** `extra_info`, `getAIDiagnostic()` usa `buildStaticVerdict()` — respuesta instantánea según rama + tier (`urgent` / `moderate` / `info`). Plantillas en `frontend/src/locales/{ca,es}/agent.json` bajo `agent.verdict.static.*`. **No llama a `/api/chat/`**.
- **Veredicto con IA**: Si `extra_info` tiene contenido, se invoca el backend (agente diagnosticador) con el prompt completo del wizard.
- **Scroll**: `ScrollArea.jsx` + `data-lenis-prevent`; `App.jsx` pausa Lenis con el modal abierto.
- **Agendar**: envía `diagnostic` a la API; confirmación con `booking` tras elegir slot.
- **Entrada directa al xat**: Opción "Tinc preguntes / Consultar Agent" en el paso 1.
- **Slots interactius**: Renderitza disponibilitat real de l'agenda pròpia (Django).
- **Restricciones**: No apareix a `/admin` ni `/login`.
- **Responsive Pro**: Optimización específica para móviles con logo escalado y sombras laterales sin recortes.

### Frontend: Home Chat Widget (`/frontend/src/components/FloatingCTA.jsx`)

- **Rol**: Chat persistente accesible desde la home tras cerrar o ignorar el modal inicial.
- **Diseño Premium**: Botón agrandado en color `--accent-green` para máxima visibilidad. Ventana de chat expandida (`550x750px`) en escritorio con tipografía optimizada.
- **Foco en Conversión**: Centralización de toda la ayuda en el agente de IA y el agendamiento de citas, eliminando canales externos (WhatsApp/Teléfono) de la interfaz de chat inicial.
- **Estado**: Gestiona su propio historial de mensajes de forma independiente al modal de diagnóstico.
- **`source: "home"`** en cada petición — evita slots en un «hola» por sesión antigua del modal.
- **Reserva**: mismo flujo nombre → dirección → teléfono; `BookingContactForm` variant `light`.
- **i18n**: `agent.welcome_msg_home`, `agent.home.*`; hints a nivel raíz de `agent` en `agent.json`.


### Agenda propia (sin Cal.com)

- **Fuente de verdad**: modelos Django `AgendaStaff` / `AgendaService` / `AgendaAppointment` / `AgendaTimeBlock` + motor `backend/api/agenda/`.
- **Slots chat**: `fetch_available_slots` → respuesta `{date, time, slot_time}`; confirmación `create_booking_from_slot` (upsert CRM por teléfono).
- **API admin** (contrato agenda-kit): `/api/agenda/schedule/day`, `/appointments`, `/schedule/appointments`, `/schedule/blocks`, …
- **Público**: `GET /api/agenda/slots/`.
- **UI admin**: `agenda-kit` + `CalendarManager.jsx` (`AdminAgendaWorkspace`), estilos CECSA en `index.css` (`[data-agenda-*]`).
- Skill: **`.agents/skills/agenda/SKILL.md`**.

### Geo / mapas (reserva)

- **Leaflet** + OpenStreetMap en `AddressPicker.jsx` (sin Google Maps obligatorio en frontend).
- Proxy Nominatim: `backend/api/views/geo.py`. Skill: **`.agents/skills/geo_maps/SKILL.md`**.

### Admin Dashboard (`/frontend/src/pages/AdminDashboard.jsx`)

- **Orquestador**: `AdminDashboard.jsx` — pestanyes `ops` | `overview` | `leads` | `calendar` | `mail` via `activeTab` + `Sidebar` / `TopBar`.
- **Assistent oficina**: pestanya `ops` (`AdminOpsChat.jsx`) — xat intern (no Bio-Assistent web). Backend: `api/agents/ops/`. Historial `AdminConversation` / notes `AdminMemoryNote`. API auth `/api/ops/conversations/` i `/api/ops/notes/`. Selector de model (`GET /api/ops/models/`). Micròfon (onda → Whisper intern; TTS opcional). WhatsApp via OpenWA (`search_whatsapp_contacts`, `send_whatsapp`, env `OPENWA_*`). Email via SMTP Django (`email_status`, `send_email`, env `EMAIL_*` / `OPS_EMAIL_DRY_RUN`).
- **Leads CRM**: `GET /api/clientes/` via RTK Query (`leadsApi.js` → `baseApi.js`). Requiere **`IsAuthenticated`** + cabecera `Authorization: Token <key>`.
- **Model API `Cliente`**: PK técnica `id`; **clave de negocio** `telefono_norm` (últimos 9 dígitos, `unique`). Campos: `nombre`, `email` (opcional), `telefono`, `documento_fiscal`, `created_at`. Dedup: `api/phone_utils.py` → `normalize_phone()`, `upsert_cliente_by_phone()`. **No** usar `name` / `pest_type` / `status` en UI sin normalizar (`leadDisplay.js`).
- **Cites per lead**: `frontend/src/utils/leadBookings.js` — empareja citas de agenda por teléfono (y email); pàgina `LeadBookingsPage.jsx`; hook `useAgendaBookings` → `/api/agenda/appointments`.
- **Normalització UI**: `frontend/src/utils/leadDisplay.js` — `normalizeLead()`, `formatLeadDate()`. Usar en `DashboardOverview`, `LeadsManager` i `TopBar`.
- **Overview**: `DashboardOverview.jsx` — stats clicables (Leads → `leads`, Cites → `calendar`); taula «Leads Recents» (4 últims); «Veure tots» i chevron naveguen a Leads.
- **Leads**: `LeadsManager.jsx` — llistat complet de contactes (nom, email, telèfon, plaga per defecte «Cucarachas», estat «Nou»).
- **Notificacions**: `TopBar.jsx` — campana amb dropdown de leads recents; enllaç a pestanya Leads.
- **Agenda**: `CalendarManager.jsx` — `agenda-kit` (`AdminAgendaWorkspace`) sobre `/api/agenda/*`.
- El token s'injecta automàticament des de Redux (`auth.token`) a cada petició del dashboard.

## 🔐 Autenticació (Django DRF Token)

- **Login**: `POST /api/auth/login/` amb `{email, password}` → retorna `{token, user}`.
- **Logout**: `POST /api/auth/logout/` amb `Authorization: Token <key>`.
- **Me**: `GET /api/auth/me/` amb `Authorization: Token <key>`.
- El frontend guarda el token a `localStorage` amb la clau `cecsa_token`.
- **Endpoints protegits (admin)**: `/api/clientes/`, `/api/agenda/*` (excepto slots públicos), `/api/ops/*`, `/api/auth/logout/`, `/api/auth/me/`. Sense token → `401`.
- **Endpoints públics**: `/api/chat/`, `/api/agenda/slots/`, `/api/auth/login/`, `/api/species/`.
- **InsForge NO intervé en cap pas del flux d'autenticació.**
- **Formulari de contacte**: `ContactForm.jsx` envia `{ nombre, telefono, email }` a `POST /api/clientes/` (dedup per `telefono_norm`) — **pendent** endpoint públic dedicat sense auth admin (`/api/contact/`).

## 🛠 Skills Actives

En **`.agents/skills/<carpeta>/SKILL.md`** (versionadas en git). Leer la skill antes de tocar esa área.

| Skill | Carpeta |
|-------|---------|
| **Bio-Assistent** (principal) | `bio_assistant/` (+ `reference.md`) |
| **Agenda propia** | `agenda/` |
| **Cal.com** (deprecado) | `cal_com/` |
| **CRM Leads** | `crm_leads/` |
| **Geo / mapas OSM** | `geo_maps/` |
| **Branding Manager** | `branding_manager/` |
| **Service Auditor** | `service_auditor/` |
| **Copywriter Local** | `copywriter_local/` |
| **UI/UX Pro Max** | `ui_ux_pro_max/` |
| **Tailwind Design System** | `tailwind_design_system/` |
| **iGEO PDI** | `igeo_pdi/` |

## 🚀 SEO & Optimización Permanente (MANDATORIO)

- **Activos**: Todos los nombres de imágenes y archivos deben ser descriptivos y usar guiones (ej: `eliminar-cucarachas-barcelona.webp`).
- **Semántica**: Uso estricto de etiquetas HTML5. Un solo `<h1>` por página.
- **URLs**: Slugs limpios y semánticos (ej: `/sobre-nosaltres`).
- **Metadatos**: Cada página nueva debe incluir sus etiquetas de título y meta-descripción en `translation.json`.

## ⚙️ Convenciones de Implementación

- **Inline styles** en componentes de layout (Navbar, Footer, FloatingCTA).
- **i18n**: Usar siempre `t('clave.traduccion')`. En chats (`FloatingCTA`, modal), reaccionar a `i18n.language` para saludos y UI; enviar `language` al backend en cada petición.
- **Aliases**: Usar siempre el alias `@/` para importar. Las rutas relativas están prohibidas.
- **Media**: Usar formato `.webp` para todas las imágenes.
- **Modales Premium**: Estrategia **"Wait before Open"** — verificar `img.complete` antes de abrir.
- **Scroll del Navbar**: Animación progresiva mediante `scrollProgress`.
- **Isotipo**: `/public/assets/isotipo.png`, altura máxima `60px` en Navbar y `40px` en Footer.
- **Mobile Landscape**: Variante `[@media(max-height:600px)_and_(orientation:landscape)]` obligatoria.
- **Admin & Dashboard**: Gestión exclusivamente a través del Dashboard React. El `/admin` de Django es secundario.
- **Agentes**: Nuevo agente → `Output` en `models.py`, nodo + aristas en `graph/`, dict con `message` (+ `slots` si aplica). Preferir **fast path** sin LLM en flujos críticos (slots, confirmación cita).
- **Routing**: tras cambios en `routing.py`, revisar `graph/test_routing.py` (p. ej. `hola` + sesión `APPOINTMENT` → `receptionist`).
- **Diagnóstico modal**: veredictos estáticos en i18n + `buildStaticVerdict.js`; LLM solo si hay `extra_info`.
- **Secrets**: **Nunca** hardcodear API keys en el código. Siempre desde variables de entorno. Usar `os.getenv('KEY')` sin fallback con valor real.
