"""
Plantillas de presupuesto CECSA basadas en los PDFs de referencia de la raíz del proyecto:
  - Presupuesto__11675P.pdf (particular — desinsectación cucarachas)
  - Presupuesto__11630P.pdf (hostelería — servicio integral DDD)
"""
from __future__ import annotations

from decimal import Decimal

IVA_RATE = Decimal("0.21")

COMPANY = {
    "legal_name": "DESINFECCIONES CECSA S.L",
    "address": "C/ Dels Rajolers, 16, 08028 Barcelona",
    "cif": "B64287055",
    "phone": "933 30 9169",
    "whatsapp": "681033305",
    "email": "info@cecsaddd.com",
    "web": "www.cecsaddd.com",
    "roesp": "0246-CAT-SB",
    "mercantil": "Registro Mercantil de Barcelona, hoja BL 4230",
    "services_banner": (
        "DESRATIZACIONES - DESINSECTACIONES - DESINFECCIONES - "
        "CONTROL DE AVES - XILÓFAGOS"
    ),
}

SERVICE_CLAUSES = """\
CLÁUSULAS DEL SERVICIO – DESINFECCIONES CECSA, S.L.
1. Facturación Los precios podrán revisarse anualmente según el I.P.C. Las cuotas no abonadas en su vencimiento se incrementarán con los intereses legales, gastos adicionales y costes de recobro.
2. Medios aportados por C.E.C.S.A. C.E.C.S.A. proporcionará los técnicos aplicadores, vehículos, maquinaria, productos autorizados y materiales necesarios para la correcta realización de los tratamientos contratados.
3. Productos utilizados En las desratizaciones exteriores se emplean raticidas anticoagulantes eficaces contra todo tipo de ratas y ratones. En interiores se utilizan rodenticidas selectivos. En desinsectaciones se aplican insecticidas de efecto inmediato y residual, y en desinfecciones productos germicidas, bactericidas, fungicidas y desodorizantes. Registro Oficial: 0246-CAT-SB.
4. Documentación y precauciones Antes y después de cada servicio se entregará documentación con productos, dosis, zonas tratadas, fecha, medidas de seguridad y plazos de reentrada.
5. Garantías En contratos de mantenimiento anual (dos o más aplicaciones), CECSA realizará tratamientos adicionales sin coste ante infestaciones imprevistas durante la vigencia del contrato.
6. Obligaciones del contratante El cliente deberá facilitar acceso a zonas a tratar, mantenerlas limpias y respetar medidas de seguridad.
7. Programación de aplicaciones El primer servicio se realizará dentro de los siete días laborables siguientes a la firma, salvo indicación contraria.
8. Validez del contrato, duración y pago El presupuesto firmado se considera contrato vinculante con duración mínima de 12 meses desde el primer tratamiento. Renovación automática salvo preaviso de 2 meses.
9. Precauciones con raticidas Los cebos son nocivos y deben mantenerse fuera del alcance de niños y animales.
10. Precauciones con insecticidas y desinfectantes Respetar plazo de seguridad y ventilar antes de acceder.
11. Información del servicio comunitario Fechas, horarios y zonas definidos por C.E.C.S.A. según criterios técnicos.
12. Protección de datos Los datos se tratarán conforme al RGPD. Derechos ante Desinfecciones CECSA, S.L. (CIF B64287055 – C/ dels Rajolers, 16, 08028 Barcelona) o AEPD."""

