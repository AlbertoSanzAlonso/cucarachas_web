# Mantenimiento mediante Agentes AI (CECSA Urban Plagas)

Este proyecto está diseñado para ser mantenido y evolucionado por agentes de IA. Para garantizar la consistencia, se han definido una serie de **Skills** que definen las reglas y procedimientos para cada área.

## 🏷 Nombre de Marca

El nombre oficial de la web es **CECSA Urban Plagas** (no "Sanidad Ambiental"). El footer y el header deben reflejar siempre este nombre.

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
Sincroniza los servicios presentados en la web con el backend Django. Su misión es asegurar que los datos en `backend/init_db.py` coincidan con la `Services.jsx` y el estado de la base de datos `db.sqlite3`.

### 3. **Copywriter Local** (`.agents/skills/copywriter_local`)
Genera contenido con autoridad para la región de Barcelona (Área Metropolitana, Vallès, etc.). Utiliza el enfoque "Aceptar para actuar con conciencia" extraído de la filosofía oficial de CECSA.

### 4. **UI/UX Pro Max** (`.agents/skills/ui-ux-pro-max`)
Inteligencia de diseño UI/UX. Consultar antes de implementar secciones nuevas. Proporciona patrones de diseño, tipografías, colores y guías de accesibilidad. Verificado y usado para el diseño del header/navbar actual.

## 📋 Cómo Usar las Skills

Antes de realizar cambios significativos, lee el archivo `SKILL.md` correspondiente para entender las restricciones y el tono de voz esperado por el cliente.

## ⚙️ Convenciones de Implementación

- **Inline styles** en todos los componentes de layout críticos (Navbar, Footer, FloatingCTA) para evitar problemas de purging de Tailwind en producción (Vercel).
- **Clases Tailwind** permitidas solo para utilidades simples como `container`, `flex`, `grid`, `hidden`, `lg:flex`, etc.
- El **scroll del Navbar** usa `scrollProgress` (0→1 en los primeros 150px) para animar blur, sombra y padding de forma progresiva, no con un estado booleano.
- **Isotipo**: `/public/assets/isotipo.png` con `filter: brightness(0) invert(1)` para versión blanca. Altura máxima de `40px`.
