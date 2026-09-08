import type {
  Appointment,
  AppointmentSeriesMeta,
  BookableService,
  ServiceCategory,
  StaffDaySchedule,
} from '../core/types/index.js'

export type DayScheduleResult = {
  date: string
  schedules: StaffDaySchedule[]
  salonWindows?: { startTime: string; endTime: string }[]
}

export type AgendaAuthMode = 'admin' | 'staff'

export type AgendaDataSource = {
  verifyAuth(
    token: string,
    mode: AgendaAuthMode,
  ): Promise<{ ok: true; staffId?: string; staffName?: string }>
  fetchDaySchedule(date: string, token: string, mode: AgendaAuthMode): Promise<DayScheduleResult>
  fetchAppointments?(
    from: string,
    to: string,
    token: string,
  ): Promise<{ appointments: Appointment[] }>
  fetchStaffList(token: string): Promise<{ id: string; name: string; role: string | null }[]>
  fetchServices(token: string, staffId?: string): Promise<BookableService[]>
  fetchCategories?(token: string): Promise<ServiceCategory[]>
  fetchSlots(params: {
    date: string
    serviceIds: string[]
    staffId: string
    token: string
    mode: AgendaAuthMode
    excludeAppointmentId?: string
    serviceDurations?: (number | null)[]
  }): Promise<{ slots: string[]; slotsOverHours: string[] }>
  createAppointment(
    payload: Record<string, unknown>,
    token: string,
    mode: AgendaAuthMode,
  ): Promise<{ appointments: unknown[] }>
  updateAppointment(
    id: string,
    patch: Record<string, unknown>,
    token: string,
    mode: AgendaAuthMode,
  ): Promise<{ appointment: unknown }>
  cancelAppointment(
    id: string,
    token: string,
    mode: AgendaAuthMode,
    options?: { mode?: string },
  ): Promise<unknown>
  markNoShow(id: string, token: string, mode: AgendaAuthMode): Promise<unknown>
  createBlock(
    payload: Record<string, unknown>,
    token: string,
    mode: AgendaAuthMode,
  ): Promise<unknown>
  updateBlock(
    id: string,
    patch: Record<string, unknown>,
    token: string,
    mode: AgendaAuthMode,
  ): Promise<unknown>
  deleteBlock(
    id: string,
    token: string,
    mode: AgendaAuthMode,
    options?: Record<string, unknown>,
  ): Promise<unknown>
  fetchAppointmentSeries?(
    id: string,
    token: string,
    mode: AgendaAuthMode,
  ): Promise<AppointmentSeriesMeta>
  previewSeries?(
    payload: Record<string, unknown>,
    token: string,
    mode: AgendaAuthMode,
  ): Promise<unknown>
  staffLogin?(
    username: string,
    password: string,
  ): Promise<{ token: string; staff: { id: string; name: string } }>
  staffLogout?(token: string): Promise<void>
}
