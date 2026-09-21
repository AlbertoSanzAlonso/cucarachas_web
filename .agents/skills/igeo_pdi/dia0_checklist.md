# Día 0 — Checklist al recibir credenciales PRE

Ejecutar **solo** con vhost/usuario PRE. Nunca pegar passwords en git ni en el chat del asistente.

## 1. Coolify (backend) — variables

```
IGEO_PDI_ENABLED=true
IGEO_PDI_HOST=…          # host AMQP PRE
IGEO_PDI_PORT=5671
IGEO_PDI_SSL=true
IGEO_PDI_USER=…          # solo PRE
IGEO_PDI_PASSWORD=…      # solo PRE
IGEO_PDI_VHOST=pre_…     # debe empezar por pre_ o ser el sandbox confirmado
IGEO_PDI_DRY_RUN=false   # true solo si quieres validar sin publicar
IGEO_DEFAULT_DELEGACION=…
IGEO_DEFAULT_GESTOR=…
IGEO_DEFAULT_IDIOMA=es_ES
```

Reiniciar el contenedor API tras guardar.

## 2. Migraciones y espejo

```bash
python manage.py migrate
python manage.py igeo_ingest_exports --demo   # opcional, datos locales de prueba
```

Con cola real:

```bash
python manage.py igeo_ingest_exports --from-queue
```

## 3. Primera escritura de prueba

Publicar un `CLIENTE_POTENCIAL` de prueba (MCP `igeo_create_lead`, script o asistente ops en dry-run desactivado **solo PRE**).

Comprobar:

1. Mensaje en cola `importaciones`
2. ACK en `resultadoImportaciones` (`codigo == "1"` o equivalente OK)
3. Entrada en `IgeoSyncLog` / espejo tras export si aplica

Si el ACK falla por campos `*!`, corregir maestros con iGEO **antes** de más entidades.

## 4. Worker de colas (continuo)

```bash
python manage.py igeo_drain_loop          # exportaciones + resultados (si existe)
python manage.py process_ops_jobs --loop  # cola interna del asistente
```

En Coolify: servicio/worker aparte apuntando al mismo código e imagen, sin exponer HTTP público.

## 5. Criterio de hecho Día 0

- [ ] Consola PRE accesible
- [ ] Publish potencial OK
- [ ] ACK OK
- [ ] Cero credenciales de producción en Coolify
- [ ] Gloria informada del resultado de la prueba
