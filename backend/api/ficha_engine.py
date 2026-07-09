"""Motor de reglas de Ficha Maestra para diagnóstico y presupuesto del Bio-Assistent."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from api.agents.models import AgentState, PestType, Severity
from api.models import FichaServicio

_SEVERITY_RANK = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4,
}

_PATH_TO_CLIENT = {
    "particular": "particular",
    "empresa": "negoci",
    "admin": "comunitat",
    "comunidad": "comunitat",
}

_WIZARD_SEVERITY_FROM_QUANTITY = {
    "one": "low",
    "several": "medium",
    "many": "high",
    "nests": "critical",
}


@dataclass
class CaseContext:
    """Datos unificados del caso para evaluar reglas de ficha."""

    agent: AgentState
    diagnostic: dict[str, Any] = field(default_factory=dict)
    message: str = ""

    @property
    def client_type(self) -> str:
        path = str(self.diagnostic.get("path") or "").strip()
        if path in _PATH_TO_CLIENT:
            return _PATH_TO_CLIENT[path]
        if self.agent.property_type:
            return self.agent.property_type
        return "particular"

    @property
    def text_blob(self) -> str:
        parts = [
            self.message.lower(),
            " ".join(self.agent.technical_notes).lower(),
            str(self.diagnostic.get("extra_info") or "").lower(),
        ]
        for key, val in self.diagnostic.items():
            if val is not None and str(val).strip():
                parts.append(str(val).lower())
        return " ".join(parts)

    def get_field(self, name: str) -> Any:
        chat = self.agent.chat_diagnostic or {}
        if name in chat and chat[name] not in (None, ""):
            return chat[name]

        if name in self.diagnostic and self.diagnostic[name] not in (None, ""):
            return self.diagnostic[name]

        aliases = {
            "metros_cuadrados": ("m2", "metros", "metros_cuadrados", "superficie"),
            "codigo_postal": ("codigo_postal", "cp", "postal"),
            "where": ("where", "where_empresa", "where_admin", "where_comunidad"),
        }
        for key in aliases.get(name, (name,)):
            if key in self.diagnostic and self.diagnostic[key] not in (None, ""):
                return self.diagnostic[key]

        if name == "metros_cuadrados":
            return _extract_number_from_notes(self.agent.technical_notes, ("m²", "m2", "metros"))

        if name == "where_comunidad":
            return self.diagnostic.get("where_comunidad")

        if name == "pest_type" and self.agent.pest_type:
            return self.agent.pest_type.value

        return None


@dataclass
class FichaPricingResult:
    ficha_codigo: str
    can_quote: bool
    confidence: float
    use_llm: bool
    final_price: float | None = None
    price_range_min: float | None = None
    price_range_max: float | None = None
    breakdown: list[str] = field(default_factory=list)
    guarantee_months: int = 12
    commercial_copy: str = ""
    recommended_system: list[str] = field(default_factory=list)
    block_reason: str = ""
    severity: str | None = None
    schedule_inspection: bool = False


def _extract_number_from_notes(notes: list[str], hints: tuple[str, ...]) -> int | None:
    for note in notes:
        low = note.lower()
        if not any(h in low for h in hints):
            continue
        match = re.search(r"(\d{2,4})", note)
        if match:
            return int(match.group(1))
    return None


def _compare(op: str, left: Any, right: Any) -> bool:
    if left is None:
        return False
    try:
        if op == "eq":
            return str(left).lower() == str(right).lower()
        if op == "in":
            values = right if isinstance(right, (list, tuple, set)) else [right]
            return str(left).lower() in {str(v).lower() for v in values}
        left_num = float(left)
        right_num = float(right)
        if op == "lt":
            return left_num < right_num
        if op == "lte":
            return left_num <= right_num
        if op == "gt":
            return left_num > right_num
        if op == "gte":
            return left_num >= right_num
    except (TypeError, ValueError):
        return False
    return False


def _eval_condition(condition: dict, ctx: CaseContext) -> bool:
    field_name = condition.get("field", "")
    op = condition.get("op", "eq")
    value = condition.get("value")
    actual = ctx.get_field(field_name)
    if op == "contains":
        if actual is None:
            return False
        return str(value).lower() in str(actual).lower()
    if op == "keyword_in_text":
        keywords = value if isinstance(value, (list, tuple)) else [value]
        blob = ctx.text_blob
        return any(str(kw).lower() in blob for kw in keywords)
    return _compare(op, actual, value)


def find_ficha(agent: AgentState, diagnostic: dict | None = None) -> FichaServicio | None:
    diagnostic = diagnostic or {}
    qs = FichaServicio.objects.filter(activa=True)
    if agent.pest_type:
        qs = qs.filter(pest_type=agent.pest_type.value)

    client_type = CaseContext(agent, diagnostic).client_type
    for ficha in qs:
        tipos = ficha.tipos_cliente or []
        if not tipos or client_type in tipos:
            return ficha
    return None


def evaluate_diagnosis_rules(ficha: FichaServicio, ctx: CaseContext) -> str | None:
    """Devuelve severidad inferida por reglas de la ficha (low/medium/high/critical)."""
    best: str | None = None
    best_rank = 0
    blob = ctx.text_blob

    for rule in ficha.reglas_diagnostico or []:
        keywords = rule.get("keywords") or []
        if not any(str(kw).lower() in blob for kw in keywords):
            continue
        severity = str(rule.get("severity") or "medium")
        rank = _SEVERITY_RANK.get(severity, 2)
        if rank >= best_rank:
            best = severity
            best_rank = rank

    quantity = ctx.diagnostic.get("quantity")
    if quantity in _WIZARD_SEVERITY_FROM_QUANTITY:
        sev = _WIZARD_SEVERITY_FROM_QUANTITY[quantity]
        if _SEVERITY_RANK.get(sev, 0) > best_rank:
            best = sev

    return best


def _check_blocks(ficha: FichaServicio, ctx: CaseContext) -> tuple[bool, str]:
    for block in ficha.bloqueos_presupuesto or []:
        condition = block.get("condition") or {}
        if _eval_condition(condition, ctx):
            return True, str(block.get("message_key") or block.get("reason") or "blocked")
    return False, ""


def _apply_commercial_rules(
    ficha: FichaServicio, ctx: CaseContext
) -> tuple[float | None, float | None, float | None, list[str], bool]:
    """
    Returns: final_price, min, max, breakdown, schedule_inspection
    """
    breakdown: list[str] = []
    final_price: float | None = None
    price_min: float | None = None
    price_max: float | None = None
    schedule_inspection = False

    for rule in ficha.reglas_comerciales or []:
        condition = rule.get("condition") or {}
        if condition and not _eval_condition(condition, ctx):
            continue

        action = rule.get("action")
        if action == "visita_tecnica":
            schedule_inspection = True
            continue

        precio = rule.get("precio_venta")
        if precio is not None:
            price = float(precio)
            final_price = price
            breakdown.append(f"Tractament {ficha.nombre_comercial}: {price:.0f}€")

    if final_price is None and not schedule_inspection:
        prices = [
            float(r["precio_venta"])
            for r in (ficha.reglas_comerciales or [])
            if r.get("precio_venta") is not None and not r.get("condition")
        ]
        if prices:
            price_min = min(prices)
            price_max = max(prices)

    return final_price, price_min, price_max, breakdown, schedule_inspection


def _compute_confidence(ficha: FichaServicio, ctx: CaseContext, has_price: bool) -> float:
    score = 40.0
    if ctx.agent.pest_type:
        score += 15.0
    if ctx.get_field("where"):
        score += 10.0
    if evaluate_diagnosis_rules(ficha, ctx):
        score += 10.0

    mandatory = (ficha.preguntas_obligatorias or {}).get(ctx.client_type, [])
    if mandatory:
        answered = sum(1 for q in mandatory if ctx.get_field(q) is not None)
        score += (answered / len(mandatory)) * 35.0
    else:
        score += 15.0

    if has_price:
        score += 5.0

    critical_fields = ("metros_cuadrados", "codigo_postal")
    missing_critical = [f for f in critical_fields if f in mandatory and ctx.get_field(f) is None]
    score -= len(missing_critical) * 12.0

    return max(0.0, min(100.0, round(score, 1)))


def _confidence_tier(confidence: float) -> str:
    if confidence >= 95:
        return "green"
    if confidence >= 70:
        return "yellow"
    return "red"


def evaluate_ficha_pricing(
    agent: AgentState,
    diagnostic: dict | None = None,
    *,
    message: str = "",
    lang: str = "ca",
) -> FichaPricingResult | None:
    from api.agents.chat_intake import build_unified_diagnostic

    diagnostic = build_unified_diagnostic(agent, diagnostic)
    ficha = find_ficha(agent, diagnostic)
    if not ficha:
        return None

    ctx = CaseContext(agent=agent, diagnostic=diagnostic, message=message)
    blocked, block_reason = _check_blocks(ficha, ctx)
    severity = evaluate_diagnosis_rules(ficha, ctx)

    copy = (ficha.copy_comercial or {}).get(lang) or (ficha.copy_comercial or {}).get("ca", "")
    recommended = (ficha.sistema_recomendado or {}).get("recomendar") or []
    guarantee = ficha.garantia_meses or 12

    if blocked:
        return FichaPricingResult(
            ficha_codigo=ficha.codigo,
            can_quote=False,
            confidence=0.0,
            use_llm=False,
            commercial_copy=copy,
            recommended_system=recommended,
            block_reason=block_reason,
            severity=severity,
            schedule_inspection=True,
            guarantee_months=guarantee,
        )

    final_price, price_min, price_max, breakdown, schedule_inspection = _apply_commercial_rules(
        ficha, ctx
    )

    if schedule_inspection:
        return FichaPricingResult(
            ficha_codigo=ficha.codigo,
            can_quote=False,
            confidence=_compute_confidence(ficha, ctx, False),
            use_llm=False,
            commercial_copy=copy,
            recommended_system=recommended,
            block_reason="visita_tecnica",
            severity=severity,
            schedule_inspection=True,
            guarantee_months=guarantee,
        )

    has_price = final_price is not None or (price_min is not None and price_max is not None)
    confidence = _compute_confidence(ficha, ctx, has_price)
    tier = _confidence_tier(confidence)

    if tier == "red" or not has_price:
        return FichaPricingResult(
            ficha_codigo=ficha.codigo,
            can_quote=False,
            confidence=confidence,
            use_llm=confidence >= 50,
            commercial_copy=copy,
            recommended_system=recommended,
            severity=severity,
            schedule_inspection=True,
            guarantee_months=guarantee,
        )

    if final_price is not None:
        return FichaPricingResult(
            ficha_codigo=ficha.codigo,
            can_quote=True,
            confidence=confidence,
            use_llm=tier == "yellow",
            final_price=final_price,
            price_range_min=final_price if tier == "green" else final_price * 0.95,
            price_range_max=final_price if tier == "green" else final_price * 1.05,
            breakdown=breakdown or [f"Tractament {ficha.nombre_comercial}"],
            commercial_copy=copy,
            recommended_system=recommended,
            severity=severity,
            guarantee_months=guarantee,
        )

    return FichaPricingResult(
        ficha_codigo=ficha.codigo,
        can_quote=True,
        confidence=confidence,
        use_llm=tier == "yellow",
        price_range_min=price_min,
        price_range_max=price_max,
        breakdown=breakdown or [f"Tractament {ficha.nombre_comercial}"],
        commercial_copy=copy,
        recommended_system=recommended,
        severity=severity,
        guarantee_months=guarantee,
    )


def severity_to_agent(severity: str | None) -> Severity | None:
    if not severity:
        return None
    mapping = {
        "low": Severity.LOW,
        "medium": Severity.MEDIUM,
        "high": Severity.HIGH,
        "critical": Severity.CRITICAL,
    }
    return mapping.get(severity)


def format_ficha_context(ficha: FichaServicio, lang: str = "ca") -> str:
    """Texto para inyectar en el prompt del pricer cuando se usa LLM."""
    copy = (ficha.copy_comercial or {}).get(lang, "")
    sistema = ficha.sistema_recomendado or {}
    rec = ", ".join(sistema.get("recomendar") or [])
    no_rec = ", ".join(sistema.get("no_recomendar") or [])
    coste = ficha.coste_interno or {}
    coste_total = sum(float(v) for v in coste.values() if v)
    lines = [
        f"Ficha: {ficha.codigo} — {ficha.nombre_comercial}",
        f"Sistema recomendado: {rec}",
    ]
    if no_rec:
        lines.append(f"No recomendar: {no_rec}")
    if coste_total:
        lines.append(f"Coste interno referencia: {coste_total:.0f}€")
    if copy:
        lines.append(f"Copy comercial: {copy}")
    return "\n".join(lines)


def match_objection(ficha: FichaServicio, message: str, lang: str = "ca") -> str | None:
    low = message.lower()
    for obj in ficha.objeciones or []:
        trigger = str(obj.get("trigger") or "").lower()
        if trigger and trigger in low:
            key = f"respuesta_{lang}"
            return obj.get(key) or obj.get("respuesta_ca")
    return None
