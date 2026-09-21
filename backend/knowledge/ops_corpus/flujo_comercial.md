# Flujo comercial CECSA (confirmación humana en pasos sensibles)

Orden. Cada escritura iGEO pasa por tool + cola confirmada, no por JSON libre.

1. Buscar expediente (no duplicar).
2. Si no existe: `CLIENTE_POTENCIAL` y presupuesto interno pendiente de valoración. Un presupuesto a 0 € es registro interno, no una oferta enviada.
3. Inspección gratuita y sin compromiso. La preferencia del cliente no es una cita confirmada.
4. Presupuesto aceptado: revisar razón social, NIF/CIF, contactos, dirección fiscal y de actuación. Crear aviso comercial. Conversión a cliente + sede + contrato solo tras confirmación.
5. Sede: nombre `[dirección] ([nombre del cliente])`.
6. ODT y planning según presupuesto. No crear cita operativa a las 06:00. Horas internas 07:00/07:30 no se comunican al cliente como cita sin confirmación.
7. Factura vinculada a la ODT. No emitir si faltan datos fiscales. No marcar cobrada sin aprobación de conciliación.
8. Repaso/garantía: registrar el aviso aunque haya prevista próxima; no mover la prevista sin autorización. Si hay prevista o renovación en menos de 30 días, anotarlo y preguntar.

Canales Outlook, WhatsApp Business Meta, telefonía (pendiente de elegir; no Aircall) y Sage quedan fuera del piloto iGEO hasta que PRE y la cola ops estén estables.
