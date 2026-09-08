import type {
  AppointmentRecurrenceScope,
  DayScheduleAppointment,
} from '../core/types/index.js'

export type Locale = 'es' | 'en'

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === 'en' ? 'en' : 'es'
}

export function splitCustomerName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim()
  if (!trimmed) return { firstName: '', lastName: '' }
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0]!, lastName: '' }
  return { firstName: parts[0]!, lastName: parts.slice(1).join(' ') }
}

export function joinCustomerName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
}

export type AppointmentDraft = {
  serviceIds: string[]
  serviceStartTimes: string[]
  serviceDurations: (number | null)[]
  staffAssignments: string[]
  startTime: string
  date: string
  customerFirstName: string
  customerLastName: string
  customerPhone: string
  customerEmail: string
  customerNotes: string
  notes: string
  customerLocale: Locale
  recurrenceScope: AppointmentRecurrenceScope
  recurrenceEndDate: string
}

export const EMPTY_APPOINTMENT_DRAFT: AppointmentDraft = {
  serviceIds: [],
  serviceStartTimes: [],
  serviceDurations: [],
  staffAssignments: [],
  startTime: '',
  date: '',
  customerFirstName: '',
  customerLastName: '',
  customerPhone: '',
  customerEmail: '',
  customerNotes: '',
  notes: '',
  customerLocale: 'es',
  recurrenceScope: 'single',
  recurrenceEndDate: '',
}

export function appointmentToDraft(
  apt: DayScheduleAppointment,
  customerProfile?: {
    email: string | null
    notes: string | null
    locale?: string | null
  },
  siblings?: DayScheduleAppointment[],
  appointmentDate?: string,
): AppointmentDraft {
  const { firstName, lastName } = splitCustomerName(apt.customerName)
  const base = {
    customerFirstName: firstName,
    customerLastName: lastName,
    customerPhone: apt.customerPhone?.startsWith('guest:') ? '' : apt.customerPhone,
    customerEmail: apt.customerEmail ?? customerProfile?.email ?? '',
    customerNotes: customerProfile?.notes ?? apt.customerNotes ?? '',
    notes: apt.notes ?? '',
    customerLocale: normalizeLocale(customerProfile?.locale ?? apt.customerLocale),
    recurrenceScope: 'single' as AppointmentRecurrenceScope,
    recurrenceEndDate: '',
    date: appointmentDate ?? '',
  }

  if (siblings && siblings.length > 1) {
    const sorted = [...siblings].sort((a, b) => (a.startTime < b.startTime ? -1 : 1))
    return {
      ...base,
      serviceIds: sorted.map((s) => s.serviceId),
      serviceStartTimes: sorted.map((s) => s.startTime),
      serviceDurations: sorted.map((s) => s.durationMinutes),
      staffAssignments: sorted.map((s) => s.staffId ?? ''),
      startTime: sorted[0]!.startTime,
    }
  }

  return {
    ...base,
    serviceIds: [apt.serviceId],
    serviceStartTimes: [],
    serviceDurations: [apt.durationMinutes],
    staffAssignments: [apt.staffId ?? ''],
    startTime: apt.startTime,
  }
}
