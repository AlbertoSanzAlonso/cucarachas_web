import { getAgendaConfig } from '../config.js'
import {
  getOccupiedSegmentsForAppointment,
  isColorGroupWashRow,
  occupiedSegmentsOverlap,
} from '../occupancy/occupancy.js'
import {
  minutesToTime,
  nowMinutesInTimezone,
  slotStartInWorkWindows,
  timeToMinutes,
  todayInTimezone,
  truncateNotesPreview,
} from '../time/index.js'
import type { StaffDaySchedule } from '../types/index.js'

export type TimeGridCellStatus = 'free' | 'appointment' | 'block' | 'past' | 'closed'

export type TimeGridCell = {
  time: string
  status: TimeGridCellStatus
  title?: string
  subtitle?: string
  /** Texto completo de observaciones de la cita (tooltip). */
  appointmentNotes?: string
  appointmentId?: string
  categoryId?: string | null
  serviceId?: string
  blockId?: string
  colorGroupRole?: string | null
  appointmentStatus?: string
}

function rangeOverlaps(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA
}

export type BuildStaffDayGridMode = 'workSlots' | 'fullDisplay'

function appendWorkingSlotCell(
  cells: TimeGridCell[],
  schedule: StaffDaySchedule,
  slotStart: number,
  slotMinutes: number,
  time: string,
  isToday: boolean,
  nowMin: number | null,
): void {
  if (isToday && nowMin !== null && slotStart < nowMin) {
    cells.push({ time, status: 'past' })
    return
  }

  const slotEnd = slotStart + slotMinutes
  const slotSegment = { startMinutes: slotStart, durationMinutes: slotMinutes }
  const apt = schedule.appointments.find((a) => {
    const aptSegments = getOccupiedSegmentsForAppointment(
      a.serviceId,
      timeToMinutes(a.startTime),
      a.durationMinutes,
      { colorGroupRole: a.colorGroupRole, bookingPattern: a.bookingPattern },
    )
    return occupiedSegmentsOverlap([slotSegment], aptSegments)
  })

  if (apt) {
    const aptSegments = getOccupiedSegmentsForAppointment(
      apt.serviceId,
      timeToMinutes(apt.startTime),
      apt.durationMinutes,
      { colorGroupRole: apt.colorGroupRole, bookingPattern: apt.bookingPattern },
    )
    const isSegmentStart = aptSegments.some((seg) => seg.startMinutes === slotStart)
    const serviceLabel = isColorGroupWashRow(apt.colorGroupRole)
      ? 'Lavar color'
      : apt.serviceName
    const notesPreview = isSegmentStart ? truncateNotesPreview(apt.notes, 36) : undefined
    const subtitleParts = [serviceLabel, notesPreview].filter(Boolean)
    cells.push({
      time,
      status: 'appointment',
      appointmentId: apt.id,
      categoryId: apt.categoryId,
      serviceId: apt.serviceId,
      colorGroupRole: apt.colorGroupRole,
      appointmentStatus: apt.status,
      title: isSegmentStart ? apt.customerName : undefined,
      subtitle: isSegmentStart && subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined,
      appointmentNotes: isSegmentStart ? apt.notes?.trim() || undefined : undefined,
    })
    return
  }

  const block = schedule.blocks.find((b) => {
    const bStart = timeToMinutes(b.startTime)
    const bEnd = timeToMinutes(b.endTime)
    return rangeOverlaps(slotStart, slotEnd, bStart, bEnd)
  })

  if (block) {
    const isStart = timeToMinutes(block.startTime) === slotStart
    cells.push({
      time,
      status: 'block',
      blockId: block.id,
      title: isStart ? 'Bloqueado' : undefined,
      subtitle: isStart && block.note ? block.note : undefined,
    })
    return
  }

  cells.push({ time, status: 'free' })
}

/** Celdas de la grilla del día (cada celda = inicio de franja de slotMinutes). */
export function buildStaffDayGrid(
  schedule: StaffDaySchedule,
  date: string,
  slotMinutes = getAgendaConfig().slotMinutes,
  mode: BuildStaffDayGridMode = 'workSlots',
): TimeGridCell[] {
  const cfg = getAgendaConfig()
  const isToday = date === todayInTimezone(cfg.timezone)
  const nowMin = isToday ? nowMinutesInTimezone(cfg.timezone) : null
  const cells: TimeGridCell[] = []

  if (mode === 'fullDisplay') {
    const startHour = cfg.displayStartHour ?? 9
    const endHour = cfg.displayEndHour ?? 21
    const dayStart = startHour * 60
    const dayEnd = endHour * 60

    for (let slotStart = dayStart; slotStart < dayEnd; slotStart += slotMinutes) {
      const time = minutesToTime(slotStart)
      if (!slotStartInWorkWindows(time, slotMinutes, schedule.windows)) {
        cells.push({ time, status: 'closed' })
        continue
      }
      appendWorkingSlotCell(cells, schedule, slotStart, slotMinutes, time, isToday, nowMin)
    }

    return cells
  }

  if (!schedule.working || schedule.windows.length === 0) return []

  for (const workWindow of schedule.windows) {
    const startMin = timeToMinutes(workWindow.startTime)
    const endMin = timeToMinutes(workWindow.endTime)

    for (let slotStart = startMin; slotStart < endMin; slotStart += slotMinutes) {
      appendWorkingSlotCell(
        cells,
        schedule,
        slotStart,
        slotMinutes,
        minutesToTime(slotStart),
        isToday,
        nowMin,
      )
    }
  }

  return cells
}

export function groupContiguousSlotTimes(
  times: string[],
  slotMinutes = getAgendaConfig().slotMinutes,
): { startTime: string; endTime: string }[] {
  if (times.length === 0) return []

  const sorted = [...times].sort((a, b) => timeToMinutes(a) - timeToMinutes(b))
  const groups: { startTime: string; endTime: string }[] = []

  let rangeStart = sorted[0]!
  let rangeEndMin = timeToMinutes(sorted[0]!) + slotMinutes

  for (let i = 1; i < sorted.length; i++) {
    const current = timeToMinutes(sorted[i]!)
    if (current === rangeEndMin) {
      rangeEndMin = current + slotMinutes
    } else {
      groups.push({ startTime: rangeStart, endTime: minutesToTime(rangeEndMin) })
      rangeStart = sorted[i]!
      rangeEndMin = current + slotMinutes
    }
  }

  groups.push({ startTime: rangeStart, endTime: minutesToTime(rangeEndMin) })
  return groups
}

export type GridSelectionSummary = {
  freeTimes: string[]
  blockIds: string[]
  hasAppointment: boolean
}

export function summarizeGridSelection(
  selectedTimes: Iterable<string>,
  cells: TimeGridCell[],
): GridSelectionSummary {
  const selected = new Set(selectedTimes)
  const freeTimes: string[] = []
  const blockIds = new Set<string>()
  let hasAppointment = false

  for (const cell of cells) {
    if (!selected.has(cell.time)) continue
    if (
      cell.status === 'free' ||
      cell.status === 'closed' ||
      cell.status === 'past'
    ) {
      freeTimes.push(cell.time)
    }
    if (cell.status === 'block' && cell.blockId) blockIds.add(cell.blockId)
    if (cell.status === 'appointment') hasAppointment = true
  }

  return {
    freeTimes: freeTimes.sort((a, b) => timeToMinutes(a) - timeToMinutes(b)),
    blockIds: [...blockIds],
    hasAppointment,
  }
}
