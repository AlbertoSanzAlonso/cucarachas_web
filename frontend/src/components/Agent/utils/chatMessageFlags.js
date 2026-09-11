export function isBudgetRequest(text) {
  const lower = (text || '').toLowerCase();
  if (
    lower.includes('presupuesto') ||
    lower.includes('pressupost') ||
    lower.includes('precio') ||
    lower.includes('precios') ||
    lower.includes('preu') ||
    lower.includes('preus')
  ) {
    return true;
  }
  // Abreviaturas: «presu», «presi», «presup», «pressu»
  return /(?:^|[^a-záéíóúüñ])(presu|presi|presup|pressu)(?:[^a-záéíóúüñ]|$)/i.test(lower);
}

export function isBudgetReply(content) {
  const lower = (content || '').toLowerCase();
  return (
    lower.includes('presupuesto estimado') ||
    lower.includes('pressupost estimat') ||
    (lower.includes('desglose') && lower.includes('€')) ||
    (lower.includes('desglossament') && (lower.includes('€') || lower.includes('eur'))) ||
    (lower.includes('garantía') && lower.includes('€')) ||
    (lower.includes('garantia') && lower.includes('€'))
  );
}

export function shouldShowPostBudgetCTAs(userMessage, reply) {
  // Solo tras un presupuesto numérico real
  return isBudgetReply(reply);
}
