import { getAgendaConfig } from '../config.js'
import type { WorkTimeWindow, SalonTimeRange } from '../types/index.js'

export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayInTimezone(timezone = getAgendaConfig().timezone): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
}

/** @deprecated use todayInTimezone */
export function todaySalon(): string {
  return todayInTimezone()
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const next = new Date(y, m - 1, d)
  next.setDate(next.getDate() + days)
  return toDateString(next)
}

export function dayOfWeekFromDateString(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

export function isOpenDay(
  dateStr: string,
  openDays: readonly number[] = getAgendaConfig().openDays,
): boolean {
  return openDays.includes(dayOfWeekFromDateString(dateStr))
}

export function isWithinBookingWindow(
  dateStr: string,
  maxDaysAhead = getAgendaConfig().maxDaysAhead,
  timezone = getAgendaConfig().timezone,
): boolean {
  const today = todayInTimezone(timezone)
  const maxDate = addDaysToDateString(today, maxDaysAhead)
  return dateStr >= today && dateStr <= maxDate
}

export function nowMinutesInTimezone(timezone = getAgendaConfig().timezone): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date())
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

/** @deprecated use nowMinutesInTimezone */
export function nowSalonMinutes(): number {
  return nowMinutesInTimezone()
}

export function wallClockMsInTimezone(timezone = getAgendaConfig().timezone): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(new Date())
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  const hour = get('hour') % 24
  return Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'))
}

export function hoursUntilAppointment(
  dateStr: string,
  startTime: string,
  timezone = getAgendaConfig().timezone,
): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = startTime.split(':').map(Number)
  const aptMs = Date.UTC(y, m - 1, d, hh, mm)
  return (aptMs - wallClockMsInTimezone(timezone)) / 3_600_000
}

export function formatDisplayDate(dateStr: string, locale: 'es' | 'en' = 'es'): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(locale === 'en' ? 'en-GB' : 'es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function getBookableDates(count = 35): string[] {
  const cfg = getAgendaConfig()
  const dates: string[] = []
  let cursor = todayInTimezone(cfg.timezone)
  const lastDate = addDaysToDateString(cursor, cfg.maxDaysAhead)
  while (dates.length < count && cursor <= lastDate) {
    if (cfg.openDays.includes(dayOfWeekFromDateString(cursor))) {
      dates.push(cursor)
    }
    cursor = addDaysToDateString(cursor, 1)
  }
  return dates
}

export function formatTimeRange(start: string, durationMinutes: number): string {
  const [h, m] = start.split(':').map(Number)
  const endMinutes = h * 60 + m + durationMinutes
  const endH = Math.floor(endMinutes / 60)
  const endM = endMinutes % 60
  const end = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
  return `${start} – ${end}`
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function rangesToWorkWindows(ranges: readonly SalonTimeRange[]): WorkTimeWindow[] {
  return ranges.map((r) => ({ startTime: r.start, endTime: r.end }))
}

export function formatWorkWindowsLabel(windows: WorkTimeWindow[]): string {
  return windows.map((w) => `${w.startTime}–${w.endTime}`).join(' · ')
}

export function segmentFitsInWorkWindows(
  startMinutes: number,
  durationMinutes: number,
  windows: WorkTimeWindow[],
): boolean {
  const endMinutes = startMinutes + durationMinutes
  return windows.some((w) => {
    const wStart = timeToMinutes(w.startTime)
    const wEnd = timeToMinutes(w.endTime)
    return startMinutes >= wStart && endMinutes <= wEnd
  })
}

export function slotStartInWorkWindows(
  time: string,
  slotMinutes: number,
  windows: WorkTimeWindow[],
): boolean {
  return segmentFitsInWorkWindows(timeToMinutes(time), slotMinutes, windows)
}

export function truncateNotesPreview(
  text: string | null | undefined,
  maxLen = 48,
): string | undefined {
  const trimmed = text?.trim()
  if (!trimmed) return undefined
  if (trimmed.length <= maxLen) return trimmed
  return `${trimmed.slice(0, maxLen - 1)}…`
}
