---
name: geo-maps
description: >-
  Mapa y geocoding para reservas CECSA: Leaflet + OpenStreetMap + proxy Nominatim.
  Usar al modificar AddressPicker.jsx, views/geo.py o endpoints /api/geo/.
---

# Geo / Mapas — CECSA (autoalojado OSM)

## Enfoque

No se requiere **Google Maps API** en el frontend para el flujo de reserva.

| Capa | Tecnología |
|------|------------|
| Mapa interactivo | **Leaflet** + teselas OSM |
| Búsqueda de direcciones | **Nominatim** vía proxy Django |
| Entrada manual | Siempre disponible en `AddressPicker` |
| GPS | `navigator.geolocation` + reverse proxy |

Dependencia npm: `leaflet` (CSS importado en `AddressPicker.jsx`).

## Archivos

| Archivo | Rol |
|---------|-----|
| `frontend/src/components/Agent/Chat/AddressPicker.jsx` | UI mapa + búsqueda + GPS |
| `backend/api/views/geo.py` | Proxy Nominatim |
| `backend/api/urls.py` | Rutas `/api/geo/search/`, `/api/geo/reverse/` |

## API backend

### `GET /api/geo/search/?q=carrer+example`

- Mínimo 3 caracteres.
- `countrycodes=es`, viewbox Barcelona metropolitana.
- Respuesta: `{ results: [{ label, lat, lng }, ...] }`
- User-Agent: `CECSA-CucarachasBarcelona/1.0 (info@cucarachasbarcelona.cat)`

### `GET /api/geo/reverse/?lat=41.39&lng=2.17`

- Respuesta: `{ label, lat, lng }`

Permisos: `AllowAny` (público para el chat de reserva).

## Uso en reserva

`BookingContactForm` paso `address`:

```javascript
onChange({ address, lat, lng })
```

Se envía al confirmar:

```javascript
booking: { slot_time, name, phone, address }
```

`lat`/`lng` opcionales (futuro: metadata Cal.com).

## i18n

Claves en `agent.booking.*`: `address_placeholder`, `address_hint`, `use_gps`, `ask_address`.

Geolocalización: `agent.geolocation_not_supported`, `geolocation_denied`, `geolocation_error`.

## UX

- Mapa ~140px alto, `data-lenis-prevent` para no bloquear scroll del chat.
- Debounce búsqueda ~450 ms.
- Marcador arrastrable → reverse geocode.
- Variantes `light` (FloatingCTA) y `dark` (modal).

## Límites Nominatim

- Uso moderado (política OSM); el proxy centraliza peticiones.
- No llamar a `nominatim.openstreetmap.org` directamente desde el browser en producción.

## Anti-patterns

- Exponer `VITE_GOOGLE_MAPS_API_KEY` como requisito del flujo de reserva.
- Omitir validación de longitud mínima de dirección antes de POST booking.
- Añadir otro proveedor de mapas sin pasar por el proxy (CORS + rate limits).
