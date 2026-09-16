from api.igeo.payloads import build_cliente, build_cliente_potencial, build_generic_entity, build_sede


def demo_export_payloads() -> list[dict]:
    """Payloads de prueba (misma forma PDI) para desarrollar el espejo sin credenciales."""
    potencial = build_cliente_potencial(
        nombre="Anna Puig",
        codigo_delegacion="DN",
        codigo_gestionado_por="GESTOR1",
        telefono="612345678",
        email="anna.puig@example.com",
        direccion="Carrer Provença 1, Barcelona",
        localidad="Barcelona",
        remote_operation_id="demo-potencial-anna",
    )
    potencial["codigoEntidadIgeo"] = "POT-DEMO-ANNA"

    cliente = build_cliente(
        codigo="CLI-DEMO-01",
        nombre="Hostaleria Demo SL",
        codigo_delegacion="DN",
        tipo_cliente="EMPRESA",
        telefono="933309169",
        email="demo@cecsaddd.com",
        direccion="Carrer Pau Claris 10",
        localidad="Barcelona",
    )

    sede = build_sede(
        codigo="SEDE-DEMO-01",
        codigo_cliente="CLI-DEMO-01",
        nombre="Cuina principal",
        direccion="Carrer Pau Claris 10",
        localidad="Barcelona",
        codigo_delegacion="DN",
    )

    ot = build_generic_entity(
        tipo_entidad="Orden_De_Trabajo",
        comando="CREATE",
        codigo_entidad="OT-DEMO-01",
        datos={
            "numero": "OT-DEMO-01",
            "nombre": "Revisió periòdica demo",
            "estado": "prevista",
            "codigoCliente": "CLI-DEMO-01",
            "notaInterna": "OT de prova — no és real.",
        },
        remote_operation_id="demo-ot-01",
    )
    return [potencial, cliente, sede, ot]
