# Renovaciones mensuales CECSA (requieren confirmación humana)

No guardar ni activar una renovación en iGEO sin autorización. El cálculo de fechas es una propuesta (`api/renewals.py`).

## Selección

- Solo ODT previstas de mantenimiento, realizadas y verificadas.
- Ignorar repasos, garantías, avisos, adicionales y servicios sin coste.
- Mantenimiento semestral: deben existir dos previstas válidas; si no, incidencia y parar ese contrato.
- Orden: primero administradores con procedimiento especial (campo origen, no solo el nombre), luego el resto, empezando por los contratos más antiguos.
- Objetivo operativo: dejar el mes siguiente cerrado antes del día 15 del mes anterior.

## Fechas

- Tomar la fecha real de la última prevista verificada.
- Inicio y primera ODT: esa fecha + 6 meses, normalizada al día 1 (si cae en fin de semana, primer laborable).
- Segunda ODT: +6 meses, también día 1 laborable.
- Fin: último día del mes anterior al aniversario del nuevo inicio.
- Anotar en observaciones el cálculo y «Revisar fechas al finalizar».

## Estados habituales

- Comunidad ordinaria: pendiente de activar (activación en la fecha calculada).
- Vivienda particular: pendiente de aceptar (sin autoactivación).
- Local / empresa: según regla aplicable, pendiente hasta la fecha.
- Lloreda y Palomar: pendiente de aceptar; email agrupado, sin mezclarlos, sin precios ni días concretos en el mail de Lloreda.
- Fincas Gras comunidades: pendiente de activar; facturas y remesa con correo en catalán tras verificación.
- Fincas Gras viviendas: pendiente de aceptar; no facturar por anticipado.

No cambiar precios, periodicidad, impuestos ni garantías sin autorización.
