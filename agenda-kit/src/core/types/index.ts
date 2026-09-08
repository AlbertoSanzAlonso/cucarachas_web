import type { ServiceBookingPattern } from '../occupancy/servicePattern.js'

export type ServiceCategory = {
  id: string
  nameEs: string
  nameEn: string
  sortOrder: number
  priceFromCents: number | null
  priceNote: string | null
}

export type BookableService = {
  id: string
  nameEs: string
  nameEn: string
  durationMinutes: number
  categoryId: string | null
  showDurationInBooking?: boolean
  bookingPattern?: ServiceBookingPattern | null
}

export type StaffMember = {
  id: string
  name: string
  role: string | null
}

export type AppointmentOccupiedSlot = {
  startTime: string
  endTime: string
}

export type Appointment = {
  id: string
  staffId: string | null
  staffName: string | null
  serviceId: string
  serviceName: string
  durationMinutes: number
  occupiedSlots?: AppointmentOccupiedSlot[]
  colorGroupRole?: string | null
  date: string
  startTime: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  notes: string | null
  status: string
  locale?: 'es' | 'en'
  createdAt: string
  seriesId?: string | null
  scope?: string | null
  bookingGroupId?: string | null
  origin?: string | null
}

export type ColorGroupLinkedPhase = {
  id: string
  startTime: string
  endTime: string
  serviceId: string
  serviceName: string
  staffId: string
  staffName: string
  categoryId: string | null
}

export type DayScheduleAppointment = {
  id: string
  startTime: string
  endTime: string
  durationMinutes: number
  serviceId: string
  serviceName: string
  staffId: string
  staffName: string
  categoryId: string | null
  customerName: string
  customerPhone: string
  customerEmail: string | null
  customerNotes?: string | null
  customerLocale?: 'es' | 'en'
  notes: string | null
  status: string
  createdAt: string
  occupiedSlots: AppointmentOccupiedSlot[]
  bookingPattern?: ServiceBookingPattern | null
  colorGroupId?: string | null
  colorGroupRole?: string | null
  bookingGroupId?: string | null
  colorGroupLinked?: ColorGroupLinkedPhase | null
  seriesId?: string | null
  scope?: string | null
  origin?: string | null
}

export type DayScheduleBlock = {
  id: string
  startTime: string
  endTime: string
  note: string | null
}

export type StaffDaySchedule = {
  staffId: string
  staffName: string
  working: boolean
  windows: { startTime: string; endTime: string }[]
  appointments: DayScheduleAppointment[]
  blocks: DayScheduleBlock[]
  freeSlots: string[]
}

export type CreateAppointmentPayload = {
  serviceId?: string
  serviceIds?: string[]
  staffId: string
  staffAssignments?: string[]
  serviceStartTimes?: string[]
  date: string
  startTime: string
  customerName?: string
  customerPhone: string
  customerEmail?: string
  notes?: string
  locale?: 'es' | 'en'
  birthdate?: string
  returningCustomer?: boolean
  force?: boolean
  seriesWeeklyCount?: number
}

export type BlockScope = 'single' | 'range' | 'weekly'

export type BlockSeriesMeta = {
  blockId: string
  seriesId: string | null
  scope: BlockScope | 'legacy'
  count: number
  dates: string[]
  anchorDate: string
  startTime: string
  endTime: string
}

export type PendingBlockGroup = {
  startTime: string
  endTime: string
}

export type AppointmentRecurrenceScope = Extract<BlockScope, 'single' | 'weekly'>

export type AppointmentSeriesMeta = {
  appointmentId: string
  seriesId: string | null
  scope: AppointmentRecurrenceScope | 'legacy'
  count: number
  dates: string[]
  anchorDate: string
  startTime: string
  serviceName: string
  customerName: string
}

export type AppointmentSeriesMode = 'single' | 'series' | 'group'

export type WorkTimeWindow = { startTime: string; endTime: string }

export type SalonTimeRange = { start: string; end: string }
