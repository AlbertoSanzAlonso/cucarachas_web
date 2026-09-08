import { randomUUID } from 'node:crypto'
import type { Sql } from 'postgres'
import type {
  AgendaLifecycleHooks,
  AppointmentRow,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from './types.js'

function runHook(
  fn: ((apt: unknown) => void | Promise<void>) | undefined,
  apt: unknown,
): void {
  if (!fn) return
  void Promise.resolve(fn(apt)).catch((err) => {
    console.error('agenda-kit hook error', err)
  })
}

export async function getAppointmentById(
  sql: Sql,
  id: string,
): Promise<AppointmentRow | undefined> {
  const rows = await sql<AppointmentRow[]>`
    SELECT * FROM appointments WHERE id = ${id} LIMIT 1
  `
  return rows[0]
}

export async function listAppointments(
  sql: Sql,
  opts: { staffId?: string; from: string; to: string },
): Promise<AppointmentRow[]> {
  if (opts.staffId) {
    return sql<AppointmentRow[]>`
      SELECT * FROM appointments
      WHERE staff_id = ${opts.staffId}
        AND date >= ${opts.from}
        AND date <= ${opts.to}
      ORDER BY date, start_time
    `
  }
  return sql<AppointmentRow[]>`
    SELECT * FROM appointments
    WHERE date >= ${opts.from}
      AND date <= ${opts.to}
    ORDER BY date, start_time
  `
}

/**
 * Crea una cita simple.
 * No hace auto-split de coloración: si vienen color_group_* se guardan tal cual.
 */
export async function createAppointment(
  sql: Sql,
  input: CreateAppointmentInput,
  hooks?: AgendaLifecycleHooks,
): Promise<AppointmentRow> {
  const serviceRows = await sql<{ duration_minutes: number }[]>`
    SELECT duration_minutes FROM services WHERE id = ${input.serviceId} LIMIT 1
  `
  if (!serviceRows[0]) throw new Error('SERVICIO_INVALIDO')

  const duration = input.durationMinutes ?? serviceRows[0].duration_minutes
  const id = randomUUID()
  const now = new Date().toISOString()

  const rows = await sql<AppointmentRow[]>`
    INSERT INTO appointments (
      id, staff_id, service_id, date, start_time, duration_minutes,
      customer_name, customer_phone, customer_email, notes, status, locale,
      series_id, booking_group_id, color_group_id, color_group_role, origin,
      created_at, updated_at
    ) VALUES (
      ${id},
      ${input.staffId},
      ${input.serviceId},
      ${input.date},
      ${input.startTime},
      ${duration},
      ${input.customerName.trim()},
      ${input.customerPhone.trim()},
      ${input.customerEmail?.trim() || null},
      ${input.notes?.trim() || null},
      'confirmed',
      ${input.locale ?? 'es'},
      ${input.seriesId ?? null},
      ${input.bookingGroupId ?? null},
      ${input.colorGroupId ?? null},
      ${input.colorGroupRole ?? null},
      ${input.origin ?? null},
      ${now},
      ${now}
    )
    RETURNING *
  `

  const apt = rows[0]!
  runHook(hooks?.onAppointmentCreated, apt)
  return apt
}

export async function updateAppointment(
  sql: Sql,
  id: string,
  input: UpdateAppointmentInput,
  hooks?: AgendaLifecycleHooks,
): Promise<AppointmentRow> {
  const existing = await getAppointmentById(sql, id)
  if (!existing) throw new Error('CITA_NO_ENCONTRADA')

  const staffId = input.staffId ?? existing.staff_id
  const serviceId = input.serviceId ?? existing.service_id
  const date = input.date ?? existing.date
  const startTime = input.startTime ?? existing.start_time
  const durationMinutes = input.durationMinutes ?? existing.duration_minutes
  const customerName = input.customerName ?? existing.customer_name
  const customerPhone = input.customerPhone ?? existing.customer_phone
  const customerEmail =
    input.customerEmail !== undefined ? input.customerEmail : existing.customer_email
  const notes = input.notes !== undefined ? input.notes : existing.notes
  const locale = input.locale ?? existing.locale
  const seriesId = input.seriesId !== undefined ? input.seriesId : existing.series_id
  const bookingGroupId =
    input.bookingGroupId !== undefined ? input.bookingGroupId : existing.booking_group_id
  const colorGroupId =
    input.colorGroupId !== undefined ? input.colorGroupId : existing.color_group_id
  const colorGroupRole =
    input.colorGroupRole !== undefined ? input.colorGroupRole : existing.color_group_role
  const origin = input.origin !== undefined ? input.origin : existing.origin
  const status = input.status ?? existing.status
  const now = new Date().toISOString()

  const rows = await sql<AppointmentRow[]>`
    UPDATE appointments SET
      staff_id = ${staffId},
      service_id = ${serviceId},
      date = ${date},
      start_time = ${startTime},
      duration_minutes = ${durationMinutes},
      customer_name = ${customerName},
      customer_phone = ${customerPhone},
      customer_email = ${customerEmail},
      notes = ${notes},
      locale = ${locale},
      series_id = ${seriesId},
      booking_group_id = ${bookingGroupId},
      color_group_id = ${colorGroupId},
      color_group_role = ${colorGroupRole},
      origin = ${origin},
      status = ${status},
      updated_at = ${now}
    WHERE id = ${id}
    RETURNING *
  `

  const apt = rows[0]!
  runHook(hooks?.onAppointmentUpdated, apt)
  return apt
}

export async function cancelAppointment(
  sql: Sql,
  id: string,
  hooks?: AgendaLifecycleHooks,
): Promise<AppointmentRow> {
  const existing = await getAppointmentById(sql, id)
  if (!existing) throw new Error('CITA_NO_ENCONTRADA')

  const now = new Date().toISOString()
  const rows = await sql<AppointmentRow[]>`
    UPDATE appointments
    SET status = 'cancelled', updated_at = ${now}
    WHERE id = ${id}
    RETURNING *
  `
  const apt = rows[0]!
  runHook(hooks?.onAppointmentCancelled, apt)
  return apt
}

export async function markAppointmentNoShow(
  sql: Sql,
  id: string,
  hooks?: AgendaLifecycleHooks,
): Promise<AppointmentRow> {
  const existing = await getAppointmentById(sql, id)
  if (!existing) throw new Error('CITA_NO_ENCONTRADA')

  const now = new Date().toISOString()
  const rows = await sql<AppointmentRow[]>`
    UPDATE appointments
    SET status = 'no_show', updated_at = ${now}
    WHERE id = ${id}
    RETURNING *
  `
  const apt = rows[0]!
  runHook(hooks?.onAppointmentNoShow, apt)
  return apt
}

/** Forma pública mínima (camelCase) para respuestas JSON. */
export function appointmentToPublic(row: AppointmentRow) {
  return {
    id: row.id,
    staffId: row.staff_id,
    serviceId: row.service_id,
    date: row.date,
    startTime: row.start_time,
    durationMinutes: row.duration_minutes,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    notes: row.notes,
    status: row.status,
    locale: row.locale,
    seriesId: row.series_id,
    bookingGroupId: row.booking_group_id,
    colorGroupId: row.color_group_id,
    colorGroupRole: row.color_group_role,
    origin: row.origin,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
