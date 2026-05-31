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
- `CAL_API_KEY` = key de Cal.com (nunca hardcodear en código)
- `CAL_EVENT_TYPE_ID` = `278962` (primerarevision / primeracita)
- `CAL_SLOTS_API_VERSION` = `2024-09-04` (GET slots; opcional, default en código)
- `CAL_BOOKING_API_VERSION` = `2024-08-13` (**obligatorio** para POST crear reservas)
- `CAL_BOOKING_LOCATION_TYPE` = `attendeeAddress` (default; visitas presenciales)
- `CAL_BOOKING_INTEGRATION` = vacío salvo que se fuerce videollamada explícitamente
- `CAL_BASE_URL` = `https://api.cal.eu/v2` (instancia EU)
- `DJANGO_SECRET_KEY` = clave secreta Django
- `OPENAI_API_KEY` = clave de OpenAI (principal para los agentes)
- `GOOGLE_API_KEY` = clave de Google (usada para Geocoding y fallback de agentes)

### Crear usuario administrador en producción
Desde la **Terminal del contenedor** en Coolify:
```bash
python manage.py createsuperuser --email info@cucarachasbarcelona.cat
python manage.py migrate  # necesario tras nuevos modelos
```

## 🤖 Sistema Agéntico (Bio-Assistent)

El proyecto dispone de un ecosistema de agentes de IA en el backend (`/backend/api/agents/`) que orquestan la atención al cliente de forma autónoma.

### Arquitectura de Agentes

| Agente | Archivo | Rol | Output |
|--------|---------|-----|--------|
| **Recepcionista** | `receptionist.py` | Primer contacto, detecta intención y capta ciudad/tipo cliente | `ReceptionistOutput` |
| **Diagnosticador** | `diagnostician.py` | Identifica espècie, severitat, dona Bio-Tips de prevenció | `DiagnosisOutput` |
| **Presupuestador** | `pricer.py` | Calcula preu basant-se en catàleg oficial, zona i complexitat | `PricingOutput` |
| **Agendador** | `scheduler.py` | Consulta slots reals a Cal.com i crea reserves confirmades | `SchedulerOutput` |

### Orquestador (LangGraph + Pydantic-AI)

- **Grafo**: `backend/api/agents/graph/` — compilado en `builder.py` (`get_cecsa_graph`).
- **Fachada API**: `orchestrator.py` (`CECSAOrchestrator`) invoca el grafo y persiste `AgentState` en sesión Django.
- **Enrutado sin LLM**: `graph/routing.py` — función clave `wants_scheduling(msg)`; **no** enrutar a agenda solo por sesión antigua con `APPOINTMENT`.
- **Fusión diagnóstico**: `diagnostic_merge.py` — datos del wizard → `AgentState` (ciudad, notas, tipo cliente).
- **Estado unificado**: `AgentState` (`agents/models.py`) es a la vez el estado del grafo LangGraph **y** `deps_type` de todos los agentes Pydantic-AI (`ctx.deps`). No existe clase `AgentDeps` separada; `graph/nodes.py` pasa `agent_state` directamente a `agent.run(deps=agent_state)`.
- **Reserva directa**: `booking.py` + `cal_booking.py` — sin LLM cuando el frontend envía `booking` en el body.
- **Nodos**: cada agente Pydantic-AI en su módulo; `scheduler_node` usa **fast path** (slots Cal.com sin LLM) si el mensaje pide cita explícitamente.
- **Optimización** (`config.py`): `AGENT_HISTORY_MAX_TURNS`, `AGENT_ENABLE_CRM`, `AGENT_TIMEOUT_*`.
- Retorna **siempre** un dict con `message`, `slots`, `booking_confirmed`, `booking_uid`.

### API de chat (`POST /api/chat/`)

| Campo | Uso |
|-------|-----|
| `message` | Texto del usuario (puede ir vacío si solo `booking`) |
| `language` | `ca` / `es` (normalizado en backend) |
| `source` | `"home"` en FloatingCTA — evita mostrar slots en saludos sin intención de cita |
| `diagnostic` | Objeto con respuestas del wizard (modal): `who`, `where`, `quantity`, `since`, … |
| `booking` | `{ slot_time, name, phone, address }` — confirma cita presencial en Cal.com (`attendeeAddress`) |

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
- **Slots interactius**: Renderitza disponibilidad real de Cal.com mediante el proxy del backend.
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


### Cal.com Integration

- **Event Type ID**: `278962` — **API Key** solo en env (`CAL_API_KEY`).
- **Slots**: `GET /v2/slots` con `cal-api-version: 2024-09-04` → `cal_client.fetch_available_slots`.
- **Crear reserva**: `POST /v2/bookings` con `cal-api-version: 2024-08-13` → visita **presencial** (`location.type: attendeeAddress` + adreça del client). El event type `278962` a Cal.com ha de tenir ubicació «Presencial / adreça de l'assistent» (no només videotrucada). `CAL_BOOKING_LOCATION_TYPE=attendeeAddress` (per defecte).
- **Webhook**: `https://api.cucarachasbarcelona.cat/api/webhooks/cal/` — sincroniza `Cita` / `Cliente`.
- **Proxy**: `/api/cal/slots/` (público); admin: `/api/cal/bookings/`.
- Ver skill **`.agents/skills/cal_com/SKILL.md`** para errores típicos (`Cannot POST /v2/bookings` = versión incorrecta).

### Admin Dashboard (`/frontend/src/pages/AdminDashboard.jsx`)

- **Leads CRM**: `GET /api/clientes/` via RTK Query (`leadsApi.js` → `baseApi.js`). Requiere **`IsAuthenticated`** + cabecera `Authorization: Token <key>`.
- **Agenda**: `CalendarManager.jsx` — consulta i cancel·la cites Cal.com via `/api/cal/bookings/` (també autenticat).
- El token s'injecta automàticament des de Redux (`auth.token`) a cada petició del dashboard.

## 🔐 Autenticació (Django DRF Token)

- **Login**: `POST /api/auth/login/` amb `{email, password}` → retorna `{token, user}`.
- **Logout**: `POST /api/auth/logout/` amb `Authorization: Token <key>`.
- **Me**: `GET /api/auth/me/` amb `Authorization: Token <key>`.
- El frontend guarda el token a `localStorage` amb la clau `cecsa_token`.
- **Endpoints protegits (admin)**: `/api/clientes/`, `/api/cal/bookings/`, `/api/auth/logout/`, `/api/auth/me/`. Sense token → `401`.
- **Endpoints públics**: `/api/chat/`, `/api/cal/slots/`, `/api/auth/login/`, `/api/species/`.
- **InsForge NO intervé en cap pas del flux d'autenticació.**
- **Formulari de contacte**: `ContactForm.jsx` encara fa `POST` a `/api/clientes/` sense auth — **pendent** migrar a un endpoint públic dedicat (p. ex. `/api/contact/`).

## 🛠 Skills Actives

En **`.agents/skills/<carpeta>/SKILL.md`** (versionadas en git). Leer la skill antes de tocar esa área.

| Skill | Carpeta |
|-------|---------|
| **Bio-Assistent** (principal) | `bio_assistant/` (+ `reference.md`) |
| **Cal.com** | `cal_com/` |
| **Geo / mapas OSM** | `geo_maps/` |
| **Branding Manager** | `branding_manager/` |
| **Service Auditor** | `service_auditor/` |
| **Copywriter Local** | `copywriter_local/` |
| **UI/UX Pro Max** | `ui_ux_pro_max/` |
| **Tailwind Design System** | `tailwind_design_system/` |

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
