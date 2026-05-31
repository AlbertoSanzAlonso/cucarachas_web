---
name: branding-manager
description: >-
  Identidad visual CECSA Control de Plagas. Colores, tipografía, isotipo e inline
  styles en Navbar, Footer y FloatingCTA.
---

# Skill: Branding Manager (CECSA Control de Plagas)

## Propósito

Garantizar coherencia con el sistema **"Sanitary Premium Clean"** y la marca **CECSA Control de Plagas** (nicho: control de cucarachas). Eslogan: **"Ético y Consciente"** — nunca "Científico".

## Tokens CSS (index.css)

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary-blue` | `#0080bb` | Header, Footer, fondos corporativos |
| `--primary-blue-hv` | `#006fa3` | Hover azul |
| `--accent-green` | `#34d399` | CTAs, iconos de acento |
| `--accent-green-hv` | `#10b981` | Hover verde |
| `--secondary-gray` | `#3c3c3b` | Texto sobre fondos claros |
| `--bg-light` | `#f8fafc` | Secciones claras |
| `--text-white-dim` / `--text-white-muted` | — | Texto secundario sobre azul |

## Logotipo

- Isotipo: `/public/assets/isotipo.png`
- Sobre fondo azul: `filter: brightness(0) invert(1)`
- Altura máxima: **60px** Navbar, **40px** Footer, escalado en modal agente

## Convenciones técnicas

1. **Inline styles obligatorios** en `Navbar.jsx`, `Footer.jsx`, `FloatingCTA.jsx` — usar siempre variables CSS (`var(--primary-blue)`), no valores hex sueltos.
2. Tailwind solo para layout (`flex`, `grid`, `hidden`, breakpoints).
3. **Scroll Navbar**: `scrollProgress` 0→1 en 150px (no booleano `scrolled`).
4. Modal agente: gradiente azul + CTAs `--accent-green`.

## Anti-patterns

- "Urban Plagas", "Sanidad Ambiental" o referencias a "Científico".
- Colores fuera de tokens sin aprobación.
- Clases Tailwind para colores/fondos en Navbar, Footer, FloatingCTA.
- Subrayados en links de navegación.
