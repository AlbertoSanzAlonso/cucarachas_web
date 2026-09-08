import { getAgendaConfig } from '../core/config.js'
import { minutesToTime, timeToMinutes } from '../core/time/index.js'
import type {
  Appointment,
  AppointmentSeriesMeta,
  BookableService,
  DayScheduleAppointment,
  DayScheduleBlock,
  ServiceCategory,
  StaffDaySchedule,
} from '../core/types/index.js'
import type { AgendaAuthMode, AgendaDataSource, DayScheduleResult } from './types.js'

export type MemoryStaffSeed = {
  id: string
  name: string
  role: string | null
  /** Login username for staffLogin (defaults to `name`) */
  username?: string
  password?: string
  windows?: { startTime: string; endTime: string }[]
}

export type MemoryAppointmentSeed = {
  id?: string
  staffId: string
  serviceId: string
  date: string
  startTime: string
  durationMinutes?: number
  customerName?: string
  customerPhone?: string
  customerEmail?: string | null
  notes?: string | null
  status?: string
}

export type MemoryBlockSeed = {
  id?: string
  staffId: string
  date: string
  startTime: string
  endTime: string
  note?: string | null
}

export type MemoryAgendaSeed = {
  staff?: MemoryStaffSeed[]
  services?: BookableService[]
  categories?: ServiceCategory[]
  appointments?: MemoryAppointmentSeed[]
  blocks?: MemoryBlockSeed[]
  salonWindows?: { startTime: string; endTime: string }[]
  /** Default working windows when a staff member has none */
  defaultWindows?: { startTime: string; endTime: string }[]
  /** Token accepted for admin mode (default `"admin"`) */
  adminToken?: string
}

type StoredAppointment = {
  id: string
  staffId: string
  serviceId: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  customerName: string
  customerPhone: string
  customerEmail: string | null
  notes: string | null
  status: string
  createdAt: string
  seriesId: string | null
  scope: string | null
}

type StoredBlock = {
  id: string
  staffId: string
  date: string
  startTime: string
  endTime: string
  note: string | null
}

type StaffSession = { staffId: string; staffName: string }

const DEFAULT_WINDOWS = [
  { startTime: '09:00', endTime: '14:00' },
  { startTime: '16:00', endTime: '20:00' },
]

const DEFAULT_STAFF: MemoryStaffSeed[] = [
  {
    id: 'staff-1',
    name: 'Ana',
    role: 'Estilista',
    username: 'ana',
    password: 'ana',
  },
  {
    id: 'staff-2',
    name: 'Luis',
    role: 'Estilista',
    username: 'luis',
    password: 'luis',
  },
]

const DEFAULT_SERVICES: BookableService[] = [
  {
    id: 'svc-cut',
    nameEs: 'Corte',
    nameEn: 'Cut',
    durationMinutes: 30,
    categoryId: 'cat-hair',
  },
  {
    id: 'svc-color',
    nameEs: 'Color',
    nameEn: 'Color',
    durationMinutes: 60,
    categoryId: 'cat-hair',
  },
]

const DEFAULT_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-hair',
    nameEs: 'Peluquería',
    nameEn: 'Hair',
    sortOrder: 1,
    priceFromCents: 1500,
    priceNote: null,
  },
]

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function endTimeFrom(startTime: string, durationMinutes: number): string {
  return minutesToTime(timeToMinutes(startTime) + durationMinutes)
}

function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd)
}

