---
name: cal-com
description: >-
  Integración Cal.com v2 (api.cal.eu): slots, crear/cancelar reservas, webhooks y
  admin CalendarManager. Usar al modificar cal_client.py, cal_booking.py, views/cal.py
  o variables CAL_*.
---

# Cal.com — CECSA

## Instancia y IDs

- **API base**: `https://api.cal.eu/v2` (`CAL_BASE_URL`)
- **Event type**: `277401` (`CAL_EVENT_TYPE_ID`)
- **Webhook producción**: `https://api.cucarachasbarcelona.cat/api/webhooks/cal/`
- **Clave**: `CAL_API_KEY` en Coolify — **nunca en código**

## Versiones de API (crítico)

| Operación | Header `cal-api-version` | Archivo |
|-----------|-------------------------|---------|
| **GET /slots** | `2024-09-04` (default `CAL_SLOTS_API_VERSION`) | `cal_client.py` |
| **POST /bookings** | `2024-08-13` (default `CAL_BOOKING_API_VERSION`) | `cal_booking.py` |
| **GET /bookings** (admin) | `2024-06-11` en `views/cal.py` | Revisar al actualizar admin |

Usar `get_cal_headers()` para slots y `get_cal_booking_headers()` para crear reservas.

Si POST bookings devuelve `Cannot POST /v2/bookings` → versión incorrecta (404).

## Crear reserva (`cal_booking.create_cal_booking`)

Payload v2 (2024-08-13):

```json
{
  "eventTypeId": 277401,
  "start": "2026-06-01T09:00:00Z",
  "attendee": {
    "name": "...",
    "email": "cita+...@cucarachasbarcelona.cat",
    "phoneNumber": "+34...",
    "timeZone": "Europe/Madrid",
    "language": "ca"
  },
  "location": {
    "type": "integration",
    "integration": "google-meet"
  },
  "metadata": { "notes": "...", "source": "CECSA Bio-Assistent" }
}
```

- `start` en **UTC** ISO 8601 (`Z`).
- **Location**: el event type `277401` solo admite `type: "integration"` (no `attendeeAddress`). Usar `resolve_booking_location()` en `cal_client.py` (auto-detecta desde GET event-type o env `CAL_BOOKING_INTEGRATION`).
- La dirección física de la visita va en `metadata.address` y `metadata.notes`.
- Éxito: `status === "success"` y HTTP 200/201.

## Slots

- `GET {CAL_BASE_URL}/slots?eventTypeId=&start=&end=&timeZone=Europe/Madrid`
- Normalización en `parse_slots_response` → `[{ date, time, slot_time }]`
- Proxy público: `GET /api/cal/slots/`

## Webhook

Eventos: `BOOKING_CREATED`, `BOOKING_CANCELLED`, `BOOKING_REJECTED`, `BOOKING_REQUESTED` → sincroniza `Cliente` y `Cita` en Django (`views/cal.py` `cal_webhook`).

## Frontend

- Slots en chat: botones desde `msg.slots` en `ChatMessage.jsx`
- No incrustar Cal embed para el flujo principal de conversión (opcional `CalEmbed` en modal legacy)

## Admin

`CalendarManager.jsx` — listado y cancelación vía `/api/cal/bookings/`.
