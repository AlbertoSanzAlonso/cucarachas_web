/** Default Spanish labels; host may override via AgendaLabelsProvider. */
export type AgendaLabels = {
  blocked: string
  washColor: string
  save: string
  cancel: string
  close: string
  createAppointment: string
  editAppointment: string
  createBlock: string
  unblock: string
  noShow: string
  movePending: string
  saveMoves: string
  discardMoves: string
  loading: string
  today: string
  previousDay: string
  nextDay: string
  login: string
  logout: string
  professionalNotFound: string
  timeUnavailable: string
}

export const DEFAULT_AGENDA_LABELS_ES: AgendaLabels = {
  blocked: 'Bloqueado',
  washColor: 'Lavar color',
  save: 'Guardar',
  cancel: 'Cancelar',
  close: 'Cerrar',
  createAppointment: 'Nueva cita',
  editAppointment: 'Editar cita',
  createBlock: 'Bloquear',
  unblock: 'Desbloquear',
  noShow: 'No presentado',
  movePending: 'Movimientos pendientes',
  saveMoves: 'Guardar cambios',
  discardMoves: 'Descartar',
  loading: 'Cargando…',
  today: 'Hoy',
  previousDay: 'Día anterior',
  nextDay: 'Día siguiente',
  login: 'Entrar',
  logout: 'Salir',
  professionalNotFound: 'Profesional no encontrado.',
  timeUnavailable: 'La hora seleccionada no está disponible',
}
