/**
 * Memoria del chat home solo en RAM (SPA).
 * Sobrevive a cambios de ruta / remount del widget; se pierde al recargar el navegador.
 */

try {
  sessionStorage.removeItem('cecsa_home_chat_v1');
} catch {
  // ignore
}

let memory = {
  messages: null,
  isOpen: false,
};

export function getHomeChatMemory() {
  return memory;
}

export function setHomeChatMemory({ messages, isOpen }) {
  if (messages !== undefined) memory.messages = messages;
  if (isOpen !== undefined) memory.isOpen = Boolean(isOpen);
}

export function homeChatHasUserTurns(messages) {
  return Array.isArray(messages) && messages.some((m) => m?.role === 'user');
}
