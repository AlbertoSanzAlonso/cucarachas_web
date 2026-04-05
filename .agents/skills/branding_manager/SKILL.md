---
name: Branding Manager
description: Gestor de la identidad visual de CECSA Control de Plagas.
---

# Skill: Branding Manager (CECSA Control de Plagas)

## Propósito
Garantizar que todos los desarrollos visuales y estilos sigan estrictamente las directrices del manual de branding de CECSA y el sistema de diseño "Sanitary Premium Clean" aprobado.

## Paleta de Colores

| Rol | Valor | Uso |
|-----|-------|-----|
| Azul Corporativo | `#0080bb` | Fondo de Header, Footer, botón primario, slogan |
| Azul Oscuro (hover) | `#006fa3` | Hover de botón primario |
| Verde Esmeralda (acento) | `#34d399` | CTA "Presupuesto", iconos de acento, hover de links sobre azul |
| Verde Esmeralda (hover) | `#10b981` | Hover del CTA verde |
| Verde oscuro (texto sobre verde) | `#064e3b` | Texto sobre botones verdes |
| Gris Secundario | `#3c3c3b` | Texto principal sobre fondos claros |
| Fondo Claro | `#f8fafc` / Blanco | Secciones de contenido |
| Texto de Título | `#000000` | Títulos principales en Hero |

## Tipografía (Ver Typography Expert para detalles)

- **Headings**: **Lora** (serif) — autoridad editorial para H1/H2 principales.
- **UI y labels**: **Montserrat** — botones, navegación, labels de campo.
- **Body**: **Inter** o Segoe UI — texto corriente, párrafos.

## Logotipo y Marca

- **Nombre oficial**: CECSA + "**Control de Plagas**" (nunca "Urban Plagas" o "Sanidad Ambiental").
- **Isotipo**: `/public/assets/isotipo.png` — siempre con `filter: brightness(0) invert(1)` sobre fondos azules. 
- **Alturas**: **60px** en Navbar / **40px** en Footer.
- El nombre "CECSA" va en blanco (sobre azul) o negro (sobre blanco), peso 900, tracking `-0.04em`. 
- "**Control de Plagas**" en `#34d399` (sobre azul), peso 800, uppercase.

## Eslógan y Tono de Voz

- **Eslógan Oficial**: "**Ético y Consciente**".
- **Color del Eslógan**: Azul Corporativo (`#0080bb`) en Hero, Blanco o Verde en Footer/Navbar.
- **Enfoque**: Especialización absoluta en desinsectación técnica de cucarachas (especies).

## Convenciones Técnicas Críticas

1. **Inline styles obligatorios** en `Navbar.jsx`, `Footer.jsx` y `FloatingCTA.jsx` — NO usar clases Tailwind para colores, paddings o fondos en estos componentes. Esto evita el purging en Vercel.
2. **Tailwind permitido** solo para layout: `container`, `flex`, `grid`, `hidden`, `lg:flex`, `sticky`, etc.
3. **Scroll del Navbar**: usa `scrollProgress` (0→1 en los primeros 150px), NO un booleano `scrolled`. 
4. **No usar Tailwind** para `text-[size]`, `rounded-[value]`, `bg-*` en los componentes de layout — todo via `style={{}}`.

## Reglas de Diseño Especiales

- **Slider del Hero**: Proporción fija `aspect-[4/5]` en todas las pantallas. Imágenes con `object-cover`.
- **Modales de Especies**: Fondo `white`, `borderRadius: '2rem'`, sombras `shadow-2xl`.
- **Iconografía**: Lucide React. Color principal `#0080bb` o `#34d399` para acentos.

## Anti-patterns — NUNCA hacer esto

- Usar el nombre "Urban Plagas".
- Usar el lema "Científico y Consciente".
- Usar `sm:aspect-square` en el slider (causa saltos de tamaño).
- Añadir `underline` a links del Navbar o Footer.
- Usar colores fuera de la paleta definida.