PRESUPUESTO_TEMPLATES: list[dict] = [
    {
        "id": "11675P",
        "label_ca": "Particular — Desinsectació paneroles",
        "label_es": "Particular — Desinsectación cucarachas",
        "pest_type": "german_cockroach",
        "severity": "medium",
        "property_type": "particular",
        "tipo_propiedad": "Residencial",
        "garantia_meses": 12,
        "validez_dias": 30,
        "tipo_trabajo": "Contrato de mantenimiento",
        "observaciones_pago": "CUOTA SEMESTRAL 151,25 € IVA INCLUIDO.",
        "zonas_tratar": "La totalidad de las instalaciones",
        "lineas": [
            {
                "concepto": "DESINSECTACIÓN CUCARACHAS (SIN PLAZO DE SEGURIDAD)",
                "descripcion": (
                    "TRATAMIENTO DE DESINSECTACIÓN: Aplicación de geles biocidas de uso exclusivo "
                    "profesional, sin plazo de seguridad, mediante la colocación estratégica de cebos "
                    "en zonas clave para garantizar el control eficaz de la plaga.\n\n"
                    "El contrato incluye el número de intervenciones pactadas, con garantía TOTAL "
                    "durante la vigencia del mismo. La duración del contrato es de 1 año a partir "
                    "del primer tratamiento, independientemente de cuándo se realicen las siguientes visitas."
                ),
                "precio": "125.00",
                "cantidad": 2,
            },
        ],
        "reference": {
            "city": "Barcelona",
            "zone_detail": "Eixample",
            "total_monto": Decimal("250.00"),
            "breakdown": [
                {
                    "nombre": "DESINSECTACIÓN CUCARACHAS (SIN PLAZO DE SEGURIDAD)",
                    "precio_unitario": 125.0,
                    "cantidad": 2,
                },
            ],
            "garantia_meses": 12,
            "notes": "Modelo referencia 11675P — particular desinsectación cucarachas (2×125€, mantenimiento anual)",
        },
    },
    {
        "id": "11630P",
        "label_ca": "Hostaleria — Servei integral DDD",
        "label_es": "Hostelería — Servicio integral DDD",
        "pest_type": "german_cockroach",
        "severity": "medium",
        "property_type": "negoci",
        "tipo_propiedad": "Comercial",
        "garantia_meses": 12,
        "validez_dias": 30,
        "tipo_trabajo": "Contrato de mantenimiento",
        "observaciones_pago": "Facturación semestral según condiciones del contrato.",
        "zonas_tratar": "Obrador, Zona de venta, Almacén de materias primas, Aseos y zona de ducha",
        "lineas": [
            {
                "concepto": "SERVICIO INTEGRAL",
                "descripcion": (
                    "SERVICIO PROFESIONAL INTEGRAL DE DESINSECTACIÓN, DESRATIZACIÓN Y DESINFECCIÓN "
                    "PARA ESTABLECIMIENTOS DE HOSTELERÍA.\n\n"
                    "Desinfecciones Cecsa está especializada en soluciones integrales de Desinfección, "
                    "Desinsectación y Desratización (DDD) para locales de hostelería, cumpliendo la "
                    "normativa sanitaria vigente. Se entrega Certificado Sanitario Oficial.\n\n"
                    "Alcance: dos intervenciones anuales (cada seis meses) con garantía de 12 meses.\n"
                    "• Desratización: rodenticidas profesionales en portacebos homologados.\n"
                    "• Desinsectación: geles biocidas sin plazo de seguridad en puntos críticos.\n"
                    "• Desinfección: desinfectantes profesionales sin plazo de seguridad."
                ),
                "precio": "225.00",
                "cantidad": 2,
            },
        ],
        "reference": {
            "city": "Barcelona",
            "zone_detail": "Poble-sec",
            "total_monto": Decimal("450.00"),
            "breakdown": [
                {
                    "nombre": "SERVICIO INTEGRAL DDD hostelería",
                    "precio_unitario": 225.0,
                    "cantidad": 2,
                },
            ],
            "garantia_meses": 12,
            "notes": "Modelo referencia 11630P — hostelería servicio integral DDD (2×225€, certificado sanitario)",
        },
    },
]


def get_template(template_id: str) -> dict | None:
    for tpl in PRESUPUESTO_TEMPLATES:
        if tpl["id"] == template_id:
            return tpl
    return None


def calc_iva(base: Decimal) -> Decimal:
    return (base * IVA_RATE).quantize(Decimal("0.01"))


def calc_total_con_iva(base: Decimal) -> Decimal:
    return (base + calc_iva(base)).quantize(Decimal("0.01"))
