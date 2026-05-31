---
name: cal-com
description: >-
  Integración Cal.com v2 (api.cal.eu): slots, reservas presenciales, listado admin,
  webhooks. Usar al modificar cal_client.py, cal_booking.py, views/cal.py o CAL_*.
---

# Cal.com — CECSA

## Instancia y IDs

- **API base**: `https://api.cal.eu/v2` (`CAL_BASE_URL`)
- **Event type**: **`278962`** (`CAL_EVENT_TYPE_ID`) — slug `primeracita`, título `primerarevision`
- **Webhook**: `https://api.cucarachasbarcelona.cat/api/webhooks/cal/`
- **Clave**: `CAL_API_KEY` en Coolify — **nunca en código**

## Configuración en Cal.com (obligatorio)

CECSA = **visita presencial** en domicilio del cliente.

1. Event type `278962` → Location: **In Person (Attendee Address)** / «Dirección de inspección».
2. Sin videollamada como única opción (Cal Video / Meet desactivados si no se usan).
3. ID en URL al editar: `.../event-types/278962?tabName=setup`

## Variables Coolify

| Variable | Valor |
|----------|--------|
| `CAL_EVENT_TYPE_ID` | `278962` |
| `CAL_BOOKING_LOCATION_TYPE` | `attendeeAddress` (default en código) |
| `CAL_BOOKING_INTEGRATION` | vacío (solo si forzas vídeo explícitamente) |
| `CAL_BOOKING_API_VERSION` | `2024-08-13` |
| `CAL_SLOTS_API_VERSION` | `2024-09-04` |

## Versiones API

| Operación | `cal-api-version` | Código |
|-----------|-------------------|--------|
| GET /slots | `2024-09-04` | `cal_client.fetch_available_slots` |
| POST /bookings | `2024-08-13` | `cal_booking.create_cal_booking` |
| GET /bookings (admin) | `2024-08-13` | `cal_client.fetch_cal_bookings` |

## Crear reserva

```json
{
  "eventTypeId": 278962,
  "start": "2026-06-01T09:00:00Z",
  "attendee": {
    "name": "...",
    "email": "cita+...@cucarachasbarcelona.cat",
    "phoneNumber": "+34...",
    "timeZone": "Europe/Madrid",
    "language": "ca"
  },
  "location": {
    "type": "attendeeAddress",
    "address": "Carrer Example 1, 08001 Barcelona"
  },
  "metadata": {
    "notes": "Adreça inspecció: ...",
    "address": "...",
    "source": "CECSA Bio-Assistent"
  }
}
```

- `resolve_booking_location(address=..., phone=...)` en `cal_client.py`: **siempre `attendeeAddress`** salvo `CAL_BOOKING_LOCATION_TYPE=integration`.
- No usar `google-meet` / `cal-video` si el event type solo admite `attendeeAddress`.
- Caché de locations ligada a `CAL_EVENT_TYPE_ID` (evita datos del event type antiguo).

Entrada desde chat: `booking.address` en `POST /api/chat/` → `confirm_booking_from_chat()`.

## Listado admin

- `fetch_cal_bookings(eventTypeId=278962, take=100)` → array normalizado con `startTime`, `uid`, `attendees`.
- Proxy: `GET /api/cal/bookings/` (Token auth).
- Frontend espera `data.data.bookings`.
- Cancelar: `POST /api/cal/bookings/{uid}/cancel/`

## Errores típicos

| Error | Fix |
|-------|-----|
| `Cannot POST /v2/bookings` | Header `2024-08-13` |
| `integration not valid` … `attendeeAddress` | Redeploy + `attendeeAddress` en location |
| `google-meet not valid` | No auto-detectar Meet; forzar presencial |
| Admin «Sense cites» | API version + parseo `data[]` |
| Slots de otro evento | `CAL_EVENT_TYPE_ID=278962` |

## Webhook

`BOOKING_CREATED` → crea/actualiza `Cliente` (email sintético `cita+...@`). El panel admin lee **Cal.com API**, no solo Django `Cita`.

## Frontend

- Slots: `ChatMessage.jsx`
- Reserva: `BookingContactForm` → nombre → dirección → teléfono
- Admin: `CalendarManager.jsx`
