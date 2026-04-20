# Mantenimiento mediante Agentes AI (CECSA Control de Plagas)

Este proyecto está diseñado para ser mantenido y evolucionado por agentes de IA. Para garantizar la consistencia, se han definido una serie de **Skills** que definen las reglas y procedimientos para cada área.

## 🏷 Nombre de Marca y Enfoque

- **Nombre Oficial**: **CECSA Control de Plagas** (anteriormente Urban Plagas).
- **Nicho Especializado**: El sitio está especializado exclusivamente en el **control de cucarachas** (desinsectación técnica).
- **Eslógan**: **"Ético y Consciente"** (eliminar cualquier referencia a "Científico").
- **Localización Principal**: **Catalunya / Barcelona**.

## 🌍 Internacionalización (i18n)

- **Idioma Primario**: **Catalán** (`ca`).
- **Idiomas Secundarios**: Castellano (`es`) e Inglés (`en`).
- Todos los componentes deben usar el hook `useTranslation` de `react-i18next`. Los textos estáticos en JSX están prohibidos para contenido de negocio.

## 🎨 Sistema de Diseño Activo: "Sanitary Premium Clean"

- **Patrón**: Trust & Authority + Conversion (centralizado en `index.css`).
- **Tokens de Marca (Variables CSS)**:
  - **Corporativo**: `--primary-blue` (`#0080bb`), `--primary-blue-hv` (`#006fa3`).
  - **Acción/CTA**: `--accent-green` (`#34d399`), `--accent-green-hv` (`#10b981`).
  - **Neutrales**: `--secondary-gray` (`#3c3c3b`), `--bg-light` (`#f8fafc`).
- **Jerarquía de Texto**: Usar `--text-white-dim` y `--text-white-muted` para contenidos secundarios sobre fondos azules.
- **Inline styles obligatorios**: Usar siempre `style={{}}` en Navbar, Footer y FloatingCTA, PERO **siempre invocando las variables CSS** (ej: `background: 'var(--primary-blue)'`) para mantener la centralización.

## 🛠 Skills Activas

### 1. **Branding Manager** (`.agents/skills/branding_manager`)
Encargado de la coherencia visual. Reglas estrictas sobre colores, tipografía y uso del isotipo. Ver SKILL.md para restricciones exactas.

### 2. **Service Auditor** (`.agents/skills/service_auditor`)
Sincroniza los servicios (especies de cucarachas) presentados en la web con el backend Django.

### 3. **Copywriter Local** (`.agents/skills/copywriter_local`)
Genera contenido con autoridad para la región de Barcelona en **Catalán** y Castellano. Utiliza el enfoque "Ético y Consciente" extraído de la filosofía oficial de CECSA.

### 4. **UI/UX Pro Max** (`.agents/skills/ui-ux-pro-max`)
Inteligencia de diseño UI/UX. Consultar antes de implementar secciones nuevas.

### 5. **Tailwind Design System** (`.agents/skills/tailwind-design-system`)
Construcción de sistemas de diseño escalables con Tailwind CSS v4, tokens de diseño y patrones responsivos. Uso para estandarizar UI y componentes.

## 🚀 SEO & Optimización Permanente (MANDATORIO)

- **Activos**: Todos los nombres de imágenes y archivos deben ser descriptivos y usar guiones (ej: `eliminar-cucarachas-barcelona.webp`).
- **Semántica**: Uso estricto de etiquetas HTML5 (`<main>`, `<article>`, `<section>`, `<h1>`-`<h6>`). Un solo `<h1>` por página.
- **URLs**: Slugs limpios y semánticos (ej: `/sobre-nosaltres` o `/serveis/control-paneroles`).
- **Textos**: Redacción orientada a intención de búsqueda (Catalunya, Barcelona, Control de Plagues) sin perder el enfoque "Ético y Consciente".
- **Metadatos**: Cada página nueva debe incluir o actualizar sus etiquetas de título y meta-descripción en el archivo `translation.json`.

## ⚙️ Convenciones de Implementación

- **Inline styles** en componentes de layout (Navbar, Footer, FloatingCTA).
- **i18n**: Usar siempre `t('clave.traduccion')`.
- **Media**: Usar formato `.webp` para todas las imágenes.
- **Modales Premium**: Implementar siempre la estrategia **"Wait before Open"**. Al hacer clic, verificar la madurez de la imagen (`img.complete`) antes de activar el estado que abre el modal. Esto garantiza que el modal aparezca ya renderizado al 100% y perfectamente sincronizado.
- **Scroll del Navbar**: Animación progresiva mediante `scrollProgress`.
- **Isotipo**: `/public/assets/isotipo.png` con `filter: brightness(0) invert(1)`. Altura máxima de `60px` en Navbar y `40px` en Footer. El navbar debe cambiar el isotipo al azul corporativo usando CSS Filters dinámicos (`invert(27%) sepia(97%) saturate(2770%) hue-rotate(180deg) brightness(96%) contrast(101%)`) cuando es sticky.
- **Mobile Landscape (Apaisado)**: Uso obligatorio de la variante de Tailwind `[@media(max-height:600px)_and_(orientation:landscape)]` para recuperar espacio vertical crítico en móviles horizontales. El Navbar debe volverse `!absolute` para no ser sticky y reducir su altura, mientras que el FloatingCTA debe condensarse al mínimo (ocultar WhatsApp, transformar botones grandes en iconos pequeños) para evitar asfixiar el viewport.
