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
- `CAL_EVENT_TYPE_ID` = `277401`
- `DJANGO_SECRET_KEY` = clave secreta Django
- `GOOGLE_API_KEY` = clave de Gemini para los agentes

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

### Orquestador (`orchestrator.py`)

- Detecta intención por keywords (ej: "cita", "visita", "agendar" → `Intent.CITA`).
- Enruta a l'agent adequat segons l'estat de la sessió (`AgentState`).
- Retorna **sempre un dict** amb `message`, `slots`, `booking_confirmed`, `booking_uid`.

### Frontend: Bio-Assistent Modal (`/frontend/src/components/Agent/AgentHeroModal.jsx`)

- **Estructura Modular**: Separación estricta de lógica y presentación:
    - `useAgentChat.js`: Hook personalizado que gestiona el estado de los mensajes, escritura y llamadas a la API.
    - `DiagnosticFlow.jsx`: Orquestador del flujo interactivo de 7 pasos (incluyendo recolección de info extra).
    - `ChatMessage.jsx`: Renderizado de burbujas inteligentes con soporte para veredictos de IA y CTAs integrados.
    - `ChatInput.jsx`: Componente de entrada desacoplado.
- **Flujo de Diagnóstico**: Proceso de 7 pasos que culmina en un veredicto generado por IA en tiempo real, enviado al backend con contexto completo del usuario.
- **Scroll Técnico**: Implementado mediante `ScrollArea.jsx` con soporte de `forwardRef` para auto-scroll automático en mensajes nuevos.
- **Entrada directa al xat**: Opción "Tinc preguntes / Consultar Agent" en el paso 1.
- **Slots interactius**: Renderitza disponibilidad real de Cal.com mediante el proxy del backend.
- **Restricciones**: No apareix a `/admin` ni `/login`.
- **Responsive Pro**: Optimización específica para móviles con logo escalado y sombras laterales sin recortes.

### Frontend: Home Chat Widget (`/frontend/src/components/FloatingCTA.jsx`)

- **Rol**: Chat persistente accesible desde la home tras cerrar o ignorar el modal inicial.
- **Diseño Premium**: Botón agrandado en color `--accent-green` para máxima visibilidad. Ventana de chat expandida (`550x750px`) en escritorio con tipografía optimizada.
- **Integración WhatsApp**: Acceso directo desde la cabecera y mención destacada en el saludo inicial.
- **Estado**: Gestiona su propio historial de mensajes de forma independiente al modal de diagnóstico.


### Cal.com Integration

- **Event Type ID**: `277401`
- **API Key**: guardada com `CAL_API_KEY` en les env vars del backend a Coolify. **Mai al codi.**
- **Webhook URL de producció**: `https://api.cucarachasbarcelona.cat/api/webhooks/cal/`
- **Events actius**: `BOOKING_CREATED`, `BOOKING_CANCELLED`, `BOOKING_REJECTED`, `BOOKING_REQUESTED`.
- El webhook sincronitza automàticament `Cita` i `Cliente` a la BD interna.
- Proxy de slots a `/api/cal/slots/` per evitar CORS des del frontend.

### Admin Dashboard (`/frontend/src/components/Admin/CalendarManager.jsx`)

- Secció "Agenda" al Dashboard d'administració.
- Consulta i cancela cites reals de Cal.com via API.

## 🔐 Autenticació (Django DRF Token)

- **Login**: `POST /api/auth/login/` amb `{email, password}` → retorna `{token, user}`.
- **Logout**: `POST /api/auth/logout/` amb `Authorization: Token <key>`.
- **Me**: `GET /api/auth/me/` amb `Authorization: Token <key>`.
- El frontend guarda el token a `localStorage` amb la clau `cecsa_token`.
- **InsForge NO intervé en cap pas del flux d'autenticació.**

## 🛠 Skills Actives

### 1. **Branding Manager** (`.agents/skills/branding_manager`)
Encargado de la coherencia visual. Reglas estrictas sobre colores, tipografía y uso del isotipo.

### 2. **Service Auditor** (`.agents/skills/service_auditor`)
Sincroniza los servicios (especies de cucarachas) presentados en la web con el backend Django.

### 3. **Copywriter Local** (`.agents/skills/copywriter_local`)
Genera contenido con autoridad para la región de Barcelona en **Catalán** y Castellano.

### 4. **UI/UX Pro Max** (`.agents/skills/ui-ux-pro-max`)
Inteligencia de diseño UI/UX. Consultar antes de implementar secciones nuevas.

### 5. **Tailwind Design System** (`.agents/skills/tailwind-design-system`)
Construcción de sistemas de diseño escalables con Tailwind CSS v4.

## 🚀 SEO & Optimización Permanente (MANDATORIO)

- **Activos**: Todos los nombres de imágenes y archivos deben ser descriptivos y usar guiones (ej: `eliminar-cucarachas-barcelona.webp`).
- **Semántica**: Uso estricto de etiquetas HTML5. Un solo `<h1>` por página.
- **URLs**: Slugs limpios y semánticos (ej: `/sobre-nosaltres`).
- **Metadatos**: Cada página nueva debe incluir sus etiquetas de título y meta-descripción en `translation.json`.

## ⚙️ Convenciones de Implementación

- **Inline styles** en componentes de layout (Navbar, Footer, FloatingCTA).
- **i18n**: Usar siempre `t('clave.traduccion')`.
- **Aliases**: Usar siempre el alias `@/` para importar. Las rutas relativas están prohibidas.
- **Media**: Usar formato `.webp` para todas las imágenes.
- **Modales Premium**: Estrategia **"Wait before Open"** — verificar `img.complete` antes de abrir.
- **Scroll del Navbar**: Animación progresiva mediante `scrollProgress`.
- **Isotipo**: `/public/assets/isotipo.png`, altura máxima `60px` en Navbar y `40px` en Footer.
- **Mobile Landscape**: Variante `[@media(max-height:600px)_and_(orientation:landscape)]` obligatoria.
- **Admin & Dashboard**: Gestión exclusivamente a través del Dashboard React. El `/admin` de Django es secundario.
- **Agentes**: Todo agente nuevo necesita: (1) `Output` Pydantic en `models.py`, (2) registro en `orchestrator.py`, (3) retornar siempre un `dict` con al menos `message`.
- **Secrets**: **Nunca** hardcodear API keys en el código. Siempre desde variables de entorno. Usar `os.getenv('KEY')` sin fallback con valor real.
