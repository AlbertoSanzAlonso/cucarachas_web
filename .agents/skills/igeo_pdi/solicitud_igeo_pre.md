# Solicitud técnica a iGEO (copiar / pegar) — solo PRE

Gloria / CECSA puede reenviar este bloque tal cual a iGEO.

---

Asunto sugerido: Solicitud de accesos PDI RabbitMQ — entorno PRE (Desinfecciones CECSA)

Buenos días,

Somos Desinfecciones CECSA. Estamos desarrollando la integración con iGEO según su Guía de programadores PDI (RabbitMQ). Necesitamos **únicamente el entorno de preproducción**, aislado de nuestros datos reales, para pruebas. **No solicitamos todavía accesos de producción.**

Por favor, faciliten y confirmen lo siguiente:

### 1. Acceso AMQP (RabbitMQ) — PRE

- Host AMQP de preproducción (p. ej. `pdi.pre.igeoapp.com` o el que corresponda)
- Puerto AMQP (confirmar si es `5671` con TLS)
- Uso de SSL/TLS: sí / no
- Usuario y contraseña **exclusivos de PRE** (distintos de producción)
- Virtual host de PRE (p. ej. `pre_cecsa` o el nombre que asignen)
- URL de la consola de gestión Rabbit de PRE (si aplica, p. ej. puerto 15671)

### 2. Aislamiento y seguridad

- Confirmación por escrito de que este virtual host / entorno **no escribe ni lee el iGEO de producción** de CECSA
- Confirmación de que las credenciales PRE **no** sirven para modificar datos reales
- Procedimiento de alta / revocación de usuarios PDI

### 3. Colas a activar en el vhost PRE

- `importaciones` (CECSA → iGEO: CREATE / UPDATE / DELETE)
- `resultadoImportaciones` (iGEO → CECSA: ACK / errores)
- `exportaciones` (iGEO → CECSA: cambios para lectura / espejo)

### 4. Entidades a activar en PRE (prioridad)

Mínimo para empezar:

- `CLIENTE_POTENCIAL`
- `CLIENTE`
- `SEDE`
- `CONTACTO`

Previsto a continuación (activar si es posible en la misma alta PRE):

- `ORDEN_DE_TRABAJO` (y planning asociado si aplica)
- `CONTRATO`
- `DOCUMENTO`
- Entidad o equivalente de **avisos / incidencias**
- `presupuesto` (si existe como entidad PDI)
- Facturas / remesas (solo lectura o escritura controlada en PRE, si está disponible)

### 5. Documentación y contratos de mensaje

- Confirmación de que la guía PDI v3 sigue vigente, o versión actualizada
- Esquemas / ejemplos JSON de importación y de `resultadoImportaciones` (ACK) para las entidades anteriores
- Campos obligatorios (`*!`) y validaciones conocidas
- Formato de `remoteOperationId` / idempotencia y tiempos esperados de procesamiento
- Cómo abrir o enlazar una ficha concreta desde un sistema externo (si existe URL o código estable)
- Límites de volumen, paginación o retención de mensajes en colas

### 6. Códigos maestros de PRE (datos de prueba)

Necesitamos valores válidos **de prueba** (no producción) para:

- Código de delegación
- Código de gestor / empleado
- Idioma por defecto
- Actividad / zona comercial (si aplica)
- Línea de negocio / tratamiento / técnico de prueba (para ODT)
- Cualquier otro maestro obligatorio para CREATE de potencial, cliente, sede, contrato u ODT

### 7. Datos de prueba y sandbox

- Confirmación de si el entorno PRE incluye datos de ejemplo o está vacío
- Restricciones (p. ej. si DELETE está permitido en PRE)
- Contacto de soporte técnico PDI para incidencias de conexión o ACK

### 8. Producción (solo información, no activar aún)

Cuando el piloto PRE esté validado por CECSA, pediremos un segundo juego de credenciales de **producción**, en otro virtual host, con el mismo mapa de colas/entidades. Hasta entonces no deben entregarse accesos de prod.

Quedamos a la espera de los accesos PRE y de la confirmación de aislamiento.

Atentamente,  
Desinfecciones CECSA  
(Integración iGEO / equipo técnico)
