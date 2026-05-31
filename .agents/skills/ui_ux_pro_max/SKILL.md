---
name: ui-ux-pro-max
description: >-
  UI/UX del sitio CECSA: conversión, modales premium, chat, reserva con mapa,
  admin agenda. Consultar antes de cambios en Agent/ o FloatingCTA.
---

# UI/UX Pro Max — CECSA

## Prioridades de conversión

1. Modal diagnóstico → veredicto → CTA agendar / presupuesto / llamada
2. FloatingCTA persistente en home
3. Admin Dashboard → Leads CRM + Agenda (Cal.com en tiempo real)

## Veredicto modal

- **Sin extra_info**: respuesta estática ~400ms
- **Con extra_info**: typing indicator + LLM
- CTAs post-veredicto en `ChatMessage.jsx`

## Patrones obligatorios

- **Modal premium**: "Wait before Open" — `img.complete`
- **Mobile landscape**: `[@media(max-height:600px)_and_(orientation:landscape)]`
- **Un scroll** por panel (`min-h-0` + flex); `data-lenis-prevent` en mapa y chat
- **Lenis**: pausar con modal abierto (`App.jsx`)

## Chat UX — reserva

Flujo **3 pasos** en `BookingContactForm.jsx`:

1. Nombre  
2. **Dirección** (`AddressPicker`: mapa OSM, búsqueda, GPS, texto manual)  
3. Teléfono → confirmar  

- Slots: grid 2 columnas
- Mínimo dirección: 5 caracteres
- Confirmación: mensaje «visita presencial» + dirección
- Errores: tono amable + 933 309 169

## Admin Dashboard

### Leads CRM (`LeadsManager.jsx` + `DashboardOverview.jsx`)

- **API**: `GET /api/clientes/` — campos Django: `id`, `nombre`, `email`, `telefono`, `telefono_norm` (solo lectura), `documento_fiscal`, `created_at`
- **Identidad del lead**: `telefono_norm` (últimos 9 dígitos, único). `POST`/`PATCH` vía `ClienteSerializer` deduplican con `upsert_cliente_by_phone` (`backend/api/phone_utils.py`). Teléfono obligatorio en alta.
- **Normalizar UI** con `@/utils/leadDisplay` (`normalizeLead`, `formatLeadDate`) — no asumir `name` / `status` del frontend antiguo
- **Cites del lead**: `LeadBookingsPage` + `leadBookings.js` (`bookingMatchesLead` por teléfono / email sintético Cal.com)
- Overview: 4 leads recientes + stat «Leads Pendents» clicable → pestaña `leads`
- `TopBar`: campana con dropdown de leads recientes → navega a `leads`
- Plaga por defecto «Cucarachas»; estado por defecto «Nou» (modelo `Cliente` aún sin `status`/`plaga`)
- **Contacto web**: `ContactForm.jsx` → `{ nombre, telefono, email }` (no enviar `name`/`phone` sueltos al API)

### Admin Agenda (`CalendarManager.jsx`)

- Lista cards con fecha, cliente, estado, dirección si existe
- Título card: `Primera revisió amb {attendee.name}` (fallback «Visita tècnica»)
- Refresh manual
- Cancelar por `booking.uid`
- Enlace externo `app.cal.eu/bookings/{uid}`
- Estado vacío vs error de API distinguibles

## FloatingCTA vs Modal

| | Modal | Home |
|--|-------|------|
| Estilo booking | `variant="dark"` | `variant="light"` |
| API | `diagnostic` + booking | `source: "home"` |
| Mapa | Mismo `AddressPicker` | Mismo componente |

## Modal agente

- Gradiente `--primary-blue` → `#004d70`
- Wizard 2 cols desktop
- CTA final `--accent-green`
