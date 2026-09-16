"""Builders de payloads PDI iGEO (UTF-8 JSON)."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from zoneinfo import ZoneInfo

Comando = Literal["CREATE", "UPDATE", "DELETE"]

_ALLOWED_COMANDOS = frozenset({"CREATE", "UPDATE", "DELETE"})
_ALLOWED_TIPOS = frozenset(
    {
        "CLIENTE",
        "CLIENTE_POTENCIAL",
        "SEDE",
        "CONTACTO",
        "ORDEN_DE_TRABAJO",
        "Orden_De_Trabajo",
        "CONTRATO",
        "DOCUMENTO",
    }
)


def normalize_comando(comando: str) -> Comando:
    value = (comando or "").strip().upper()
    if value not in _ALLOWED_COMANDOS:
        raise ValueError(f"comando inválido: {comando!r} (CREATE|UPDATE|DELETE)")
    return value  # type: ignore[return-value]


def _now_madrid() -> str:
    return datetime.now(ZoneInfo("Europe/Madrid")).strftime("%d/%m/%Y %H:%M:%S")


def _envelope(
    *,
    tipo: str,
    comando: str,
    datos: dict[str, Any],
    codigo_entidad: str | None = None,
    remote_operation_id: str | None = None,
) -> dict[str, Any]:
    tipo_norm = (tipo or "").strip()
    if tipo_norm not in _ALLOWED_TIPOS:
        raise ValueError(f"tipoEntidadIgeo no soportado en v1: {tipo!r}")
    payload: dict[str, Any] = {
        "tipoEntidadIgeo": tipo_norm,
        "comando": normalize_comando(comando),
        "datos": datos,
    }
    if codigo_entidad:
        payload["codigoEntidadIgeo"] = codigo_entidad
    if remote_operation_id:
        payload["remoteOperationId"] = remote_operation_id
    return payload


def split_person_name(full_name: str) -> tuple[str, str]:
    parts = (full_name or "").strip().split(None, 1)
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[1]


def build_cliente_potencial(
    *,
    nombre: str,
    codigo_delegacion: str,
    codigo_gestionado_por: str,
    telefono: str = "",
    movil: str = "",
    email: str = "",
    direccion: str = "",
    codigo_postal: str = "",
    localidad: str = "",
    codigo_provincia: str = "",
    tipo_cliente: str = "PARTICULAR",
    apellidos: str = "",
    observaciones: str = "",
    codigo_idioma: str = "es_ES",
    codigo_actividad: str = "",
    codigo_zona_comercial: str = "",
    remote_operation_id: str | None = None,
    comando: str = "CREATE",
) -> dict[str, Any]:
    """Lead / cliente potencial — entidad primaria para sync desde el chat."""
    name = (nombre or "").strip()
    if not name:
        raise ValueError("nombre es obligatorio para CLIENTE_POTENCIAL")
    deleg = (codigo_delegacion or "").strip()
    gestor = (codigo_gestionado_por or "").strip()
    if not deleg:
        raise ValueError("codigoDelegacion es obligatorio (*!)")
    if not gestor:
        raise ValueError("codigoGestionadoPor es obligatorio (*!)")

    tipo = (tipo_cliente or "PARTICULAR").strip().upper() or "PARTICULAR"
    if tipo not in ("PARTICULAR", "EMPRESA", "ADMINISTRACION PUBLICA"):
        tipo = "PARTICULAR"

    surname = (apellidos or "").strip()
    if tipo == "PARTICULAR" and not surname:
        first, surname = split_person_name(name)
        name = first or name

    datos: dict[str, Any] = {
        "nombre": name,
        "apellidos": surname,
        "tipoCliente": tipo,
        "codigoDelegacion": deleg,
        "codigoGestionadoPor": gestor,
        "codigoIdioma": codigo_idioma or "es_ES",
        "estado": "ACTIVO",
        "fechaAlta": _now_madrid(),
        "comoNosHaConocido": "WEB",
        "detallesComoNosHaConocido": "Bio-Assistent CECSA (cucarachasbarcelona.cat)",
        "observaciones": (observaciones or "")[:2000],
        "datosContacto": {
            "telefono": (telefono or "").strip(),
            "movil": (movil or telefono or "").strip(),
            "email": (email or "").strip(),
            "fax": "",
        },
    }
    if codigo_actividad:
        datos["codigoActividad"] = codigo_actividad
    if codigo_zona_comercial:
        datos["codigoZonaComercial"] = codigo_zona_comercial

    addr = (direccion or "").strip()
    if addr or codigo_postal or localidad:
        datos["datosPostales"] = {
            "direccion": addr,
            "codigoPostal": (codigo_postal or "").strip(),
            "localidad": (localidad or "").strip() or "Barcelona",
            "codigoProvincia": (codigo_provincia or "").strip() or "ES-B",
            "distrito": "",
        }

    return _envelope(
        tipo="CLIENTE_POTENCIAL",
        comando=comando,
        datos=datos,
        remote_operation_id=remote_operation_id,
    )


def build_cliente(
    *,
    codigo: str,
    nombre: str,
    codigo_delegacion: str,
    tipo_cliente: str = "PARTICULAR",
    apellidos: str = "",
    telefono: str = "",
    movil: str = "",
    email: str = "",
    direccion: str = "",
    codigo_postal: str = "",
    localidad: str = "",
    codigo_provincia: str = "",
    codigo_idioma: str = "es_ES",
    codigo_gestionado_por: str = "",
    observaciones: str = "",
    remote_operation_id: str | None = None,
    comando: str = "CREATE",
) -> dict[str, Any]:
    code = (codigo or "").strip()
    if not code:
        raise ValueError("codigo es obligatorio para CLIENTE")
    name = (nombre or "").strip()
    if not name:
        raise ValueError("nombre es obligatorio para CLIENTE")
    deleg = (codigo_delegacion or "").strip()
    if not deleg:
        raise ValueError("codigoDelegacion es obligatorio")

    datos: dict[str, Any] = {
        "codigo": code,
        "nombre": name,
        "apellidos": (apellidos or "").strip(),
        "tipoCliente": (tipo_cliente or "PARTICULAR").strip().upper() or "PARTICULAR",
        "codigoDelegacion": deleg,
        "codigoIdioma": codigo_idioma or "es_ES",
        "estado": "ACTIVO",
        "fechaAlta": _now_madrid(),
        "observaciones": (observaciones or "")[:2000],
        "datosContacto": {
            "telefono": (telefono or "").strip(),
            "movil": (movil or telefono or "").strip(),
            "email": (email or "").strip(),
            "fax": "",
        },
        "datosFacturacion": {
            "nombreFacturacion": name,
            "codigoIdentificacion": "",
            "direccion": (direccion or "").strip(),
            "codigoPostal": (codigo_postal or "").strip(),
            "localidad": (localidad or "").strip() or "Barcelona",
            "codigoProvincia": (codigo_provincia or "").strip() or "ES-B",
            "alfa2codepais": "ES",
        },
    }
    if codigo_gestionado_por:
        datos["codigoGestionadoPor"] = codigo_gestionado_por
        datos["gestionadoPor"] = {"codigo": codigo_gestionado_por}

    return _envelope(
        tipo="CLIENTE",
        comando=comando,
        datos=datos,
        codigo_entidad=code,
        remote_operation_id=remote_operation_id,
    )


def build_sede(
    *,
    codigo: str,
    codigo_cliente: str,
    nombre: str,
    codigo_delegacion: str,
    direccion: str = "",
    codigo_postal: str = "",
    localidad: str = "",
    codigo_provincia: str = "",
    telefono: str = "",
    email: str = "",
    remote_operation_id: str | None = None,
    comando: str = "CREATE",
) -> dict[str, Any]:
    code = (codigo or "").strip()
    client_code = (codigo_cliente or "").strip()
    if not code or not client_code:
        raise ValueError("codigo y codigo_cliente son obligatorios para SEDE")
    deleg = (codigo_delegacion or "").strip()
    if not deleg:
        raise ValueError("codigoDelegacion es obligatorio para SEDE")

    datos: dict[str, Any] = {
        "codigo": code,
        "nombre": (nombre or "").strip() or code,
        "delegacion": {"codigo": deleg},
        "datosContacto": {
            "telefono": (telefono or "").strip(),
            "movil": (telefono or "").strip(),
            "email": (email or "").strip(),
            "fax": "",
        },
        "datosPostales": {
            "direccion": (direccion or "").strip(),
            "codigoPostal": (codigo_postal or "").strip(),
            "localidad": (localidad or "").strip() or "Barcelona",
            "codigoProvincia": (codigo_provincia or "").strip() or "ES-B",
            "distrito": "",
        },
    }
    # Parent customer reference — field names vary; codigo cliente as secondary
    datos["codigoCliente"] = client_code

    return _envelope(
        tipo="SEDE",
        comando=comando,
        datos=datos,
        codigo_entidad=code,
        remote_operation_id=remote_operation_id,
    )


def build_orden_trabajo(
    *,
    numero: str,
    codigo_cliente: str,
    codigo_sede: str,
    codigo_delegacion: str,
    codigo_linea_negocio: str,
    hora_inicio_estimada: str,
    hora_fin_estimada: str,
    codigo_tecnico: str = "",
    codigo_tratamiento: str = "",
    nota_interna: str = "",
    nota_publica: str = "",
    remote_operation_id: str | None = None,
    comando: str = "CREATE",
) -> dict[str, Any]:
    """Orden de trabajo — fase 2; requiere códigos maestros iGEO."""
    num = (numero or "").strip()
    if not num:
        raise ValueError("numero es obligatorio para ORDEN_DE_TRABAJO")
    client = (codigo_cliente or "").strip()
    sede = (codigo_sede or "").strip()
    deleg = (codigo_delegacion or "").strip()
    linea = (codigo_linea_negocio or "").strip()
    if not all([client, sede, deleg, linea]):
        raise ValueError(
            "codigo_cliente, codigo_sede, codigo_delegacion y codigo_linea_negocio son obligatorios"
        )

    horarios = []
    if codigo_tecnico:
        horarios.append(
            {
                "codigoTecnico": codigo_tecnico,
                "horaInicioEstimada": hora_inicio_estimada,
                "horaFinEstimada": hora_fin_estimada,
            }
        )

    lineas_tratamiento = []
    if codigo_tratamiento:
        lineas_tratamiento.append(
            {
                "Codigo": "1",
                "nombre": "Control de plagas",
                "codigoTratamiento": codigo_tratamiento,
            }
        )

    datos: dict[str, Any] = {
        "numero": num,
        "cliente": {"codigo": client},
        "sede": {"codigo": sede},
        "delegacion": {"codigo": deleg},
        "lineaNegocio": {"codigo": linea},
        "notaInterna": (nota_interna or "")[:2000],
        "notaPublica": (nota_publica or "")[:2000],
        "estado": "prevista",
        "tipoOdT": "prevista",
        "horarios": horarios,
        "lineasTratamiento": lineas_tratamiento,
        "horaInicioEstimada": hora_inicio_estimada,
        "horaFinEstimada": hora_fin_estimada,
    }

    return _envelope(
        tipo="Orden_De_Trabajo",
        comando=comando,
        datos=datos,
        codigo_entidad=num,
        remote_operation_id=remote_operation_id,
    )


def build_generic_entity(
    *,
    tipo_entidad: str,
    comando: str,
    datos: dict[str, Any],
    codigo_entidad: str | None = None,
    remote_operation_id: str | None = None,
) -> dict[str, Any]:
    if not isinstance(datos, dict):
        raise ValueError("datos debe ser un objeto JSON")
    return _envelope(
        tipo=tipo_entidad,
        comando=comando,
        datos=datos,
        codigo_entidad=codigo_entidad,
        remote_operation_id=remote_operation_id,
    )
