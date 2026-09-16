/**
 * Reserva de citas en el chat cliente.
 * Temporalmente desactivada: no hay acceso a la agenda iGEO.
 * Reactivar: VITE_ENABLE_CLIENT_SCHEDULING=true y AGENT_ENABLE_CLIENT_SCHEDULING=true
 */
export const ENABLE_CLIENT_SCHEDULING =
  String(import.meta.env.VITE_ENABLE_CLIENT_SCHEDULING || '').toLowerCase() === 'true';
