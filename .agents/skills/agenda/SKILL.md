---
name: agenda
description: >-
  Agenda propia CECSA (sustituye Cal.com): modelos Django, motor de slots,
  API /api/agenda/*, UI admin con agenda-kit. Consultar antes de tocar
  backend/api/agenda/, views/agenda.py o CalendarManager.
---

# Skill: Agenda propia

## Fuente de verdad

Postgres vía Django (`AgendaStaff`, `AgendaService`, `AgendaAppointment`, `AgendaTimeBlock`, horarios).

Motor: `backend/api/agenda/engine.py`.

## Chat

- Slots: `fetch_available_slots` (mismo shape `{date, time, slot_time}`).
- Reserva: `create_booking_from_slot` + `upsert_cliente_by_phone`.
- Usado desde `agents/public/booking.py`, `scheduler.py`, `public/graph/nodes.py`.

## Admin UI

- Paquete `agenda-kit/` (headless) enlazado en frontend.
- `CalendarManager.jsx` → `AdminAgendaWorkspace` + `createHttpAgendaDataSource({ baseUrl: …/api/agenda })`.
- Auth: DRF Token (fetch convierte Bearer → Token).

## Endpoints clave

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/agenda/slots/` | público |
| GET | `/api/agenda/schedule/day` | Token |
| GET | `/api/agenda/appointments` | Token |
| POST | `/api/agenda/schedule/appointments` | Token |
| PATCH | `/api/agenda/appointments/:id/cancel` | Token |

## Seed

Migración `0009_agenda_propia`: staff `cecsa-tecnico-1`, service `primera-revisio` (60 min), Lun–Vie 09–14 / 15–18.
