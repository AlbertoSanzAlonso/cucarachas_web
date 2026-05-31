---
name: crm-leads
description: >-
  Modelo Cliente (leads CRM), deduplicación por teléfono, serializer y emparejado
  con reservas Cal.com. Usar al tocar models Cliente, phone_utils, serializers CRM
  o leadBookings.js.
---

# CRM Leads — CECSA

## Modelo `Cliente` (`backend/api/models.py`)

| Campo | Uso |
|-------|-----|
| `id` | PK técnica (FK en `Ubicacion`, `Cita`, …) |
| `telefono_norm` | **Clave de negocio** — últimos 9 dígitos, `unique=True` |
| `telefono` | Valor mostrado (formato libre: `+34 …`) |
| `email` | Opcional (`blank=True`) |
| `documento_fiscal` | Único; auto `WEB-{telefono_norm}` o `CAL-{uid}` si no se envía |
| `nombre`, `created_at` | — |

## Utilidades (`backend/api/phone_utils.py`)

```python
normalize_phone("+34 612 34 56 78")  # → "612345678"
upsert_cliente_by_phone(telefono=..., nombre=..., email=...)
```

- Mismo teléfono con distinto formato → **un solo** registro
- Actualiza `nombre`, `telefono`, `email` si el lead ya existe

## API

- `GET/POST/PATCH/DELETE /api/clientes/` — auth Token (`ClienteViewSet`)
- **Serializer**: acepta alias `name` / `phone` en escritura; expone `telefono_norm` read-only
- **POST**: exige teléfono válido; dedup automático (no crear duplicados)

## Migración

`0003_cliente_telefono_norm` — rellena `telefono_norm` desde datos existentes; sin teléfono → `legacy-{id}`.

Tras desplegar en Coolify: `python manage.py migrate`.

## Cal.com y frontend

- Webhook: `views/cal.py` → `upsert_cliente_by_phone` (fallback email sin teléfono)
- Emparejar citas: `frontend/src/utils/leadBookings.js` — teléfono, email sintético `cita+…@cucarachasbarcelona.cat`
- UI admin: `leadDisplay.js` → `normalizeLead()`; no usar `lead.id` como identidad de negocio

## Tests

`backend/api/test_phone_utils.py` — normalización y dedup.