function buildFreeSlots(
  windows: { startTime: string; endTime: string }[],
  occupied: { startTime: string; endTime: string }[],
  slotMinutes: number,
): string[] {
  const free: string[] = []
  for (const window of windows) {
    let cursor = timeToMinutes(window.startTime)
    const end = timeToMinutes(window.endTime)
    while (cursor + slotMinutes <= end) {
      const startTime = minutesToTime(cursor)
      const endTime = minutesToTime(cursor + slotMinutes)
      const blocked = occupied.some((o) => rangesOverlap(startTime, endTime, o.startTime, o.endTime))
      if (!blocked) free.push(startTime)
      cursor += slotMinutes
    }
  }
  return free
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asOptionalString(value: unknown): string | null {
  if (value == null) return null
  return typeof value === 'string' ? value : null
}

export function createMemoryAgendaDataSource(seed?: MemoryAgendaSeed): AgendaDataSource {
  const adminToken = seed?.adminToken ?? 'admin'
  const defaultWindows = seed?.defaultWindows ?? DEFAULT_WINDOWS
  const salonWindows = seed?.salonWindows ?? defaultWindows
  const slotMinutes = getAgendaConfig().slotMinutes

  const staffList: MemoryStaffSeed[] = (seed?.staff ?? DEFAULT_STAFF).map((s) => ({
    ...s,
    windows: s.windows ?? defaultWindows,
    username: s.username ?? s.name.toLowerCase(),
    password: s.password ?? 'demo',
  }))

  const services = [...(seed?.services ?? DEFAULT_SERVICES)]
  const categories = [...(seed?.categories ?? DEFAULT_CATEGORIES)]

  const appointments = new Map<string, StoredAppointment>()
  for (const raw of seed?.appointments ?? []) {
    const service = services.find((s) => s.id === raw.serviceId)
    const duration = raw.durationMinutes ?? service?.durationMinutes ?? 30
    const id = raw.id ?? newId('apt')
    appointments.set(id, {
      id,
      staffId: raw.staffId,
      serviceId: raw.serviceId,
      date: raw.date,
      startTime: raw.startTime,
      endTime: endTimeFrom(raw.startTime, duration),
      durationMinutes: duration,
      customerName: raw.customerName ?? 'Cliente',
      customerPhone: raw.customerPhone ?? '+34000000000',
      customerEmail: raw.customerEmail ?? null,
      notes: raw.notes ?? null,
      status: raw.status ?? 'confirmed',
      createdAt: new Date().toISOString(),
      seriesId: null,
      scope: null,
    })
  }

  const blocks = new Map<string, StoredBlock>()
  for (const raw of seed?.blocks ?? []) {
    const id = raw.id ?? newId('blk')
    blocks.set(id, {
      id,
      staffId: raw.staffId,
      date: raw.date,
      startTime: raw.startTime,
      endTime: raw.endTime,
      note: raw.note ?? null,
    })
  }

  const sessions = new Map<string, StaffSession>()

  function requireAdmin(token: string): void {
    if (token !== adminToken) throw new Error('Unauthorized admin token')
  }

  function resolveStaffSession(token: string): StaffSession {
    const session = sessions.get(token)
    if (!session) throw new Error('Unauthorized staff token')
    return session
  }

  function assertAuth(token: string, mode: AgendaAuthMode): StaffSession | null {
    if (mode === 'admin') {
      requireAdmin(token)
      return null
    }
    return resolveStaffSession(token)
  }

  function serviceById(id: string): BookableService | undefined {
    return services.find((s) => s.id === id)
  }

  function staffById(id: string): MemoryStaffSeed | undefined {
    return staffList.find((s) => s.id === id)
  }

  function toDayAppointment(apt: StoredAppointment): DayScheduleAppointment {
    const service = serviceById(apt.serviceId)
    const staff = staffById(apt.staffId)
    return {
      id: apt.id,
      startTime: apt.startTime,
      endTime: apt.endTime,
      durationMinutes: apt.durationMinutes,
      serviceId: apt.serviceId,
      serviceName: service?.nameEs ?? apt.serviceId,
      staffId: apt.staffId,
      staffName: staff?.name ?? apt.staffId,
      categoryId: service?.categoryId ?? null,
      customerName: apt.customerName,
      customerPhone: apt.customerPhone,
      customerEmail: apt.customerEmail,
      notes: apt.notes,
      status: apt.status,
      createdAt: apt.createdAt,
      occupiedSlots: [{ startTime: apt.startTime, endTime: apt.endTime }],
      seriesId: apt.seriesId,
      scope: apt.scope,
    }
  }

  function toFlatAppointment(apt: StoredAppointment): Appointment {
    const service = serviceById(apt.serviceId)
    const staff = staffById(apt.staffId)
    return {
      id: apt.id,
      staffId: apt.staffId,
      staffName: staff?.name ?? null,
      serviceId: apt.serviceId,
      serviceName: service?.nameEs ?? apt.serviceId,
      durationMinutes: apt.durationMinutes,
      occupiedSlots: [{ startTime: apt.startTime, endTime: apt.endTime }],
      date: apt.date,
      startTime: apt.startTime,
      customerName: apt.customerName,
      customerPhone: apt.customerPhone,
      customerEmail: apt.customerEmail,
      notes: apt.notes,
      status: apt.status,
      createdAt: apt.createdAt,
      seriesId: apt.seriesId,
      scope: apt.scope,
    }
  }

  function buildStaffDaySchedule(staff: MemoryStaffSeed, date: string): StaffDaySchedule {
    const windows = staff.windows ?? defaultWindows
    const dayAppointments = [...appointments.values()]
      .filter((a) => a.staffId === staff.id && a.date === date && a.status !== 'cancelled')
      .map(toDayAppointment)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    const dayBlocks: DayScheduleBlock[] = [...blocks.values()]
      .filter((b) => b.staffId === staff.id && b.date === date)
      .map((b) => ({ id: b.id, startTime: b.startTime, endTime: b.endTime, note: b.note }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    const occupied = [
      ...dayAppointments.map((a) => ({ startTime: a.startTime, endTime: a.endTime })),
      ...dayBlocks.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
    ]

    return {
      staffId: staff.id,
      staffName: staff.name,
      working: windows.length > 0,
      windows,
      appointments: dayAppointments,
      blocks: dayBlocks,
      freeSlots: buildFreeSlots(windows, occupied, slotMinutes),
    }
  }

  function totalDuration(
    serviceIds: string[],
    serviceDurations?: (number | null)[],
  ): number {
    return serviceIds.reduce((sum, id, index) => {
      const override = serviceDurations?.[index]
      if (override != null && override > 0) return sum + override
      return sum + (serviceById(id)?.durationMinutes ?? slotMinutes)
    }, 0)
  }

  const source: AgendaDataSource = {
    async verifyAuth(token, mode) {
      if (mode === 'admin') {
        requireAdmin(token)
        return { ok: true as const }
      }
      const session = resolveStaffSession(token)
      return { ok: true as const, staffId: session.staffId, staffName: session.staffName }
    },

    async fetchDaySchedule(date, token, mode): Promise<DayScheduleResult> {
      const session = assertAuth(token, mode)
      const schedules =
        mode === 'staff' && session
          ? staffList
              .filter((s) => s.id === session.staffId)
              .map((s) => buildStaffDaySchedule(s, date))
          : staffList.map((s) => buildStaffDaySchedule(s, date))
      return { date, schedules, salonWindows }
    },

    async fetchAppointments(from, to, token) {
      requireAdmin(token)
      const list = [...appointments.values()]
        .filter((a) => a.date >= from && a.date <= to)
        .map(toFlatAppointment)
        .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
      return { appointments: list }
    },

    async fetchStaffList(token) {
      requireAdmin(token)
      return staffList.map((s) => ({ id: s.id, name: s.name, role: s.role }))
    },

    async fetchServices(token, staffId) {
      // Accept either admin or any staff session.
      if (token !== adminToken && !sessions.has(token)) {
        throw new Error('Unauthorized')
      }
      void staffId
      return [...services]
    },

    async fetchCategories(token) {
      if (token !== adminToken && !sessions.has(token)) {
        throw new Error('Unauthorized')
      }
      return [...categories]
    },

    async fetchSlots({
      date,
      serviceIds,
      staffId,
      token,
      mode,
      excludeAppointmentId,
      serviceDurations,
    }) {
      const session = assertAuth(token, mode)
      const resolvedStaffId = mode === 'staff' && session ? session.staffId : staffId
      const staff = staffById(resolvedStaffId)
      if (!staff) return { slots: [], slotsOverHours: [] }

      const duration = totalDuration(serviceIds, serviceDurations)
      const windows = staff.windows ?? defaultWindows
      const occupied = [
        ...[...appointments.values()]
          .filter(
            (a) =>
              a.staffId === resolvedStaffId &&
              a.date === date &&
              a.status !== 'cancelled' &&
              a.id !== excludeAppointmentId,
          )
          .map((a) => ({ startTime: a.startTime, endTime: a.endTime })),
        ...[...blocks.values()]
          .filter((b) => b.staffId === resolvedStaffId && b.date === date)
          .map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
      ]

      const slots: string[] = []
      for (const window of windows) {
        let cursor = timeToMinutes(window.startTime)
        const end = timeToMinutes(window.endTime)
        while (cursor + duration <= end) {
          const startTime = minutesToTime(cursor)
          const endTime = minutesToTime(cursor + duration)
          const blocked = occupied.some((o) =>
            rangesOverlap(startTime, endTime, o.startTime, o.endTime),
          )
          if (!blocked) slots.push(startTime)
          cursor += slotMinutes
        }
      }
      return { slots, slotsOverHours: [] }
    },

    async createAppointment(payload, token, mode) {
      const session = assertAuth(token, mode)
      const serviceIds = Array.isArray(payload.serviceIds)
        ? (payload.serviceIds as string[])
        : payload.serviceId
          ? [String(payload.serviceId)]
          : []
      if (!serviceIds.length) throw new Error('serviceId(s) required')

      const date = asString(payload.date)
      const startTime = asString(payload.startTime)
      const staffId =
        mode === 'staff' && session
          ? session.staffId
          : asString(payload.staffId)
      if (!date || !startTime || !staffId) throw new Error('date, startTime and staffId required')

      const serviceDurations = Array.isArray(payload.serviceDurations)
        ? (payload.serviceDurations as (number | null)[])
        : undefined

      const created: StoredAppointment[] = []
      let cursor = startTime
      const startTimes = Array.isArray(payload.serviceStartTimes)
        ? (payload.serviceStartTimes as string[])
        : undefined

      for (let i = 0; i < serviceIds.length; i++) {
        const serviceId = serviceIds[i]
        const duration =
          serviceDurations?.[i] != null && (serviceDurations[i] as number) > 0
            ? (serviceDurations[i] as number)
            : (serviceById(serviceId)?.durationMinutes ?? slotMinutes)
        const slotStart = startTimes?.[i] ?? cursor
        const id = newId('apt')
        const apt: StoredAppointment = {
          id,
          staffId,
          serviceId,
          date,
          startTime: slotStart,
          endTime: endTimeFrom(slotStart, duration),
          durationMinutes: duration,
          customerName:
            [asString(payload.customerFirstName), asString(payload.customerLastName)]
              .filter(Boolean)
              .join(' ')
              .trim() || asString(payload.customerName, 'Cliente'),
          customerPhone: asString(payload.customerPhone, '+34000000000'),
          customerEmail: asOptionalString(payload.customerEmail),
          notes: asOptionalString(payload.notes ?? payload.customerNotes),
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          seriesId: null,
          scope: asOptionalString(payload.scope),
        }
        appointments.set(id, apt)
        created.push(apt)
        cursor = apt.endTime
      }

      return { appointments: created.map(toFlatAppointment) }
    },

    async updateAppointment(id, patch, token, mode) {
      assertAuth(token, mode)
      const existing = appointments.get(id)
      if (!existing) throw new Error('Appointment not found')
      if (mode === 'staff') {
        const session = resolveStaffSession(token)
        if (existing.staffId !== session.staffId) throw new Error('Forbidden')
      }

      const serviceId = asString(patch.serviceId, existing.serviceId)
      const duration =
        typeof patch.durationMinutes === 'number'
          ? patch.durationMinutes
          : serviceById(serviceId)?.durationMinutes ?? existing.durationMinutes
      const startTime = asString(patch.startTime, existing.startTime)
      const date = asString(patch.date, existing.date)

      const next: StoredAppointment = {
        ...existing,
        staffId: asString(patch.staffId, existing.staffId),
        serviceId,
        date,
        startTime,
        durationMinutes: duration,
        endTime: endTimeFrom(startTime, duration),
        customerName: asString(patch.customerName, existing.customerName),
        customerPhone: asString(patch.customerPhone, existing.customerPhone),
        customerEmail:
          patch.customerEmail === undefined
            ? existing.customerEmail
            : asOptionalString(patch.customerEmail),
        notes: patch.notes === undefined ? existing.notes : asOptionalString(patch.notes),
        status: asString(patch.status, existing.status),
      }

      if (patch.customerFirstName != null || patch.customerLastName != null) {
        next.customerName = [
          asString(patch.customerFirstName, existing.customerName.split(' ')[0] ?? ''),
          asString(
            patch.customerLastName,
            existing.customerName.split(' ').slice(1).join(' '),
          ),
        ]
          .filter(Boolean)
          .join(' ')
          .trim()
      }

      appointments.set(id, next)
      return { appointment: toFlatAppointment(next) }
    },

    async cancelAppointment(id, token, mode) {
      assertAuth(token, mode)
      const existing = appointments.get(id)
      if (!existing) throw new Error('Appointment not found')
      if (mode === 'staff') {
        const session = resolveStaffSession(token)
        if (existing.staffId !== session.staffId) throw new Error('Forbidden')
      }
      const next = { ...existing, status: 'cancelled' }
      appointments.set(id, next)
      return { appointment: toFlatAppointment(next) }
    },

    async markNoShow(id, token, mode) {
      assertAuth(token, mode)
      const existing = appointments.get(id)
      if (!existing) throw new Error('Appointment not found')
      if (mode === 'staff') {
        const session = resolveStaffSession(token)
        if (existing.staffId !== session.staffId) throw new Error('Forbidden')
      }
      const next = { ...existing, status: 'no_show' }
      appointments.set(id, next)
      return { appointment: toFlatAppointment(next) }
    },

    async createBlock(payload, token, mode) {
      const session = assertAuth(token, mode)
      const staffId =
        mode === 'staff' && session ? session.staffId : asString(payload.staffId)
      const date = asString(payload.date)
      const startTime = asString(payload.startTime)
      const endTime = asString(payload.endTime)
      if (!staffId || !date || !startTime || !endTime) {
        throw new Error('staffId, date, startTime and endTime required')
      }
      const id = newId('blk')
      const block: StoredBlock = {
        id,
        staffId,
        date,
        startTime,
        endTime,
        note: asOptionalString(payload.note),
      }
      blocks.set(id, block)
      return { block }
    },

    async updateBlock(id, patch, token, mode) {
      assertAuth(token, mode)
      const existing = blocks.get(id)
      if (!existing) throw new Error('Block not found')
      if (mode === 'staff') {
        const session = resolveStaffSession(token)
        if (existing.staffId !== session.staffId) throw new Error('Forbidden')
      }
      const next: StoredBlock = {
        ...existing,
        startTime: asString(patch.startTime, existing.startTime),
        endTime: asString(patch.endTime, existing.endTime),
        note: patch.note === undefined ? existing.note : asOptionalString(patch.note),
      }
      blocks.set(id, next)
      return { block: next }
    },

    async deleteBlock(id, token, mode) {
      assertAuth(token, mode)
      const existing = blocks.get(id)
      if (!existing) throw new Error('Block not found')
      if (mode === 'staff') {
        const session = resolveStaffSession(token)
        if (existing.staffId !== session.staffId) throw new Error('Forbidden')
      }
      blocks.delete(id)
      return { ok: true as const }
    },

    async fetchAppointmentSeries(id, token, mode): Promise<AppointmentSeriesMeta> {
      assertAuth(token, mode)
      const apt = appointments.get(id)
      if (!apt) throw new Error('Appointment not found')
      return {
        appointmentId: apt.id,
        seriesId: apt.seriesId,
        scope: 'single',
        count: 1,
        dates: [apt.date],
        anchorDate: apt.date,
        startTime: apt.startTime,
        serviceName: serviceById(apt.serviceId)?.nameEs ?? apt.serviceId,
        customerName: apt.customerName,
      }
    },

    async previewSeries() {
      return { dates: [], conflicts: [], okDates: [] }
    },

    async staffLogin(username, password) {
      const staff = staffList.find(
        (s) =>
          (s.username ?? s.name).toLowerCase() === username.toLowerCase() &&
          (s.password ?? '') === password,
      )
      if (!staff) throw new Error('Invalid credentials')
      const token = newId('tok')
      sessions.set(token, { staffId: staff.id, staffName: staff.name })
      return { token, staff: { id: staff.id, name: staff.name } }
    },

    async staffLogout(token) {
      sessions.delete(token)
    },
  }

  return source
}
