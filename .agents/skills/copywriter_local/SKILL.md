---
name: copywriter-local
description: >-
  Copy con autoridad para Barcelona/Catalunya. Incluye plantillas del agente modal
  (agent.verdict.static) en catalán y castellano.
---

# Skill: Copywriter Local (Barcelona)

## Propósito

Textos potentes, éticos y con autoridad local. Idioma primario: **catalán** (`ca`); secundario: **castellano** (`es`).

## Tono CECSA

1. **"Ético y Consciente"** — evitar sensacionalismo del miedo.
2. Referencias geográficas naturales (Eixample, Gràcia, Vallès, Maresme).
3. Cumplimiento ROESB (0246-CAT-SB) en textos comerciales cuando aplique.
4. Nicho: **control de cucarachas** (paneroles/cucarachas), no plagas genéricas.

## Vocabulario preferido

- "Control de plagues preventiu" / "Control de plagas preventivo"
- "Restauració de l'equilibri" / "Restauración del equilibrio"
- "Inspecció gratuïta" / "Inspección gratuita"
- "Veredicte" / "Veredicto" (modal agente)

## Veredictos estáticos del modal (`agent.verdict.static`)

Cuando el usuario **no** rellena el textarea final, el copy sale de i18n, no del LLM.

### Estructura de claves

```
agent.verdict.static.{path}.{tier}
```

- **path**: `particular` | `empresa` | `admin` | `comunidad`
- **tier**: `urgent` | `moderate` | `info`

### Placeholders por rama

| path | Variables |
|------|-----------|
| particular | `{{where}}`, `{{qty}}`, `{{since}}`, `{{urgency}}`, `{{sensitive}}` |
| empresa | `{{business}}`, `{{where}}`, `{{risk}}`, `{{level}}`, `{{certificate}}` |
| admin | `{{gestion}}`, `{{where}}`, `{{since}}`, `{{volume}}`, `{{priority}}`, `{{advance}}` |
| comunidad | `{{where}}`, `{{since}}`, `{{role}}`, `{{concern}}`, `{{help}}` |

Los valores se resuelven desde `agent.options.*` y `agent.verdict.qty_*` — no escribir labels a mano en las plantillas.

### Bloque común post-veredicto

Reutilizar siempre (no duplicar en cada tier):

- `agent.verdict.intro`
- `agent.verdict.offer_title` + `agent.verdict.offer_desc`
- `agent.verdict.contact_help`

### Reglas al editar

- **Paridad ca/es obligatoria** para cada clave nueva.
- Usar `**texto**` para énfasis (renderizado en `ChatMessage.jsx`).
- Tono profesional pero cercano; CTA hacia inspección gratuita.
- Si el usuario añade `extra_info`, el LLM genera copy único — las plantillas estáticas no aplican.
