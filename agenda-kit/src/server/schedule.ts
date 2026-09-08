import type { Sql } from 'postgres'
import {
  dayOfWeekFromDateString,
  minutesToTime,
  timeToMinutes,
} from '../core/time/index.js'
import type { StaffDaySchedule } from '../core/types/index.js'
import type { AgendaRouterOptions } from './types.js'

type WindowRow = { start_time: string; end_time: string }

type StaffRow = { id: string; name: string }

type AptJoinRow = {
  id: string
  start_time: string
  duration_minutes: number
  service_id: string
  service_name_es: string
  staff_id: string
  staff_name: string
  category_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  notes: string | null
  status: string
  created_at: string
  booking_pattern: unknown
  color_group_id: string | null
  color_group_role: string | null
  booking_group_id: string | null
  series_id: string | null
  origin: string | null
  locale: string | null
}

type BlockRow = {
  id: string
  staff_id: string
  start_time: string
  end_time: string
  note: string | null
}

function endTimeFromStart(start: string, durationMinutes: number): string {
  return minutesToTime(timeToMinutes(start) + durationMinutes)
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd
}

function computeFreeSlots(
  windows: { startTime: string; endTime: string }[],
  occupied: { start: number; end: number }[],
  slotMinutes: number,
): string[] {
  const free: string[] = []
  for (const w of windows) {
    const wStart = timeToMinutes(w.startTime)
    const wEnd = timeToMinutes(w.endTime)
    for (let t = wStart; t + slotMinutes <= wEnd; t += slotMinutes) {
      const slotEnd = t + slotMinutes
      const overlaps = occupied.some((o) => rangesOverlap(t, slotEnd, o.start, o.end))
      if (!overlaps) free.push(minutesToTime(t))
    }
  }
  return free
}

async function loadWindowsForStaff(
  sql: Sql,
  staffId: string,
  dayOfWeek: number,
): Promise<WindowRow[]> {
  const staffWindows = await sql<WindowRow[]>`
    SELECT start_time, end_time
    FROM staff_availability
    WHERE staff_id = ${staffId} AND day_of_week = ${dayOfWeek}
    ORDER BY start_time
  `
  if (staffWindows.length > 0) return staffWindows

  return sql<WindowRow[]>`
    SELECT start_time, end_time
    FROM salon_schedule
    WHERE day_of_week = ${dayOfWeek}
    ORDER BY start_time
  `
}

/**
 * Agenda de un día para todos los profesionales activos (o uno si `staffId`).
 * Huecos libres: cada `slotMinutes` dentro de ventanas, sin solapar citas/bloqueos.
 */
