import { useMemo, type ReactNode } from 'react'
import { buildStaffDayGrid, type TimeGridCell } from '../../../core/agenda/timeGrid.js'
import { getAgendaConfig } from '../../../core/config.js'
import type {
  DayScheduleAppointment,
  DayScheduleBlock,
  StaffDaySchedule,
} from '../../../core/types/index.js'
import { useSlotRangeDrag } from '../../hooks/agenda/useSlotRangeDrag.js'
import { useAgendaLabels } from '../../context.js'
import { cn } from '../shared/classNames.js'

export type StaffTimeGridClassNames = {
  root?: string
  cell?: string
  cellSelected?: string
  cellFree?: string
  cellAppointment?: string
  cellBlock?: string
  cellPast?: string
  cellClosed?: string
}

export type StaffTimeGridProps = {
  date: string
  schedule: StaffDaySchedule
  selectedTimes: ReadonlySet<string>
  formSlotTime?: string | null
  classNames?: StaffTimeGridClassNames
  slots?: {
    cellContent?: (cell: TimeGridCell, apt?: DayScheduleAppointment) => ReactNode
  }
  onToggleSlot: (time: string) => void
  onPaintSlots: (times: Set<string>) => void
  onSelectAppointment: (apt: DayScheduleAppointment) => void
  onOpenBlock: (block: DayScheduleBlock) => void
}

function statusClass(
  status: TimeGridCell['status'],
  classNames?: StaffTimeGridClassNames,
): string | undefined {
  switch (status) {
    case 'free':
      return classNames?.cellFree
    case 'appointment':
      return classNames?.cellAppointment
    case 'block':
      return classNames?.cellBlock
    case 'past':
      return classNames?.cellPast
    case 'closed':
      return classNames?.cellClosed
    default:
      return undefined
  }
}

export function StaffTimeGrid({
  date,
  schedule,
  selectedTimes,
  formSlotTime = null,
  classNames,
  slots,
  onToggleSlot,
  onPaintSlots,
  onSelectAppointment,
  onOpenBlock,
}: StaffTimeGridProps) {
  const labels = useAgendaLabels()
  const cells = useMemo(
    () => buildStaffDayGrid(schedule, date, getAgendaConfig().slotMinutes, 'fullDisplay'),
    [schedule, date],
  )
  const selectableTimes = useMemo(
    () => cells.filter((c) => c.status === 'free').map((c) => c.time),
    [cells],
  )
  const drag = useSlotRangeDrag(selectableTimes)

  function handleCellClick(cell: TimeGridCell) {
    if (cell.status === 'past' || cell.status === 'closed') return
    if (cell.status === 'appointment' && cell.appointmentId) {
      const apt = schedule.appointments.find((a) => a.id === cell.appointmentId)
      if (apt) onSelectAppointment(apt)
      return
    }
    if (cell.status === 'block' && cell.blockId) {
      const block = schedule.blocks.find((b) => b.id === cell.blockId)
      if (block) onOpenBlock(block)
      return
    }
    if (cell.status === 'free' || cell.status === 'block') {
      onToggleSlot(cell.time)
    }
  }

  return (
    <div data-agenda-staff-grid="" className={cn(classNames?.root)}>
      {cells.map((cell) => {
        const isSelected = selectedTimes.has(cell.time) || (drag.preview?.has(cell.time) ?? false)
        const isFormSlot = cell.status === 'free' && cell.time === formSlotTime && !isSelected
        const isFree = cell.status === 'free'
        const apt =
          cell.appointmentId != null
            ? schedule.appointments.find((a) => a.id === cell.appointmentId)
            : undefined

        return (
          <button
            key={cell.time}
            type="button"
            data-agenda-slot={cell.time}
            data-agenda-slot-status={cell.status}
            data-agenda-slot-selected={isSelected ? 'true' : undefined}
            data-agenda-slot-form={isFormSlot ? 'true' : undefined}
            disabled={cell.status === 'past' || cell.status === 'closed'}
            aria-pressed={isSelected}
            title={
              cell.appointmentNotes
                ? `${cell.title ?? ''} — ${cell.subtitle ?? ''}\n${cell.appointmentNotes}`
                : cell.title
                  ? `${cell.title}${cell.subtitle ? ` — ${cell.subtitle}` : ''}`
                  : undefined
            }
            onPointerDown={isFree ? () => drag.begin(cell.time, selectedTimes) : undefined}
            onPointerEnter={isFree && drag.dragging ? () => drag.move(cell.time) : undefined}
            onPointerUp={
              isFree
                ? () => {
                    const next = drag.end()
                    if (next) onPaintSlots(next)
                  }
                : undefined
            }
            onClick={() => {
              if (drag.dragging) return
              handleCellClick(cell)
            }}
            className={cn(
              classNames?.cell,
              statusClass(cell.status, classNames),
              isSelected && classNames?.cellSelected,
            )}
          >
            {slots?.cellContent?.(cell, apt) ?? (
              <>
                <span data-agenda-slot-time="">{cell.time}</span>
                {cell.title && <strong>{cell.title}</strong>}
                {cell.subtitle && <span>{cell.subtitle}</span>}
                {cell.status === 'block' && !cell.title && <span>{labels.blocked}</span>}
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
