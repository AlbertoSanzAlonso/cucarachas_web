# Mantenimiento mediante Agentes AI (CECSA Sanidad Ambiental)

Este proyecto está diseñado para ser mantenido y evolucionado por agentes de IA. Para garantizar la consistencia, se han definido una serie de **Skills** que definen las reglas y procedimientos para cada área.

## 🛠 Skills Activas

### 1. **Branding Manager** (`.agents/skills/branding_manager`)
Encargado de la coherencia visual. Reglas estrictas sobre el uso del azul corporativo (#0080bb), gris secundario (#3c3c3b) y las tipografías Montserrat y Segoe. Siempre verifica el archivo `Branding CECSA.pdf` antes de proponer cambios de diseño.

### 2. **Service Auditor** (`.agents/skills/service_auditor`)
Sincroniza los servicios presentados en la web con el backend Django. Su misión es asegurar que los datos en `backend/init_db.py` coincidan con la `Services.jsx` y el estado de la base de datos `db.sqlite3`.

### 3. **Copywriter Local** (`.agents/skills/copywriter_local`)
Genera contenido con autoridad para la región de Barcelona (Área Metropolitana, Vallès, etc.). Utiliza el enfoque "Aceptar para actuar con conciencia" extraído de la filosofía oficial de CECSA.

## 📋 Cómo Usar las Skills

Antes de realizar cambios significativos, lee el archivo `SKILL.md` correspondiente para entender las restricciones y el tono de voz esperado por el cliente.
