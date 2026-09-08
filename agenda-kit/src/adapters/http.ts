import type {
  Appointment,
  AppointmentSeriesMeta,
  BookableService,
  ServiceCategory,
  StaffDaySchedule,
} from '../core/types/index.js'
import type { AgendaDataSource, DayScheduleResult } from './types.js'

export type HttpAgendaDataSourceOptions = {
  /** Base URL including `/api`, e.g. `http://localhost:3001/api` */
  baseUrl: string
  fetchFn?: typeof fetch
}

export class AgendaHttpError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'AgendaHttpError'
    this.status = status
    this.body = body
  }
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function asAppointmentsArray(data: {
  appointments?: unknown[]
  appointment?: unknown
}): { appointments: unknown[] } {
  if (Array.isArray(data.appointments)) return { appointments: data.appointments }
  if (data.appointment != null) return { appointments: [data.appointment] }
  return { appointments: [] }
}

export function createHttpAgendaDataSource(
  options: HttpAgendaDataSourceOptions,
): AgendaDataSource {
  const baseUrl = trimTrailingSlash(options.baseUrl)
  const fetchFn = options.fetchFn ?? fetch

  async function request<T>(
    path: string,
    token: string | null,
    init?: RequestInit,
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(init?.headers as Record<string, string> | undefined),
    }
    if (token) {
      Object.assign(headers, authHeaders(token))
    } else if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json'
    }

    const res = await fetchFn(`${baseUrl}${path}`, {
      ...init,
      headers,
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      const message =
        typeof body === 'object' &&
        body &&
        'error' in body &&
        typeof (body as { error?: unknown }).error === 'string'
          ? (body as { error: string }).error
          : `HTTP ${res.status}`
      throw new AgendaHttpError(message, res.status, body)
    }
    return body as T
  }

  const source: AgendaDataSource = {
    async verifyAuth(token, mode) {
      if (mode === 'staff') {
        const data = await request<{
          ok: true
          staff?: { id: string; name: string }
        }>('/me/verify', token)
        return {
          ok: true as const,
          staffId: data.staff?.id,
          staffName: data.staff?.name,
        }
      }
      await request<{ ok: true }>('/auth/verify', token)
      return { ok: true as const }
    },

    async fetchDaySchedule(date, token, mode): Promise<DayScheduleResult> {
      if (mode === 'staff') {
        const data = await request<{
          date: string
          schedule: StaffDaySchedule | null
          salonWindows?: { startTime: string; endTime: string }[]
        }>(`/me/schedule?date=${encodeURIComponent(date)}`, token)
        return {
          date: data.date ?? date,
          schedules: data.schedule ? [data.schedule] : [],
          salonWindows: Array.isArray(data.salonWindows) ? data.salonWindows : undefined,
        }
      }

      const data = await request<{
        date: string
        schedules?: StaffDaySchedule[]
        salonWindows?: { startTime: string; endTime: string }[]
      }>(`/schedule/day?date=${encodeURIComponent(date)}`, token)

      return {
        date: data.date ?? date,
        schedules: Array.isArray(data.schedules) ? data.schedules : [],
        salonWindows: Array.isArray(data.salonWindows) ? data.salonWindows : [],
      }
    },

    async fetchAppointments(from, to, token) {
      const params = new URLSearchParams({ from, to })
      const data = await request<{ appointments?: Appointment[] }>(
        `/appointments?${params}`,
        token,
      )
      return { appointments: Array.isArray(data.appointments) ? data.appointments : [] }
    },

    async fetchStaffList(token) {
      const data = await request<{
        staff?: { id: string; name: string; role: string | null }[]
      }>('/admin/staff', token)
      return Array.isArray(data.staff) ? data.staff : []
    },

    async fetchServices(token, staffId) {
      if (staffId) {
        const params = new URLSearchParams({ staffId })
        const scoped = await request<{ services?: BookableService[] }>(
          `/schedule/services?${params}`,
          token,
        )
        return Array.isArray(scoped.services) ? scoped.services : []
      }

      // Staff sessions: /me/services. Admin tokens typically get 401/403 → /admin/services.
      try {
        const mine = await request<{ services?: BookableService[] }>('/me/services', token)
        if (Array.isArray(mine.services)) return mine.services
      } catch (err) {
        if (!(err instanceof AgendaHttpError) || (err.status !== 401 && err.status !== 403)) {
          throw err
        }
      }

      const data = await request<{ services?: BookableService[] }>('/admin/services', token)
      return Array.isArray(data.services) ? data.services : []
    },

    async fetchCategories(token) {
      const data = await request<{ categories?: ServiceCategory[] }>(
        '/admin/service-categories',
        token,
      )
      return Array.isArray(data.categories) ? data.categories : []
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
      const params = new URLSearchParams({
        date,
        serviceIds: serviceIds.join(','),
      })
      if (excludeAppointmentId) params.set('excludeAppointmentId', excludeAppointmentId)
      if (serviceDurations?.length) {
        params.set(
          'serviceDurations',
          serviceDurations
            .map((d) => (d != null && d > 0 ? String(d) : ''))
            .join(','),
        )
      }

      if (mode === 'staff') {
        const data = await request<{ slots?: string[]; slotsOverHours?: string[] }>(
          `/me/slots?${params}`,
          token,
        )
        return {
          slots: Array.isArray(data.slots) ? data.slots : [],
          slotsOverHours: Array.isArray(data.slotsOverHours) ? data.slotsOverHours : [],
        }
      }

      params.set('staffId', staffId)
      const data = await request<{ slots?: string[]; slotsOverHours?: string[] }>(
        `/schedule/slots?${params}`,
        token,
      )
      return {
        slots: Array.isArray(data.slots) ? data.slots : [],
        slotsOverHours: Array.isArray(data.slotsOverHours) ? data.slotsOverHours : [],
      }
    },

    async createAppointment(payload, token, mode) {
      if (mode === 'staff') {
        const data = await request<{ appointment?: unknown; appointments?: unknown[] }>(
          '/me/appointments',
          token,
          { method: 'POST', body: JSON.stringify(payload) },
        )
        return asAppointmentsArray(data)
      }
      const data = await request<{ appointment?: unknown; appointments?: unknown[] }>(
        '/schedule/appointments',
        token,
        { method: 'POST', body: JSON.stringify(payload) },
      )
      return asAppointmentsArray(data)
    },

    async updateAppointment(id, patch, token, mode) {
      if (mode === 'staff') {
        return request<{ appointment: unknown }>(`/me/appointments/${encodeURIComponent(id)}`, token, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        })
      }
      return request<{ appointment: unknown }>(
        `/schedule/appointments/${encodeURIComponent(id)}`,
        token,
        { method: 'PATCH', body: JSON.stringify(patch) },
      )
    },

    async cancelAppointment(id, token, mode, options) {
      if (mode === 'staff') {
        const qs = options?.mode && options.mode !== 'single' ? `?mode=${encodeURIComponent(options.mode)}` : ''
        // Staff API cancels via DELETE (no PATCH cancel route).
        return request(`/me/appointments/${encodeURIComponent(id)}${qs}`, token, {
          method: 'DELETE',
        })
      }
      return request(`/appointments/${encodeURIComponent(id)}/cancel`, token, {
        method: 'PATCH',
        body: JSON.stringify({ mode: options?.mode }),
      })
    },

    async markNoShow(id, token, mode) {
      if (mode === 'staff') {
        return request(`/me/appointments/${encodeURIComponent(id)}/no-show`, token, {
          method: 'PATCH',
          body: JSON.stringify({}),
        })
      }
      return request(`/appointments/${encodeURIComponent(id)}/no-show`, token, {
        method: 'PATCH',
        body: JSON.stringify({}),
      })
    },

    async createBlock(payload, token, mode) {
      if (mode === 'staff') {
        return request('/me/blocks', token, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      return request('/schedule/blocks', token, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    async updateBlock(id, patch, token, mode) {
      if (mode === 'staff') {
        return request(`/me/blocks/${encodeURIComponent(id)}`, token, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        })
      }
      return request(`/schedule/blocks/${encodeURIComponent(id)}`, token, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
    },

    async deleteBlock(id, token, mode, options) {
      const params = new URLSearchParams()
      if (options) {
        for (const [key, value] of Object.entries(options)) {
          if (value == null) continue
          params.set(key, String(value))
        }
      }
      if (!params.has('mode')) params.set('mode', 'single')
      const qs = `?${params}`
      if (mode === 'staff') {
        return request(`/me/blocks/${encodeURIComponent(id)}${qs}`, token, { method: 'DELETE' })
      }
      return request(`/schedule/blocks/${encodeURIComponent(id)}${qs}`, token, {
        method: 'DELETE',
      })
    },

    async fetchAppointmentSeries(id, token, mode) {
      if (mode === 'staff') {
        const data = await request<{ series: AppointmentSeriesMeta }>(
          `/me/appointments/${encodeURIComponent(id)}/series`,
          token,
        )
        return data.series
      }
      const data = await request<{ series: AppointmentSeriesMeta }>(
        `/schedule/appointments/${encodeURIComponent(id)}/series`,
        token,
      )
      return data.series
    },

    async previewSeries(payload, token, mode) {
      if (mode === 'staff') {
        return request('/me/appointments/preview-series', token, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      return request('/schedule/appointments/preview-series', token, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    async staffLogin(username, password) {
      const data = await request<{
        token: string
        staff: { id: string; name: string }
      }>('/auth/staff/login', null, {
        method: 'POST',
        body: JSON.stringify({ name: username, password }),
      })
      return data
    },

    async staffLogout(token) {
      await request('/auth/staff/logout', token, { method: 'POST' })
    },
  }

  return source
}
