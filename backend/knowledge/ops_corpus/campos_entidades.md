# Campos mínimos por entidad iGEO (builders CECSA)

Alineado con `backend/api/igeo/payloads.py`. Campos marcados obligatorios fallan en el builder si faltan.

## CLIENTE_POTENCIAL

Obligatorios:

- `nombre`
- `codigoDelegacion` (*!)
- `codigoGestionadoPor` (*!)

Recomendados / habituales:

- `apellidos` (PARTICULAR; si falta se parte el nombre)
- `tipoCliente`: PARTICULAR | EMPRESA | ADMINISTRACION PUBLICA
- `codigoIdioma` (default `es_ES`)
- `datosContacto`: telefono, movil, email
- `datosPostales`: direccion, codigoPostal, localidad, codigoProvincia
- `observaciones`, `codigoActividad`, `codigoZonaComercial` (opcionales)

Uso: lead desde chat / recepción. No inventar códigos de delegación/gestor: usar env `IGEO_DEFAULT_*` o preguntar.

## CLIENTE

Obligatorios: `codigo`, `nombre`, `codigoDelegacion`.

También: tipoCliente, datosContacto, datosFacturacion (dirección/CP/localidad), opcional `codigoGestionadoPor`.

## SEDE

Obligatorios: `codigo`, `codigo_cliente` / `codigoCliente`, `codigoDelegacion`.

También: nombre, datosPostales, datosContacto.

Resolver contrato y OT por **sede**, no solo por cliente.

## ORDEN_DE_TRABAJO

Obligatorios:

- `numero`
- `codigo_cliente`
- `codigo_sede`
- `codigo_delegacion`
- `codigo_linea_negocio`
- franjas `horaInicioEstimada` / `horaFinEstimada`

Recomendados: `codigoTecnico`, `codigo_tratamiento`, notas interna/pública, zonas a tratar antes de cerrar.

Sin códigos maestros validados en pre → no publicar; pedir a l'operari.

## CONTRATO / DOCUMENTO / FACTURA

Escritura solo vía tools futuras con confirmación humana y rol adecuado. No improvisar payloads.
