---
name: Branding Manager
description: Gestor de la identidad visual de CECSA Urban Plagas.
---

# Skill: Branding Manager (CECSA Urban Plagas)

## Propósito
Garantizar que todos los desarrollos visuales y estilos sigan estrictamente las directrices del manual de branding de CECSA y el sistema de diseño "Sanitary Premium Clean" aprobado.

## Paleta de Colores

| Rol | Valor | Uso |
|-----|-------|-----|
| Azul Corporativo | `#0080bb` | Fondo de Header, Footer, botón primario |
| Azul Oscuro (hover) | `#006fa3` | Hover de botón primario |
| Verde Esmeralda (acento) | `#34d399` | CTA "Presupuesto", iconos de acento, hover de links sobre azul, "Urban Plagas" label |
| Verde Esmeralda (hover) | `#10b981` | Hover del CTA verde |
| Verde oscuro (texto sobre verde) | `#064e3b` | Texto sobre botones verdes |
| Gris Secundario | `#3c3c3b` | Texto principal sobre fondos claros |
| Fondo Claro | `#f8fafc` / Blanco | Secciones de contenido |

## Tipografía

- **Headings**: **Lora** (serif) — autoridad editorial para H1/H2 principales.
- **UI y labels**: **Montserrat** — botones, navegación, labels de campo.
- **Body**: **Inter** o Segoe UI — texto corriente, párrafos.

## Logotipo y Marca

- **Nombre oficial**: CECSA + "Urban Plagas" (en verde esmeralda, nunca "Sanidad Ambiental").
- **Isotipo**: `/public/assets/isotipo.png` — siempre con `filter: brightness(0) invert(1)` sobre fondos azules. Altura máxima: **40px**.
- El nombre "CECSA" va en blanco, peso 900, tracking `-0.04em`. "Urban Plagas" en `#34d399`, peso 700, uppercase.

## Convenciones Técnicas Críticas

1. **Inline styles obligatorios** en `Navbar.jsx`, `Footer.jsx` y `FloatingCTA.jsx` — NO usar clases Tailwind para colores, paddings o fondos en estos componentes. Esto evita el purging en Vercel.
2. **Tailwind permitido** solo para layout: `container`, `flex`, `grid`, `hidden`, `lg:flex`, `sticky`, etc.
3. **Scroll del Navbar**: usa `scrollProgress` (0→1 en los primeros 150px), NO un booleano `scrolled`. El progreso se usa para:
   - Interpolar `rgba(0,128,187, alpha)` del fondo
   - Animar `blur()` en el backdrop-filter
   - Escalar la sombra
   - Comprimir el padding de 14px a 10px
   - Ocultar la trust bar a partir de `scrollProgress > 0.5`
4. **No usar Tailwind** para `text-[size]`, `rounded-[value]`, `bg-*` en los componentes de layout — todo via `style={{}}`.

## Reglas de Diseño

- Sin subrayados en ningún enlace de la navegación, footer ni cabecera.
- Hover de links sobre azul: color cambia a `#34d399`.
- Hover de links sobre blanco: color cambia a `#0080bb`.
- Botones CTA redondeados (`borderRadius: '2rem'`).
- Campos de formulario: `borderRadius: '14px'`, `padding: '18px 20px'`, `fontSize: '16px'`, `border: '1.5px solid #e2e8f0'`.
- La barra legal inferior del Footer es un div hermano del container (fuera de él), con `background: rgba(0,0,0,0.28)` para extenderse a ancho completo.

## Anti-patterns — NUNCA hacer esto

- Usar `rounded-[2rem]` o similares Tailwind arbitrarios en campos de formulario o botones críticos.
- Añadir `underline` a links del Navbar o Footer.
- Cambiar el nombre de marca a "Sanidad Ambiental".
- Usar colores fuera de la paleta definida (sin aprobación explícita del usuario).
- Confiar en clases Tailwind en Navbar/Footer para propiedades críticas de color o espaciado.
