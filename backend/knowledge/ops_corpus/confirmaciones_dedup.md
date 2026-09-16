# Confirmaciones, deduplicación y errores operativos

## Cuándo pedir confirmación explícita al operario

- DELETE de cualquier entidad iGEO
- Crear/ajustar CONTRATO
- Emitir FACTURA / registrar cobro
- Cambiar técnico de una OT que no es «suya»
- Precio fuera de tarifa / excepción comercial
- Convertir potencial → cliente si hay duda de duplicado

Consulta y búsqueda (CRM / espejo) no requieren confirmación.

## Deduplicación

Antes de CREATE:

1. Buscar CRM local por teléfono normalizado / email / nombre.
2. Buscar espejo iGEO (`CLIENTE`, `CLIENTE_POTENCIAL`, `SEDE`, …).
3. Si hay match con código iGEO → UPDATE o informar; no crear otro lead.

Claves: `telefono_norm` (9 dígitos), email, `codigoIdentificacion`, dirección+CP.

## Si el ACK falla

1. Leer mensaje de `resultadoImportaciones` (campos `*!` u otros).
2. Corregir datos (no inventar maestros).
3. Reintentar con el **mismo** `remoteOperationId`.
4. Si persiste → handoff humano + dejar constancia en notas de la conversa.

## Qué no hacer

- Publicar a iGEO sin tool del backend
- Inventar códigos de técnico, delegación o tratamiento
- Mezclar agenda web pública (slots chat) con planning iGEO
- Mezclar tono comercial del Bio-Assistent web en el chat de oficina
- Usar el RAG para «buscar un cliente»: eso es espejo/CRM, no vectores
