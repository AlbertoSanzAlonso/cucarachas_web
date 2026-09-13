/** Persistencia del chat home entre rutas y recargas de pestaña. */
const STORAGE_KEY = 'cecsa_home_chat_v1';

export function loadHomeChatState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    return {
      messages: parsed.messages,
      isOpen: Boolean(parsed.isOpen),
    };
  } catch {
    return null;
  }
}

export function saveHomeChatState({ messages, isOpen }) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        messages: messages || [],
        isOpen: Boolean(isOpen),
        updatedAt: Date.now(),
      })
    );
  } catch {
    // Quota / modo privado: la UI sigue en memoria
  }
}

export function homeChatHasUserTurns(messages) {
  return Array.isArray(messages) && messages.some((m) => m?.role === 'user');
}
