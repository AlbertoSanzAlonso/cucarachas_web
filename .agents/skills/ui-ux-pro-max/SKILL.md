# Skill: UI/UX Pro Max (CECSA)

## 🎯 Objetivo
Mantener una experiencia de usuario de alta gama (Premium) que transmita confianza sanitaria y autoridad técnica.

## 🏗️ Layout e Interacción
1. **Contenedores**: El `max-width` estándar es `1280px` (`.container` en CSS).
2. **Espaciado**: Usar potencias de 4 para el espaciado (gap-4, gap-8, gap-16). Evitar el "clutter".
3. **Bordes**: Radio de borde generoso para un look moderno:
   - Tarjetas: `rounded-[2rem]` o `rounded-[3rem]`.
   - Botones: `rounded-full`.
4. **Elevación**: Usar `--shadow-premium` para tarjetas sobre fondo blanco y `--shadow-cta` para botones de acción.

## ⚡ Animaciones
- Usar **Framer Motion** para transiciones suaves.
- **Scroll del Navbar**: Implementar siempre la lógica de `scrollProgress` para cambios de opacidad y desenfoque (blur).
- **Entradas**: Los elementos deben aparecer con un leve offset vertical (`y: 20 -> 0`) y opacidad (`0 -> 1`).

## 📱 Responsividad
- Desktop first para el diseño de rejillas complejas, pero asegurar que en móviles las tarjetas ocupen el ancho completo y los CTAs sean fáciles de pulsar (mínimo 44px de altura).
- El menú móvil debe tener un fondo sólido (`--primary-blue-hv`) para garantizar legibilidad.

## 🔍 SEO y Accesibilidad
- Solo un `h1` por página.
- Alt text descriptivo en todas las imágenes.
- Asegurar contraste RRB entre texto y fondo (especialmente en el verde esmeralda).
