const DEFAULT_FICHA_QUESTIONS = {
  particular: ['codigo_postal', 'metros_cuadrados'],
};

export async function fetchFichaWizardQuestions(path, pestType = 'german_cockroach') {
  const fallback = DEFAULT_FICHA_QUESTIONS[path] || [];
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  try {
    const params = new URLSearchParams({ path, pest_type: pestType });
    const response = await fetch(`${apiBase}/api/fichas/wizard/?${params}`, {
      credentials: 'include',
    });
    if (!response.ok) return fallback;
    const data = await response.json();
    return Array.isArray(data.questions) && data.questions.length ? data.questions : fallback;
  } catch {
    return fallback;
  }
}

export function getParticularMaxStep(fichaQuestions = []) {
  return 6 + fichaQuestions.length + 1;
}

export function isParticularExtraStep(step, fichaQuestions = []) {
  return step === getParticularMaxStep(fichaQuestions);
}

export function getParticularFichaField(step, fichaQuestions = []) {
  const index = step - 7;
  if (index < 0 || index >= fichaQuestions.length) return null;
  return fichaQuestions[index];
}
