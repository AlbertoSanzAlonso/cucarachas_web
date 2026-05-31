---
name: bio-assistant
description: >-
  Orquestación del Bio-Assistent CECSA: modal de diagnóstico, chat home, LangGraph,
  veredictos estáticos vs IA, Cal.com y reservas. Consultar antes de tocar
  frontend/src/components/Agent/ o backend/api/agents/.
---

# Skill: Bio-Assistent (CECSA Control de Plagas)

## Propósito

Mantener coherencia entre el wizard modal, el chat persistente (FloatingCTA), el grafo LangGraph y la integración Cal.com.

## Mapa de archivos

| Área | Ruta |
|------|------|
| Modal principal | `frontend/src/components/Agent/AgentHeroModal.jsx` |
| Wizard pasos | `frontend/src/components/Agent/Diagnostic/DiagnosticFlow.jsx` |
| Veredictos estáticos | `frontend/src/components/Agent/Diagnostic/buildStaticVerdict.js` |
| Hook chat + API | `frontend/src/components/Agent/hooks/useAgentChat.js` |
| Burbujas + CTAs | `frontend/src/components/Agent/Chat/ChatMessage.jsx` |
| Chat home | `frontend/src/components/FloatingCTA.jsx` |
| i18n agente | `frontend/src/locales/{ca,es,en}/agent.json` |
| API chat | `backend/api/views/agents.py` → `POST /api/chat/` |
| Orquestador | `backend/api/agents/orchestrator.py` |
| Grafo | `backend/api/agents/graph/` |
| Merge diagnóstico | `backend/api/agents/diagnostic_merge.py` |

## Flujo del wizard modal

### Ramas (path)

| path | Pasos finales | Claves de respuesta relevantes |
|------|---------------|--------------------------------|
| `particular` | 7 | `where`, `quantity`, `since`, `urgency`, `sensitive` |
| `empresa` | 7 | `business_type`, `sanitary_risk`, `where_empresa`, `level`, `certificate` |
| `admin` | 10 | `gestion_tipo`, `where_admin`, `since_admin`, `volume_admin`, `escalate_admin`, `prev_admin`, `priority_admin`, `advance_admin` |
| `comunidad` | 10 | `where_comunidad`, `since_comunidad`, `role_comunidad`, `has_admin`, `which_admin`, `help_community`, `contact_who`, `what_if_not` |

El último paso siempre incluye un **textarea opcional** (`extra_info`).

### Veredicto: estático vs IA

```
Usuario pulsa "Dona'm el diagnòstic"
        │
        ▼
  ¿extra_info vacío?
   /              \
 Sí                No
  │                 │
  ▼                 ▼
buildStaticVerdict   POST /api/chat/
(sin LLM, ~400ms)    (agente diagnosticador)
```

**Regla obligatoria**: no invocar el backend si `hasExtraInfo(extra_info)` es `false`.

Valores considerados vacíos: `''`, `'-'`, `'cap'`, `'ninguna'`, `'no especificat'`, `'no especificado'`.

### Tiers de severidad (buildStaticVerdict.js)

| path | urgent | moderate | info |
|------|--------|----------|------|
| particular | `yes_urgent` o `many`/`nests` | `this_week` o `several` | resto |
| empresa | `sanitary_risk=urgent` o `level=grave/closure` | `soon` o `frequent` | resto |
| admin | `priority=alta/prioritaria_urgente`, `volume=constante`, `escalate=prioritario_evitar` | `media`, `bastantes_incidencias` | resto |
| comunidad | `what_if_not=extendera/problema_serio`, `where=varias_viviendas/todo_edificio` | `puede_molestar`, `zonas_comunes` | resto |

Plantillas i18n: `agent.verdict.static.{path}.{tier}` en **ca** y **es** (paridad obligatoria).

## Chat y reservas

- Cada petición envía `{ message, language, diagnostic?, booking?, source? }`.
- `source: "home"` en FloatingCTA evita arrastrar intención de cita previa.
- Reserva: flujo nombre → teléfono → `booking: { slot_time, name, phone }`.
- CTAs post-veredicto: agendar, presupuesto, llamar (`ChatMessage.jsx`).

## Backend: enrutado sin LLM

`graph/routing.py` decide nodo por keywords (`wants_scheduling`, `should_diagnose`, etc.). No añadir LLM al enrutado.

## Checklist al modificar el diagnóstico

- [ ] ¿Cambias textos? → Actualizar `ca/agent.json` **y** `es/agent.json`
- [ ] ¿Nueva rama o tier? → `buildStaticVerdict.js` + plantillas i18n
- [ ] ¿Nuevo paso wizard? → `DiagnosticFlow.jsx` + `AgentHeroModal.jsx` (maxSteps, branching)
- [ ] ¿Solo con extra_info debe ir al LLM? → Verificar `getAIDiagnostic()` en `useAgentChat.js`
- [ ] ¿Persistencia sesión? → `merge_diagnostic_into_state()` si añades claves al payload

## Anti-patterns

- Hardcodear veredictos en JSX o en el hook (usar i18n).
- Llamar siempre al diagnosticador al finalizar el wizard.
- Duplicar lógica de tier en backend y frontend (tier solo en frontend para estáticos).
- Hardcodear `CAL_API_KEY` o URLs de producción en código.
