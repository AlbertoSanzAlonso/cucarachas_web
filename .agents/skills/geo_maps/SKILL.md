---
name: geo-maps
description: >-
  Geocoding para reservas presenciales: proxy Nominatim en Django, Leaflet/OSM
  en AddressPicker. Usar al modificar views/geo.py, AddressPicker o flujo booking.
---

# Geo / mapas — CECSA

## Principio

**Nunca** llamar a Nominatim desde el navegador (CORS + política de uso). Todo pasa por el backend.

## Backend (`backend/api/views/geo.py`)

| Endpoint | Query | Respuesta |
|----------|-------|-----------|
| `GET /api/geo/search/` | `q` (mín. 3 chars) | `{ results: [{ label, lat, lng }] }` |
| `GET /api/geo/reverse/` | `lat`, `lng` | `{ label, lat, lng }` |

- Proxy: `nominatim.openstreetmap.org`
- `User-Agent`: `CECSA-CucarachasBarcelona/1.0 (info@cucarachasbarcelona.cat)`
- Búsqueda prioriza Catalunya (`countrycodes=es`, viewbox Barcelona)
- Público (`AllowAny`) — sin token

## Frontend (`AddressPicker.jsx`)

- **Leaflet** + teselas OpenStreetMap
- Autocompletar: debounce → `GET {VITE_API_URL}/api/geo/search/?q=`
- GPS: `navigator.geolocation` → `GET /api/geo/reverse/?lat=&lng=`
- Campo de texto siempre editable (entrada manual)
- Props: `value`, `onChange`, `variant` (`dark` | `light`)
- `data-lenis-prevent` en contenedor del mapa

## Integración reserva

Flujo en `BookingContactForm`: nombre → **dirección** (`AddressPicker`) → teléfono.

- Mínimo **5 caracteres** en dirección (frontend + `booking.py`)
- Payload: `booking.address` en `POST /api/chat/`
- Cal.com: `location.type: attendeeAddress` — ver skill `cal_com/`

## Anti-patterns

- Google Maps JS en frontend solo para este flujo (usar proxy OSM)
- Hardcodear `GOOGLE_API_KEY` en cliente
- Omitir `address` en booking presencial
