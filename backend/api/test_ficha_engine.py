"""Tests del motor de Ficha Maestra."""
from django.test import TestCase

from api.agents.models import AgentState, PestType, Severity
from api.ficha_engine import (
    CaseContext,
    evaluate_diagnosis_rules,
    evaluate_ficha_pricing,
    find_ficha,
    severity_to_agent,
)
from api.models import FichaServicio


CUC_GER_PISO = {
    "codigo": "CUC-GER-PISO",
    "nombre_comercial": "Control de cucaracha alemana en piso",
    "pest_type": "german_cockroach",
    "tipos_cliente": ["particular"],
    "lugares": ["cocina", "bano", "dormitorio", "salon", "garaje"],
    "preguntas_obligatorias": {
        "particular": [
            "codigo_postal",
            "metros_cuadrados",
            "where",
        ],
    },
    "reglas_diagnostico": [
        {"keywords": ["noche", "nit", "nits"], "severity": "low"},
        {"keywords": ["día", "dia", "durante el día"], "severity": "high"},
        {"keywords": ["ooteca", "cápsula", "capsula", "huevos"], "severity": "critical"},
    ],
    "prioridad_default": "media",
    "sistema_recomendado": {
        "recomendar": ["gel", "trampas", "monitorización", "seguimiento"],
        "no_recomendar": ["pulverizar"],
    },
    "tiempo_medio": {"visita_1": 45, "visita_2": 30},
    "material_medio": ["3 trampas", "25g gel", "2 pares guantes"],
    "riesgo": "medio",
    "dificultad": 3,
    "coste_interno": {"tiempo_tecnico": 52, "material": 18, "desplazamiento": 12},
    "reglas_comerciales": [
        {"condition": {"field": "metros_cuadrados", "op": "lt", "value": 80}, "precio_venta": 220},
        {"condition": {"field": "metros_cuadrados", "op": "gt", "value": 120}, "precio_venta": 250},
        {"condition": {"field": "metros_cuadrados", "op": "gt", "value": 200}, "action": "visita_tecnica"},
    ],
    "bloqueos_presupuesto": [
        {
            "condition": {"field": "where_comunidad", "op": "eq", "value": "todo_edificio"},
            "message_key": "comunidad_completa",
        },
        {"condition": {"field": "metros_cuadrados", "op": "gt", "value": 500}, "message_key": "metros_excesivos"},
    ],
    "copy_comercial": {
        "ca": (
            "Segons la informació facilitada, recomanem un tractament professional compost per "
            "dues actuacions, amb gel insecticida d'alta eficàcia i trampes de monitorització."
        ),
        "es": (
            "Según la información facilitada, recomendamos un tratamiento profesional compuesto por "
            "dos actuaciones, con gel insecticida de alta eficacia y trampas de monitorización."
        ),
    },
    "objeciones": [
        {
            "trigger": "solo una visita",
            "respuesta_ca": "Podem fer una única actuació, tot i que la recomanació professional són dos tractaments.",
            "respuesta_es": "Podemos realizar una única actuación, aunque nuestra recomendación profesional son dos tratamientos.",
        },
    ],
    "garantia_meses": 12,
}


class FichaEngineTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        FichaServicio.objects.create(**CUC_GER_PISO)

    def _agent(self, **kwargs) -> AgentState:
        base = AgentState(pest_type=PestType.GERMAN_COCKROACH, property_type="particular")
        return base.model_copy(update=kwargs)

    def test_find_ficha_by_pest_and_client(self):
        agent = self._agent()
        diagnostic = {"path": "particular"}
        ficha = find_ficha(agent, diagnostic)
        self.assertIsNotNone(ficha)
        assert ficha is not None
        self.assertEqual(ficha.codigo, "CUC-GER-PISO")

    def test_diagnosis_noche_baja(self):
        ficha = FichaServicio.objects.get(codigo="CUC-GER-PISO")
        ctx = CaseContext(
            agent=self._agent(),
            diagnostic={"path": "particular"},
            message="Las veo solo por la noche en la cocina",
        )
        self.assertEqual(evaluate_diagnosis_rules(ficha, ctx), "low")

    def test_diagnosis_dia_alta(self):
        ficha = FichaServicio.objects.get(codigo="CUC-GER-PISO")
        ctx = CaseContext(
            agent=self._agent(),
            diagnostic={"path": "particular"},
            message="Las veo de día en la cocina",
        )
        self.assertEqual(evaluate_diagnosis_rules(ficha, ctx), "high")

    def test_pricing_m2_menor_80(self):
        agent = self._agent()
        diagnostic = {"path": "particular", "where": "cocina", "metros_cuadrados": 65, "codigo_postal": "08001"}
        result = evaluate_ficha_pricing(agent, diagnostic, lang="es")
        self.assertIsNotNone(result)
        assert result is not None
        self.assertTrue(result.can_quote)
        self.assertEqual(result.final_price, 220.0)
        self.assertGreaterEqual(result.confidence, 70)

    def test_pricing_m2_mayor_200_visita(self):
        agent = self._agent()
        diagnostic = {"path": "particular", "metros_cuadrados": 250, "codigo_postal": "08001", "where": "cocina"}
        result = evaluate_ficha_pricing(agent, diagnostic, lang="es")
        self.assertIsNotNone(result)
        assert result is not None
        self.assertFalse(result.can_quote)
        self.assertTrue(result.schedule_inspection)

    def test_bloqueo_metros_excesivos(self):
        agent = self._agent()
        diagnostic = {
            "path": "particular",
            "metros_cuadrados": 600,
            "codigo_postal": "08001",
            "where": "cocina",
        }
        result = evaluate_ficha_pricing(agent, diagnostic, lang="es")
        self.assertIsNotNone(result)
        assert result is not None
        self.assertFalse(result.can_quote)
        self.assertEqual(result.block_reason, "metros_excesivos")

    def test_baja_confianza_sin_datos(self):
        agent = self._agent()
        diagnostic = {"path": "particular"}
        result = evaluate_ficha_pricing(agent, diagnostic, lang="es")
        self.assertIsNotNone(result)
        assert result is not None
        self.assertFalse(result.can_quote)
        self.assertTrue(result.schedule_inspection)
        self.assertLess(result.confidence, 70)

    def test_severity_mapping(self):
        self.assertEqual(severity_to_agent("high"), Severity.HIGH)
