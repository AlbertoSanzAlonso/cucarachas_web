---
name: bio-assistant
description: >-
  Orquestación del Bio-Assistent CECSA: modal de diagnóstico, chat home, LangGraph,
  veredictos estáticos vs IA, Cal.com, reservas con dirección (OSM). Consultar antes
  de tocar frontend/src/components/Agent/ o backend/api/agents/.
---

# Skill: Bio-Assistent (CECSA Control de Plagas)

## Propósito

Mantener coherencia entre el wizard modal, el chat persistente (FloatingCTA), el grafo LangGraph, Cal.com y la captura de **dirección presencial** para inspecciones.

## Mapa de archivos

| Área | Ruta |
|------|------|
| Modal principal | `frontend/src/components/Agent/AgentHeroModal.jsx` |
| Wizard pasos | `frontend/src/components/Agent/Diagnostic/DiagnosticFlow.jsx` |
| Veredictos estáticos | `frontend/src/components/Agent/Diagnostic/buildStaticVerdict.js` |
| Hook chat + API | `frontend/src/components/Agent/hooks/useAgentChat.js` |
| Reserva (formulario) | `frontend/src/components/Agent/Chat/BookingContactForm.jsx` |
| Mapa / dirección | `frontend/src/components/Agent/Chat/AddressPicker.jsx` |
| Burbujas + CTAs | `frontend/src/components/Agent/Chat/ChatMessage.jsx` |
| Chat home | `frontend/src/components/FloatingCTA.jsx` |
| i18n agente | `frontend/src/locales/{ca,es,en}/agent.json` |
| API chat | `backend/api/views/agents.py` → `POST /api/chat/` |
| Confirmación cita | `backend/api/agents/booking.py` |
| Geo (proxy OSM) | `backend/api/views/geo.py` |
| Orquestador | `backend/api/agents/orchestrator.py` |
| Grafo | `backend/api/agents/graph/` |
| Estado / deps | `backend/api/agents/models.py` → `AgentState` (grafo + `ctx.deps`; sin `AgentDeps`) |
| Merge diagnóstico | `backend/api/agents/diagnostic_merge.py` |
| **Ficha Maestra** | `backend/api/models.py` → `FichaServicio`; motor `backend/api/ficha_engine.py` |

## Flujo del wizard modal

### Ramas (path)

| path | Pasos finales | Claves de respuesta relevantes |
|------|---------------|--------------------------------|
| `particular` | 7 | `where`, `quantity`, `since`, `urgency`, `sensitive` |
| `empresa` | 7 | `business_type`, `sanitary_risk`, `where_empresa`, `level`, `certificate` |
| `admin` | 10 | `gestion_tipo`, `where_admin`, … |
| `comunidad` | 10 | `where_comunidad`, `role_comunidad`, … |

El último paso siempre incluye un **textarea opcional** (`extra_info`).

### Veredicto: estático vs IA

**Regla obligatoria**: no invocar el backend si `hasExtraInfo(extra_info)` es `false` → usar `buildStaticVerdict()`.

Plantillas i18n: `agent.verdict.static.{path}.{tier}` en **ca** y **es**.

## Chat y reservas

### Payload `POST /api/chat/`

```json
{
  "message": "",
  "language": "ca",
  "source": "home",
  "diagnostic": { "path": "particular", "where": "..." },
  "booking": {
    "slot_time": "2026-06-01T09:00:00.000Z",
    "name": "Nom",
    "phone": "+34676502975",
    "address": "Carrer Example 1, Barcelona"
  }
}
```

### Flujo UI (3 pasos)

```
Slot elegido → nombre → dirección (AddressPicker) → teléfono → POST booking
```

| Paso | `bookingStep` | Componente |
|------|---------------|------------|
| 1 | `name` | input nombre |
| 2 | `address` | `AddressPicker` (mapa OSM + texto manual + GPS) |
| 3 | `phone` | input tel → `handleBookingSubmit` |

Handlers en `useAgentChat.js`: `handleBookingNameNext`, `handleBookingAddressNext`, `handleBookingSubmit`. Misma lógica duplicada en `FloatingCTA.jsx` (mantener sincronizados).

- `source: "home"` en FloatingCTA evita slots en saludos sin intención de cita.
- CTAs post-veredicto: agendar, presupuesto, llamar (`ChatMessage.jsx`).
- Dirección mínima **5 caracteres** (validación frontend + `booking.py`).

### AddressPicker (sin Google Maps obligatorio)

- **Leaflet** + teselas OpenStreetMap.
- Autocompletar: `GET /api/geo/search/?q=...` (Nominatim vía backend).
- GPS: `GET /api/geo/reverse/?lat=&lng=`.
- Entrada manual siempre editable.
- Ver skill **`geo_maps/`**.

## Backend: enrutado sin LLM

`graph/routing.py` — `wants_scheduling(msg)`; no enrutar a agenda solo por sesión `APPOINTMENT`.

## AgentState como deps unificado

Todos los agentes Pydantic-AI usan `deps_type=AgentState`. En tools y system prompts: `RunContext[AgentState]` y `ctx.deps` (p. ej. `ctx.deps.language`). `graph/nodes.py` pasa `agent_state` a `agent.run(deps=agent_state)`. **No reintroducir `AgentDeps`.**

## Checklist al modificar reservas

- [ ] ¿Nuevo paso? → `BookingContactForm`, `useAgentChat`, `FloatingCTA`, `ChatMessage`, claves `agent.booking.*` en ca/es/en
- [ ] ¿Campo nuevo en booking? → `agents.py`, `booking.py`, `cal_booking.py`
- [ ] ¿Textos? → `ca/agent.json` + `es/agent.json` (+ `en` si aplica)

## Anti-patterns

- Hardcodear veredictos en JSX (usar i18n).
- Llamar al diagnosticador sin `extra_info`.
- Enviar `integration` a Cal.com para visitas presenciales (usar `attendeeAddress`).
- Usar `277401` si producción usa `278962` (`CAL_EVENT_TYPE_ID`).
- Geocoding directo desde el browser a Nominatim (usar proxy `/api/geo/`).
