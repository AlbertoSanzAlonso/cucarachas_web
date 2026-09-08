import { Hono } from 'hono'
import {
  getBearer,
  loginStaff,
  logoutStaff,
  requireAdmin,
  requireStaff,
} from './auth.js'
import {
  appointmentToPublic,
  cancelAppointment,
  createAppointment,
  getAppointmentById,
  listAppointments,
  markAppointmentNoShow,
  updateAppointment,
} from './appointments.js'
import {
  blockToPublic,
  createBlock,
  deleteBlock,
  getBlockById,
  listBlocks,
  updateBlock,
} from './blocks.js'
import { buildDaySchedule, getFreeSlotsForStaff } from './schedule.js'
import type { AgendaRouterOptions } from './types.js'

const errorMessages: Record<string, string> = {
  CREDENCIALES_INVALIDAS: 'Nombre o contraseña incorrectos',
  SERVICIO_INVALIDO: 'Servicio no válido',
  CITA_NO_ENCONTRADA: 'Cita no encontrada',
  BLOQUEO_NO_ENCONTRADO: 'Bloqueo no encontrado',
  RANGO_INVALIDO: 'La hora de fin debe ser posterior al inicio',
}

function mapError(err: unknown): string {
  const code = err instanceof Error ? err.message : 'ERROR'
  return errorMessages[code] ?? (err instanceof Error ? err.message : 'Error')
}

/**
 * Router Hono de agenda (sin prefijo `/api`: el host lo monta donde quiera).
 */
