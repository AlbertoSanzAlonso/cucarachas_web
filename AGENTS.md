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

- **Patrón**: Trust & Authority + Conversion (verificado con ui-ux-pro-max)
- **Fondo del Header y Footer**: Azul corporativo sólido `#0080bb`
- **Acento / CTA**: Verde esmeralda `#34d399` (botones de presupuesto, hover de links, iconos)
- **Texto sobre fondos azules**: Blanco puro o `rgba(255,255,255,0.65~0.85)` para jerarquía
- **Inline styles obligatorios**: Usar siempre `style={{}}` en lugar de clases Tailwind en Navbar, Footer y FloatingCTA para garantizar compilación correcta en Vercel.

## 🛠 Skills Activas

### 1. **Branding Manager** (`.agents/skills/branding_manager`)
Encargado de la coherencia visual. Reglas estrictas sobre colores, tipografía y uso del isotipo. Ver SKILL.md para restricciones exactas.

### 2. **Service Auditor** (`.agents/skills/service_auditor`)
Sincroniza los servicios (especies de cucarachas) presentados en la web con el backend Django.

### 3. **Copywriter Local** (`.agents/skills/copywriter_local`)
Genera contenido con autoridad para la región de Barcelona en **Catalán** y Castellano. Utiliza el enfoque "Ético y Consciente" extraído de la filosofía oficial de CECSA.

### 4. **UI/UX Pro Max** (`.agents/skills/ui-ux-pro-max`)
Inteligencia de diseño UI/UX. Consultar antes de implementar secciones nuevas.

## ⚙️ Convenciones de Implementación

- **Inline styles** en componentes de layout (Navbar, Footer, FloatingCTA).
- **i18n**: Usar siempre `t('clave.traduccion')`.
- **Media**: Usar formato `.webp` para todas las imágenes.
- **Scroll del Navbar**: Animación progresiva mediante `scrollProgress`.
- **Isotipo**: `/public/assets/isotipo.png` con `filter: brightness(0) invert(1)`. Altura máxima de `60px` en Navbar y `40px` en Footer.
