/**
 * Base URL del backend.
 * En desarrollo, si no hay VITE_API_URL, usa localhost (evita pegar a producción por error).
 */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : 'https://api.cucarachasbarcelona.cat');

export default API_BASE;
