import { nowMinutesInTimezone, timeToMinutes, todayInTimezone } from '../time/index.js'

export const APPOINTMENT_STATUS_NO_SHOW = 'no_show'

/** Citas que no ocupan huecos en la agenda (canceladas o inasistencia). */
export function appointmentBlocksScheduleSlot(status: string): boolean {
  return status !== 'cancelled' && status !== APPOINTMENT_STATUS_NO_SHOW
}

/** La hora de inicio de la cita ya pasó en la zona configurada. */
export function isAppointmentStartPast(date: string, startTime: string): boolean {
  const today = todayInTimezone()
  if (date < today) return true
  if (date > today) return false
  return timeToMinutes(startTime) <= nowMinutesInTimezone()
}

export function canMarkAppointmentNoShow(
  date: string,
  startTime: string,
  status: string,
): boolean {
  if (status === 'cancelled' || status === APPOINTMENT_STATUS_NO_SHOW) return false
  return isAppointmentStartPast(date, startTime)
}