export async function buildDaySchedule(
  sql: Sql,
  date: string,
  options: Pick<AgendaRouterOptions, 'slotMinutes'> & { staffId?: string } = {},
): Promise<StaffDaySchedule[]> {
  const slotMinutes = options.slotMinutes ?? 30
  const dayOfWeek = dayOfWeekFromDateString(date)

  const staffRows = options.staffId
    ? await sql<StaffRow[]>`
        SELECT id, name FROM staff
        WHERE active = TRUE AND id = ${options.staffId}
        ORDER BY name
      `
    : await sql<StaffRow[]>`
        SELECT id, name FROM staff
        WHERE active = TRUE
        ORDER BY name
      `

  if (staffRows.length === 0) return []

  const staffIds = staffRows.map((s) => s.id)

  const appointments = await sql<AptJoinRow[]>`
    SELECT
      a.id,
      a.start_time,
      a.duration_minutes,
      a.service_id,
      sv.name_es AS service_name_es,
      a.staff_id,
      st.name AS staff_name,
      sv.category_id,
      a.customer_name,
      a.customer_phone,
      a.customer_email,
      a.notes,
      a.status,
      a.created_at,
      sv.booking_pattern,
      a.color_group_id,
      a.color_group_role,
      a.booking_group_id,
      a.series_id,
      a.origin,
      a.locale
    FROM appointments a
    INNER JOIN services sv ON sv.id = a.service_id
    LEFT JOIN staff st ON st.id = a.staff_id
    WHERE a.date = ${date}
      AND a.status NOT IN ('cancelled', 'canceled')
      AND a.staff_id = ANY(${staffIds})
    ORDER BY a.start_time
  `

  const blocks = await sql<BlockRow[]>`
    SELECT id, staff_id, start_time, end_time, note
    FROM staff_time_blocks
    WHERE date = ${date}
      AND staff_id = ANY(${staffIds})
    ORDER BY start_time
  `

  const result: StaffDaySchedule[] = []

  for (const staff of staffRows) {
    const windowRows = await loadWindowsForStaff(sql, staff.id, dayOfWeek)
    const windows = windowRows.map((w) => ({
      startTime: w.start_time,
      endTime: w.end_time,
    }))
    const working = windows.length > 0

    const staffApts = appointments.filter((a) => a.staff_id === staff.id)
    const staffBlocks = blocks.filter((b) => b.staff_id === staff.id)

    const occupied = [
      ...staffApts.map((a) => ({
        start: timeToMinutes(a.start_time),
        end: timeToMinutes(a.start_time) + a.duration_minutes,
      })),
      ...staffBlocks.map((b) => ({
        start: timeToMinutes(b.start_time),
        end: timeToMinutes(b.end_time),
      })),
    ]

    const freeSlots = working ? computeFreeSlots(windows, occupied, slotMinutes) : []

    result.push({
      staffId: staff.id,
      staffName: staff.name,
      working,
      windows,
      appointments: staffApts.map((a) => {
        const endTime = endTimeFromStart(a.start_time, a.duration_minutes)
        return {
          id: a.id,
          startTime: a.start_time,
          endTime,
          durationMinutes: a.duration_minutes,
          serviceId: a.service_id,
          serviceName: a.service_name_es,
          staffId: a.staff_id,
          staffName: a.staff_name ?? staff.name,
          categoryId: a.category_id,
          customerName: a.customer_name,
          customerPhone: a.customer_phone,
          customerEmail: a.customer_email,
          notes: a.notes,
          status: a.status,
          createdAt:
            typeof a.created_at === 'string'
              ? a.created_at
              : new Date(a.created_at).toISOString(),
          occupiedSlots: [{ startTime: a.start_time, endTime }],
          // Sin plugin de coloración: no interpretamos booking_pattern
          bookingPattern: null,
          colorGroupId: a.color_group_id,
          colorGroupRole: a.color_group_role,
          bookingGroupId: a.booking_group_id,
          seriesId: a.series_id,
          origin: a.origin,
          customerLocale: a.locale === 'en' ? 'en' : a.locale === 'es' ? 'es' : undefined,
        }
      }),
      blocks: staffBlocks.map((b) => ({
        id: b.id,
        startTime: b.start_time,
        endTime: b.end_time,
        note: b.note,
      })),
      freeSlots,
    })
  }

  return result
}

/** Huecos libres de un profesional para una duración concreta. */
export async function getFreeSlotsForStaff(
  sql: Sql,
  date: string,
  staffId: string,
  durationMinutes: number,
  options: Pick<AgendaRouterOptions, 'slotMinutes'> & {
    excludeAppointmentId?: string
  } = {},
): Promise<string[]> {
  const schedules = await buildDaySchedule(sql, date, {
    slotMinutes: options.slotMinutes,
    staffId,
  })
  const day = schedules[0]
  if (!day?.working) return []

  const slotMinutes = options.slotMinutes ?? 30
  const occupied = [
    ...day.appointments
      .filter((a) => a.id !== options.excludeAppointmentId)
      .map((a) => ({
        start: timeToMinutes(a.startTime),
        end: timeToMinutes(a.endTime),
      })),
    ...day.blocks.map((b) => ({
      start: timeToMinutes(b.startTime),
      end: timeToMinutes(b.endTime),
    })),
  ]

  const free: string[] = []
  for (const w of day.windows) {
    const wStart = timeToMinutes(w.startTime)
    const wEnd = timeToMinutes(w.endTime)
    for (let t = wStart; t + durationMinutes <= wEnd; t += slotMinutes) {
      const slotEnd = t + durationMinutes
      if (!occupied.some((o) => rangesOverlap(t, slotEnd, o.start, o.end))) {
        free.push(minutesToTime(t))
      }
    }
  }
  return free
}
