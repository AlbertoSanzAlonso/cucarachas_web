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

## ⚡ Animaciones y Estados
- Usar **Framer Motion** para transiciones suaves.
- **Scroll del Navbar**: Implementar siempre la lógica de `scrollProgress` para cambios de opacidad y desenfoque (blur).
- **Entradas**: Los elementos deben aparecer con un leve offset vertical (`y: 20 -> 0`) y opacidad (`0 -> 1`).
- **Gestión de Modales Premium** (Estrategia "Wait before Open"):
    - **Pre-loading**: Forzar la carga de imágenes en el montaje del componente padre (`useEffect`).
    - **Apertura Atómica**: Al disparar el evento de apertura (click), crear un objeto `Image` y esperar a que esté cargado (`img.complete` o `onload`) ANTES de actualizar el estado que renderiza el modal.
    - **Feedback**: Durante la brevísima espera, cambiar el cursor a `wait` y reducir levemente la opacidad del elemento clicado para dar feedback de interacción inmediata.
    - **Resultado**: El modal debe aparecer con la imagen ya decodificada, evitando cualquier desfase visual o carga progresiva ("lazy loading") dentro del modal abierto.

## 📱 Responsividad
- Desktop first para el diseño de rejillas complejas, pero asegurar que en móviles las tarjetas ocupen el ancho completo y los CTAs sean fáciles de pulsar (mínimo 44px de altura).
- El menú móvil debe tener un fondo sólido (`--primary-blue-hv`) para garantizar legibilidad.

## 🔍 SEO y Accesibilidad
- Solo un `h1` por página.
- Alt text descriptivo en todas las imágenes.
- Asegurar contraste RRB entre texto y fondo (especialmente en el verde esmeralda).
