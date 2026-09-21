# Respuestas a Gloria Sureda (CECSA ↔ iGEO)

**NO ENVIADO.** Borrador para que Alberto lo copie cuando quiera. No se ha mandado ningún correo.

Fecha de redacción: 2026-09-21.  
Uso: copiar/pegar o adaptar. No incluye secretos.

---

## Correo 1 — Confirmación PDI + qué pedir a iGEO (solo PRE)

**Asunto:** Re: Integración iGEO — confirmación técnica PDI y accesos PRE

Hola Gloria,

He revisado el correo de iGEO, la guía de programadores de la PDI y el dossier v1.1. Te confirmo lo siguiente.

**Confirmación técnica**

Sí: la integración se hace mediante la **PDI de iGEO (RabbitMQ)**, no mediante una API REST pública ni conectores tipo Zapier/Make. Eso coincide con lo que ellos os respondieron y con la guía (páginas 9 y 30: colas para enviar/recibir; importación CREATE / UPDATE / DELETE).

Hay dos entornos (preproducción y producción). **Al principio trabajaremos solo en PRE**, con credenciales distintas de producción, para no poder modificar ni borrar clientes, contratos, ODT, facturas ni ningún dato real.

**Qué necesitamos que solicites a iGEO ahora**

Te dejo en un bloque aparte el texto listo para reenviarles (petición única y detallada). Resumen en una frase: accesos AMQP y consola **solo PRE**, colas activadas, entidades mínimas, códigos maestros de prueba, y confirmación por escrito de que PRE está aislado de producción.

**Sobre el dossier y ChatGPT Pro**

El dossier nos sirve como especificación y base de reglas (procesos, renovaciones, tono, permisos). No lo tomaremos al pie de la letra en integraciones que ya no uséis (p. ej. Aircall).  

**No conviene “conectar” tu cuenta ChatGPT Pro al proyecto**: no aporta auditoría ni cola de servidor, y mezcla secretos/contexto personal. Lo correcto es ir trasladando las reglas que tú valides a nuestro asistente de oficina (conocimiento versionado + herramientas controladas). El vídeo de prueba va en esa línea.

Cuando iGEO responda con PRE, el siguiente paso técnico es conectar, publicar un potencial de prueba y leer el ACK. Hasta entonces no tocamos producción.

Un saludo,  
Alberto

---

## Correo 2 — Agradecimiento dossier + plan de fases (si quieres un segundo mensaje)

**Asunto:** Re: Dossier CECSA y avance integración iGEO

Hola Gloria,

Gracias por el dossier v1.1 y por el feedback del vídeo. Nos ayuda a priorizar.

**Orden de avance (resumen)**

1. Pedir y validar accesos **PRE** de iGEO (bloque adjunto / correo anterior).  
2. Conectar CECSA ↔ PDI en pruebas (potencial de prueba + ACK + espejo de lectura).  
3. Ampliar el asistente de oficina: cola de tareas (lotes sin depender de una pestaña abierta), feedback al completar, y cargar las reglas del dossier que tú confirmes.  
4. Después: renovaciones mensuales y flujo comercial (potencial → contrato → ODT), siempre con confirmación humana en lo sensible.  
5. Outlook / WhatsApp Meta / telefonía nueva / Sage: más adelante, cuando iGEO PRE esté estable.

Si puedes, cuando contactes a iGEO usa el texto de solicitud técnica completo para evitar idas y vueltas.

Un saludo,  
Alberto