export function createAgendaRouter(options: AgendaRouterOptions): Hono {
  const { sql, adminSecret, hooks } = options
  const slotMinutes = options.slotMinutes ?? 30
  const app = new Hono()

  // ── Auth ──────────────────────────────────────────────────────────────

  app.get('/auth/verify', (c) => {
    if (!requireAdmin(c, adminSecret)) {
      return c.json({ error: 'No autorizado' }, 401)
    }
    return c.json({ ok: true })
  })

  app.post('/auth/staff/login', async (c) => {
    const body = await c.req.json<{ name?: string; password?: string }>().catch(() => null)
    if (!body?.name?.trim() || !body.password) {
      return c.json({ error: 'Introduce nombre y contraseña' }, 400)
    }
    try {
      const result = await loginStaff(sql, body.name, body.password)
      return c.json(result)
    } catch (err) {
      return c.json({ error: mapError(err) }, 401)
    }
  })

  app.post('/auth/staff/logout', async (c) => {
    const token = getBearer(c)
    if (token) await logoutStaff(sql, token)
    return c.json({ ok: true })
  })

  // ── Me (profesional) ──────────────────────────────────────────────────

  app.get('/me/verify', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    return c.json({ ok: true, staff })
  })

  app.get('/me/schedule', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    const date = c.req.query('date')
    if (!date) return c.json({ error: 'Falta date' }, 400)
    const schedule = await buildDaySchedule(sql, date, { slotMinutes, staffId: staff.id })
    return c.json({ date, schedule: schedule[0] ?? null })
  })

  app.get('/me/services', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    const services = await sql<
      {
        id: string
        name_es: string
        name_en: string
        duration_minutes: number
        category_id: string | null
        booking_pattern: unknown
      }[]
    >`
      SELECT s.id, s.name_es, s.name_en, s.duration_minutes, s.category_id, s.booking_pattern
      FROM services s
      INNER JOIN staff_services ss ON ss.service_id = s.id
      WHERE ss.staff_id = ${staff.id}
      ORDER BY s.name_es
    `
    return c.json({
      services: services.map((s) => ({
        id: s.id,
        nameEs: s.name_es,
        nameEn: s.name_en,
        durationMinutes: s.duration_minutes,
        categoryId: s.category_id,
        bookingPattern: s.booking_pattern,
      })),
    })
  })

  app.get('/me/slots', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    const date = c.req.query('date')
    const serviceId = c.req.query('serviceId')
    const exclude = c.req.query('excludeAppointmentId')
    if (!date || !serviceId) {
      return c.json({ error: 'Faltan date o serviceId' }, 400)
    }
    const svc = await sql<{ duration_minutes: number }[]>`
      SELECT duration_minutes FROM services WHERE id = ${serviceId} LIMIT 1
    `
    if (!svc[0]) return c.json({ error: 'Servicio no válido' }, 400)
    const slots = await getFreeSlotsForStaff(sql, date, staff.id, svc[0].duration_minutes, {
      slotMinutes,
      excludeAppointmentId: exclude,
    })
    return c.json({ slots })
  })

  app.get('/me/appointments', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    const from = c.req.query('from') ?? new Date().toISOString().slice(0, 10)
    const to = c.req.query('to') ?? from
    const rows = await listAppointments(sql, { staffId: staff.id, from, to })
    return c.json({ appointments: rows.map(appointmentToPublic) })
  })

  app.post('/me/appointments', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    const body = await c.req
      .json<{
        serviceId?: string
        date?: string
        startTime?: string
        customerName?: string
        customerPhone?: string
        customerEmail?: string
        notes?: string
        locale?: 'es' | 'en'
        colorGroupId?: string
        colorGroupRole?: string
        bookingGroupId?: string
        seriesId?: string
        origin?: string
      }>()
      .catch(() => null)
    if (
      !body?.serviceId ||
      !body.date ||
      !body.startTime ||
      !body.customerPhone?.trim() ||
      !body.customerName?.trim()
    ) {
      return c.json({ error: 'Datos incompletos' }, 400)
    }
    try {
      const apt = await createAppointment(
        sql,
        {
          staffId: staff.id,
          serviceId: body.serviceId,
          date: body.date,
          startTime: body.startTime,
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          customerEmail: body.customerEmail,
          notes: body.notes,
          locale: body.locale,
          colorGroupId: body.colorGroupId,
          colorGroupRole: body.colorGroupRole,
          bookingGroupId: body.bookingGroupId,
          seriesId: body.seriesId,
          origin: body.origin ?? 'staff',
        },
        hooks,
      )
      return c.json({ appointment: appointmentToPublic(apt) }, 201)
    } catch (err) {
      return c.json({ error: mapError(err) }, 400)
    }
  })

  app.patch('/me/appointments/:id', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    const id = c.req.param('id')
    const body = await c.req.json<Record<string, unknown>>().catch(() => null)
    if (!body) return c.json({ error: 'Datos incompletos' }, 400)
    try {
      const row = await getAppointmentById(sql, id)
      if (!row || row.staff_id !== staff.id) {
        return c.json({ error: 'Cita no encontrada' }, 404)
      }
      const apt = await updateAppointment(
        sql,
        id,
        {
          serviceId: typeof body.serviceId === 'string' ? body.serviceId : undefined,
          date: typeof body.date === 'string' ? body.date : undefined,
          startTime: typeof body.startTime === 'string' ? body.startTime : undefined,
          durationMinutes:
            typeof body.durationMinutes === 'number' ? body.durationMinutes : undefined,
          customerName: typeof body.customerName === 'string' ? body.customerName : undefined,
          customerPhone: typeof body.customerPhone === 'string' ? body.customerPhone : undefined,
          customerEmail:
            body.customerEmail === null || typeof body.customerEmail === 'string'
              ? (body.customerEmail as string | null)
              : undefined,
          notes:
            body.notes === null || typeof body.notes === 'string'
              ? (body.notes as string | null)
              : undefined,
          locale: body.locale === 'en' || body.locale === 'es' ? body.locale : undefined,
          colorGroupId:
            body.colorGroupId === null || typeof body.colorGroupId === 'string'
              ? (body.colorGroupId as string | null)
              : undefined,
          colorGroupRole:
            body.colorGroupRole === null || typeof body.colorGroupRole === 'string'
              ? (body.colorGroupRole as string | null)
              : undefined,
        },
        hooks,
      )
      return c.json({ appointment: appointmentToPublic(apt) })
    } catch (err) {
      return c.json({ error: mapError(err) }, 400)
    }
  })

  app.get('/me/blocks', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    const from = c.req.query('from') ?? new Date().toISOString().slice(0, 10)
    const to = c.req.query('to') ?? from
    const rows = await listBlocks(sql, { staffId: staff.id, from, to })
    return c.json({ blocks: rows.map(blockToPublic) })
  })

  app.post('/me/blocks', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    const body = await c.req
      .json<{
        date?: string
        startTime?: string
        endTime?: string
        note?: string
        seriesId?: string
        scope?: string
      }>()
      .catch(() => null)
    if (!body?.date || !body.startTime || !body.endTime) {
      return c.json({ error: 'Datos incompletos' }, 400)
    }
    try {
      const row = await createBlock(sql, {
        staffId: staff.id,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        note: body.note,
        seriesId: body.seriesId,
        scope: body.scope,
      })
      return c.json({ block: blockToPublic(row) }, 201)
    } catch (err) {
      return c.json({ error: mapError(err) }, 400)
    }
  })

  app.patch('/me/blocks/:id', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    const id = c.req.param('id')
    const body = await c.req.json<Record<string, unknown>>().catch(() => null)
    if (!body) return c.json({ error: 'Datos incompletos' }, 400)
    const existing = await getBlockById(sql, id)
    if (!existing || existing.staff_id !== staff.id) {
      return c.json({ error: 'Bloqueo no encontrado' }, 404)
    }
    try {
      const row = await updateBlock(sql, id, {
        date: typeof body.date === 'string' ? body.date : undefined,
        startTime: typeof body.startTime === 'string' ? body.startTime : undefined,
        endTime: typeof body.endTime === 'string' ? body.endTime : undefined,
        note:
          body.note === null || typeof body.note === 'string'
            ? (body.note as string | null)
            : undefined,
        scope: typeof body.scope === 'string' ? body.scope : undefined,
      })
      return c.json({ block: blockToPublic(row) })
    } catch (err) {
      return c.json({ error: mapError(err) }, 400)
    }
  })

  app.delete('/me/blocks/:id', async (c) => {
    const { error, staff } = await requireStaff(c, sql)
    if (error) return error
    const id = c.req.param('id')
    const existing = await getBlockById(sql, id)
    if (!existing || existing.staff_id !== staff.id) {
      return c.json({ error: 'Bloqueo no encontrado' }, 404)
    }
    await deleteBlock(sql, id)
    return c.json({ ok: true })
  })

  // ── Schedule ──────────────────────────────────────────────────────────

  app.get('/schedule/day', async (c) => {
    if (!requireAdmin(c, adminSecret)) return c.json({ error: 'No autorizado' }, 401)
    const date = c.req.query('date')
    if (!date) return c.json({ error: 'Falta date' }, 400)
    const schedule = await buildDaySchedule(sql, date, { slotMinutes })
    return c.json({ date, schedule })
  })

  app.get('/schedule/slots', async (c) => {
    const date = c.req.query('date')
    const serviceId = c.req.query('serviceId')
    const staffId = c.req.query('staffId')
    if (!date || !serviceId) {
      return c.json({ error: 'Faltan date o serviceId' }, 400)
    }
    const svc = await sql<{ duration_minutes: number }[]>`
      SELECT duration_minutes FROM services WHERE id = ${serviceId} LIMIT 1
    `
    if (!svc[0]) return c.json({ error: 'Servicio no válido' }, 400)

    if (staffId) {
      const slots = await getFreeSlotsForStaff(sql, date, staffId, svc[0].duration_minutes, {
        slotMinutes,
      })
      return c.json({ slots })
    }

    const day = await buildDaySchedule(sql, date, { slotMinutes })
    const byStaff: Record<string, string[]> = {}
    for (const s of day) {
      byStaff[s.staffId] = await getFreeSlotsForStaff(
        sql,
        date,
        s.staffId,
        svc[0].duration_minutes,
        { slotMinutes },
      )
    }
    return c.json({ slotsByStaff: byStaff })
  })

  app.get('/schedule/services', async (c) => {
    const services = await sql<
      {
        id: string
        name_es: string
        name_en: string
        duration_minutes: number
        category_id: string | null
        booking_pattern: unknown
      }[]
    >`
      SELECT id, name_es, name_en, duration_minutes, category_id, booking_pattern
      FROM services
      ORDER BY name_es
    `
    return c.json({
      services: services.map((s) => ({
        id: s.id,
        nameEs: s.name_es,
        nameEn: s.name_en,
        durationMinutes: s.duration_minutes,
        categoryId: s.category_id,
        bookingPattern: s.booking_pattern,
      })),
    })
  })

  app.post('/schedule/appointments', async (c) => {
    const isAdmin = requireAdmin(c, adminSecret)
    const body = await c.req
      .json<{
        staffId?: string
        serviceId?: string
        date?: string
        startTime?: string
        customerName?: string
        customerPhone?: string
        customerEmail?: string
        notes?: string
        locale?: 'es' | 'en'
        colorGroupId?: string
        colorGroupRole?: string
        bookingGroupId?: string
        seriesId?: string
        origin?: string
      }>()
      .catch(() => null)
    if (
      !body?.staffId ||
      !body.serviceId ||
      !body.date ||
      !body.startTime ||
      !body.customerPhone?.trim() ||
      !body.customerName?.trim()
    ) {
      return c.json({ error: 'Datos incompletos' }, 400)
    }
    try {
      const apt = await createAppointment(
        sql,
        {
          staffId: body.staffId,
          serviceId: body.serviceId,
          date: body.date,
          startTime: body.startTime,
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          customerEmail: body.customerEmail,
          notes: body.notes,
          locale: body.locale,
          colorGroupId: body.colorGroupId,
          colorGroupRole: body.colorGroupRole,
          bookingGroupId: body.bookingGroupId,
          seriesId: body.seriesId,
          origin: body.origin ?? (isAdmin ? 'admin' : 'online'),
        },
        hooks,
      )
      return c.json({ appointment: appointmentToPublic(apt) }, 201)
    } catch (err) {
      return c.json({ error: mapError(err) }, 400)
    }
  })

  app.patch('/schedule/appointments/:id', async (c) => {
    if (!requireAdmin(c, adminSecret)) return c.json({ error: 'No autorizado' }, 401)
    const id = c.req.param('id')
    const body = await c.req.json<Record<string, unknown>>().catch(() => null)
    if (!body) return c.json({ error: 'Datos incompletos' }, 400)
    try {
      const apt = await updateAppointment(
        sql,
        id,
        {
          staffId: typeof body.staffId === 'string' ? body.staffId : undefined,
          serviceId: typeof body.serviceId === 'string' ? body.serviceId : undefined,
          date: typeof body.date === 'string' ? body.date : undefined,
          startTime: typeof body.startTime === 'string' ? body.startTime : undefined,
          durationMinutes:
            typeof body.durationMinutes === 'number' ? body.durationMinutes : undefined,
          customerName: typeof body.customerName === 'string' ? body.customerName : undefined,
          customerPhone: typeof body.customerPhone === 'string' ? body.customerPhone : undefined,
          customerEmail:
            body.customerEmail === null || typeof body.customerEmail === 'string'
              ? (body.customerEmail as string | null)
              : undefined,
          notes:
            body.notes === null || typeof body.notes === 'string'
              ? (body.notes as string | null)
              : undefined,
          locale: body.locale === 'en' || body.locale === 'es' ? body.locale : undefined,
          status: typeof body.status === 'string' ? body.status : undefined,
          colorGroupId:
            body.colorGroupId === null || typeof body.colorGroupId === 'string'
              ? (body.colorGroupId as string | null)
              : undefined,
          colorGroupRole:
            body.colorGroupRole === null || typeof body.colorGroupRole === 'string'
              ? (body.colorGroupRole as string | null)
              : undefined,
          bookingGroupId:
            body.bookingGroupId === null || typeof body.bookingGroupId === 'string'
              ? (body.bookingGroupId as string | null)
              : undefined,
          seriesId:
            body.seriesId === null || typeof body.seriesId === 'string'
              ? (body.seriesId as string | null)
              : undefined,
        },
        hooks,
      )
      return c.json({ appointment: appointmentToPublic(apt) })
    } catch (err) {
      return c.json({ error: mapError(err) }, 400)
    }
  })

  app.patch('/appointments/:id/cancel', async (c) => {
    const isAdmin = requireAdmin(c, adminSecret)
    const staffAuth = isAdmin ? null : await requireStaff(c, sql)
    if (!isAdmin && staffAuth?.error) return staffAuth.error

    const id = c.req.param('id')
    try {
      if (!isAdmin && staffAuth?.staff) {
        const row = await getAppointmentById(sql, id)
        if (!row || row.staff_id !== staffAuth.staff.id) {
          return c.json({ error: 'Cita no encontrada' }, 404)
        }
      }
      const apt = await cancelAppointment(sql, id, hooks)
      return c.json({ appointment: appointmentToPublic(apt) })
    } catch (err) {
      return c.json({ error: mapError(err) }, 400)
    }
  })

  app.patch('/appointments/:id/no-show', async (c) => {
    const isAdmin = requireAdmin(c, adminSecret)
    const staffAuth = isAdmin ? null : await requireStaff(c, sql)
    if (!isAdmin && staffAuth?.error) return staffAuth.error

    const id = c.req.param('id')
    try {
      if (!isAdmin && staffAuth?.staff) {
        const row = await getAppointmentById(sql, id)
        if (!row || row.staff_id !== staffAuth.staff.id) {
          return c.json({ error: 'Cita no encontrada' }, 404)
        }
      }
      const apt = await markAppointmentNoShow(sql, id, hooks)
      return c.json({ appointment: appointmentToPublic(apt) })
    } catch (err) {
      return c.json({ error: mapError(err) }, 400)
    }
  })

  // ── Blocks (admin) ────────────────────────────────────────────────────

  app.get('/schedule/blocks', async (c) => {
    if (!requireAdmin(c, adminSecret)) return c.json({ error: 'No autorizado' }, 401)
    const from = c.req.query('from') ?? c.req.query('date') ?? new Date().toISOString().slice(0, 10)
    const to = c.req.query('to') ?? from
    const staffId = c.req.query('staffId')
    const rows = await listBlocks(sql, { staffId: staffId || undefined, from, to })
    return c.json({ blocks: rows.map(blockToPublic) })
  })

  app.post('/schedule/blocks', async (c) => {
    if (!requireAdmin(c, adminSecret)) return c.json({ error: 'No autorizado' }, 401)
    const body = await c.req
      .json<{
        staffId?: string
        date?: string
        startTime?: string
        endTime?: string
        note?: string
        seriesId?: string
        scope?: string
      }>()
      .catch(() => null)
    if (!body?.staffId || !body.date || !body.startTime || !body.endTime) {
      return c.json({ error: 'Datos incompletos' }, 400)
    }
    try {
      const row = await createBlock(sql, {
        staffId: body.staffId,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        note: body.note,
        seriesId: body.seriesId,
        scope: body.scope,
      })
      return c.json({ block: blockToPublic(row) }, 201)
    } catch (err) {
      return c.json({ error: mapError(err) }, 400)
    }
  })

  app.patch('/schedule/blocks/:id', async (c) => {
    if (!requireAdmin(c, adminSecret)) return c.json({ error: 'No autorizado' }, 401)
    const id = c.req.param('id')
    const body = await c.req.json<Record<string, unknown>>().catch(() => null)
    if (!body) return c.json({ error: 'Datos incompletos' }, 400)
    try {
      const row = await updateBlock(sql, id, {
        date: typeof body.date === 'string' ? body.date : undefined,
        startTime: typeof body.startTime === 'string' ? body.startTime : undefined,
        endTime: typeof body.endTime === 'string' ? body.endTime : undefined,
        note:
          body.note === null || typeof body.note === 'string'
            ? (body.note as string | null)
            : undefined,
        scope: typeof body.scope === 'string' ? body.scope : undefined,
        seriesId:
          body.seriesId === null || typeof body.seriesId === 'string'
            ? (body.seriesId as string | null)
            : undefined,
      })
      return c.json({ block: blockToPublic(row) })
    } catch (err) {
      return c.json({ error: mapError(err) }, 400)
    }
  })

  app.delete('/schedule/blocks/:id', async (c) => {
    if (!requireAdmin(c, adminSecret)) return c.json({ error: 'No autorizado' }, 401)
    const id = c.req.param('id')
    const ok = await deleteBlock(sql, id)
    if (!ok) return c.json({ error: 'Bloqueo no encontrado' }, 404)
    return c.json({ ok: true })
  })

  // ── Admin catálogo ────────────────────────────────────────────────────

  app.get('/admin/staff', async (c) => {
    if (!requireAdmin(c, adminSecret)) return c.json({ error: 'No autorizado' }, 401)
    const rows = await sql<{ id: string; name: string; role: string | null; active: boolean }[]>`
      SELECT id, name, role, active FROM staff ORDER BY name
    `
    return c.json({
      staff: rows.map((r) => ({
        id: r.id,
        name: r.name,
        role: r.role,
        active: r.active,
      })),
    })
  })

  app.get('/admin/services', async (c) => {
    if (!requireAdmin(c, adminSecret)) return c.json({ error: 'No autorizado' }, 401)
    const rows = await sql<
      {
        id: string
        name_es: string
        name_en: string
        duration_minutes: number
        category_id: string | null
        booking_pattern: unknown
      }[]
    >`
      SELECT id, name_es, name_en, duration_minutes, category_id, booking_pattern
      FROM services
      ORDER BY name_es
    `
    return c.json({
      services: rows.map((s) => ({
        id: s.id,
        nameEs: s.name_es,
        nameEn: s.name_en,
        durationMinutes: s.duration_minutes,
        categoryId: s.category_id,
        bookingPattern: s.booking_pattern,
      })),
    })
  })

  app.get('/admin/service-categories', async (c) => {
    if (!requireAdmin(c, adminSecret)) return c.json({ error: 'No autorizado' }, 401)
    const rows = await sql<
      { id: string; name_es: string; name_en: string; sort_order: number }[]
    >`
      SELECT id, name_es, name_en, sort_order
      FROM service_categories
      ORDER BY sort_order, name_es
    `
    return c.json({
      categories: rows.map((r) => ({
        id: r.id,
        nameEs: r.name_es,
        nameEn: r.name_en,
        sortOrder: r.sort_order,
      })),
    })
  })

  return app
}
