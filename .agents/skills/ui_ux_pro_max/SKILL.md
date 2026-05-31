---
name: ui-ux-pro-max
description: >-
  UI/UX del sitio CECSA: conversión, modales premium, chat, responsive y accesibilidad.
  Consultar antes de cambios en Agent/ o FloatingCTA.
---

# UI/UX Pro Max — CECSA

## Prioridades de conversión

1. Modal diagnóstico → veredicto → CTA agendar / presupuesto / llamada
2. FloatingCTA persistente en home (chat sin formulario previo)
3. Admin Dashboard para operación (no Django admin como UX principal)

## Veredicto modal

- **Sin extra_info**: respuesta estática ~400ms (sin spinner largo de red)
- **Con extra_info**: typing indicator mientras el LLM responde
- CTAs post-veredicto: agendar, presupuesto, llamar (`ChatMessage.jsx`)

## Patrones obligatorios

- **Modal premium**: "Wait before Open" — `img.complete` antes de abrir animación
- **Mobile landscape**: `[@media(max-height:600px)_and_(orientation:landscape)]` en componentes críticos
- **Un scroll** por panel de chat (`min-h-0` + contenedor flex); ver skill `bio_assistant`
- **Lenis**: pausar con modal agente abierto (`App.jsx`); `data-lenis-prevent` en modal y `ScrollArea`

## Chat UX

- Slots: grid 2 columnas, fecha + hora legibles
- Reserva: flujo **nombre → teléfono → confirmar** (`BookingContactForm.jsx`)
- Estados de carga: indicador "escribiendo" / `isTyping`
- Errores: mensaje amable + teléfono 933 309 169 como fallback

## FloatingCTA vs Modal

| | Modal (`AgentHeroModal`) | Home (`FloatingCTA`) |
|--|--------------------------|----------------------|
| Contexto | Wizard + `diagnostic` | Sin formulario |
| API | `diagnostic` + prefijo zona | `source: "home"` |
| Estilo | Oscuro sobre azul | Claro (variant `light` en booking) |

No asumir que el usuario del home completó el diagnóstico.

## Modal agente

- Fullscreen overlay, gradiente `--primary-blue` → `#004d70`
- Wizard: grid 2 cols desktop, botones `diagnostic-btn`
- Paso final: textarea opcional + CTA `--accent-green`
