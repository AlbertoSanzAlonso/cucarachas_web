---
name: tailwind-design-system
description: >-
  Tailwind CSS v4 y tokens CECSA. Layout con utilidades; colores críticos en CSS
  variables e inline styles en Navbar/Footer/FloatingCTA.
---

# Tailwind Design System — CECSA

## Configuración

- Tailwind v4 en `frontend/src/index.css`
- Colores de marca como variables CSS para inline styles de layout

## Convenciones

| Contexto | Tailwind | Inline + CSS vars |
|----------|----------|-------------------|
| Navbar, Footer, FloatingCTA | Solo layout | Colores, padding, fondos |
| Agent modal / chat | Layout + decoración | Gradientes críticos en style |
| Páginas y admin | Utilidades amplias | Preferir tokens si existen |

- Alias imports: `@/` (prohibidas rutas relativas)
- No hex arbitrarios si existe variable (`--primary-blue`, `--accent-green`, etc.)

## Utilidades frecuentes

- Bordes: `rounded-[2rem]`, `rounded-[3rem]`
- Marketing: `font-black`, `uppercase`, `tracking-widest`
- Sombra CTA verde: `shadow-[0_0_20px_rgba(52,211,153,0.3)]`

## Responsive

- Breakpoints `md:` para desktop
- Variante landscape baja altura (AGENTS.md)

## Anti-patterns

- `bg-[#0080bb]` en Navbar/Footer
- Purging de clases críticas en Vercel en componentes de layout
