export type AgendaLifecycleHooks = {
  onAppointmentCreated?: (apt: unknown) => void | Promise<void>
  onAppointmentUpdated?: (apt: unknown) => void | Promise<void>
  onAppointmentCancelled?: (apt: unknown) => void | Promise<void>
  onAppointmentNoShow?: (apt: unknown) => void | Promise<void>
}

export type AgendaRouterOptions = {
  /** Cliente `postgres` (tagged templates). */
  sql: import('postgres').Sql
  adminSecret: string
  timezone?: string
  slotMinutes?: number
  hooks?: AgendaLifecycleHooks
}

/** Fila mínima de staff para auth / respuestas. */
export type StaffSessionUser = {
  id: string
  name: string
  role: string | null
}

export type AppointmentRow = {
  id: string
  staff_id: string | null
  service_id: string
  date: string
  start_time: string
  duration_minutes: number
  customer_name: string
  customer_phone: string
  customer_email: string | null
  notes: string | null
  status: string
  locale: string
  series_id: string | null
  booking_group_id: string | null
  color_group_id: string | null
  color_group_role: string | null
  origin: string | null
  created_at: string
  updated_at: string
}

export type BlockRow = {
  id: string
  staff_id: string
  date: string
  start_time: string
  end_time: string
  note: string | null
  series_id: string | null
  scope: string | null
  created_at: string
}

export type CreateAppointmentInput = {
  staffId: string
  serviceId: string
  date: string
  startTime: string
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  notes?: string | null
  locale?: 'es' | 'en'
  seriesId?: string | null
  bookingGroupId?: string | null
  colorGroupId?: string | null
  colorGroupRole?: string | null
  origin?: string | null
  /** Si se omite, se toma de `services.duration_minutes`. */
  durationMinutes?: number
}

export type UpdateAppointmentInput = {
  staffId?: string
  serviceId?: string
  date?: string
  startTime?: string
  durationMinutes?: number
  customerName?: string
  customerPhone?: string
  customerEmail?: string | null
  notes?: string | null
  locale?: 'es' | 'en'
  seriesId?: string | null
  bookingGroupId?: string | null
  colorGroupId?: string | null
  colorGroupRole?: string | null
  origin?: string | null
  status?: string
}

export type CreateBlockInput = {
  staffId: string
  date: string
  startTime: string
  endTime: string
  note?: string | null
  seriesId?: string | null
  scope?: string | null
}

export type UpdateBlockInput = {
  date?: string
  startTime?: string
  endTime?: string
  note?: string | null
  seriesId?: string | null
  scope?: string | null
}
