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

## Configuración obligatoria en Cal.com (visitas presenciales)

CECSA agenda **visitas en el domicilio del cliente**, no videollamadas.

En el panel de Cal.com → event type `277401`:

1. **Ubicación / Location**: activar **«En persona» / «A la ubicación del asistente»** (`attendeeAddress`).
2. **Quitar o desactivar** Cal Video, Google Meet y demás integraciones de vídeo si no se usan.
3. Guardar el event type.

Sin este paso, `POST /bookings` fallará si solo admite `integration` (cal-video).

Variables en Coolify (opcionales):

| Variable | Valor recomendado |
|----------|-------------------|
| `CAL_BOOKING_LOCATION_TYPE` | `attendeeAddress` (default en código) |
| `CAL_BOOKING_INTEGRATION` | vacío (solo si forzas videollamada) |

## Versiones de API (crítico)

| Operación | Header `cal-api-version` | Archivo |
|-----------|-------------------------|---------|
| **GET /slots** | `2024-09-04` (default `CAL_SLOTS_API_VERSION`) | `cal_client.py` |
| **POST /bookings** | `2024-08-13` (default `CAL_BOOKING_API_VERSION`) | `cal_booking.py` |
| **GET /bookings** (admin) | `2024-06-11` en `views/cal.py` | Revisar al actualizar admin |

Si POST bookings devuelve `Cannot POST /v2/bookings` → versión incorrecta (404).

## Crear reserva (`cal_booking.create_cal_booking`)

Payload v2 (visita presencial):

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
    "type": "attendeeAddress",
    "address": "Carrer Example 1, Barcelona"
  },
  "metadata": {
    "notes": "Adreça: ...",
    "address": "Carrer Example 1, Barcelona",
    "source": "CECSA Bio-Assistent"
  }
}
```

- `start` en **UTC** ISO 8601 (`Z`).
- `resolve_booking_location(address=..., phone=...)` en `cal_client.py` prioriza tipos presenciales; solo usa `integration` si el event type no tiene otra opción.
- La dirección viene del diagnóstico (`state.city` / zona) o `Barcelona` por defecto.
- Éxito: `status === "success"` y HTTP 200/201.

## Slots

- `GET {CAL_BASE_URL}/slots?eventTypeId=&start=&end=&timeZone=Europe/Madrid`
- Proxy público: `GET /api/cal/slots/`

## Webhook

Eventos: `BOOKING_CREATED`, `BOOKING_CANCELLED`, … → sincroniza `Cliente` y `Cita` en Django.

## Frontend

- Slots en chat: `ChatMessage.jsx`
- Reserva: nombre → teléfono → `booking` con dirección implícita vía sesión/diagnóstico

## Admin

`CalendarManager.jsx` — listado y cancelación vía `/api/cal/bookings/`.
