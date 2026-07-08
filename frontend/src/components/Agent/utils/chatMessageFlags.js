export function isBudgetRequest(text) {
  const lower = (text || '').toLowerCase();
  return lower.includes('presupuesto') || lower.includes('pressupost');
}

export function isBudgetReply(content) {
  const lower = (content || '').toLowerCase();
  return (
    lower.includes('presupuesto estimado') ||
    lower.includes('pressupost estimat') ||
    lower.includes('desglose') ||
    lower.includes('desglossament') ||
    lower.includes('garantía') ||
    lower.includes('garantia')
  );
}

export function shouldShowPostBudgetCTAs(userMessage, reply) {
  return isBudgetRequest(userMessage) || isBudgetReply(reply);
}
