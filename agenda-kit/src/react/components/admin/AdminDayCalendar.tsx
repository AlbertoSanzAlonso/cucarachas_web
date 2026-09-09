import { useMemo, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import {
  currentTimeLineTopPx,
  eventHeightPx,
  eventTopPx,
  resolveCalendarDayRange,
  type CalendarDayRange,
} from '../../../core/agenda/adminCalendar.js'
import { buildStaffDayGrid } from '../../../core/agenda/timeGrid.js'
import {
  assignOverlapLanes,
  FULL_WIDTH_LANE,
} from '../../../core/agenda/overlapLanes.js'
import {
  getPendingVisualForAppointment,
  type PendingMoveSummary,
} from '../../../core/agenda/pendingMoves.js'
import { slotStartInWorkWindows } from '../../../core/time/index.js'
import type {
  DayScheduleAppointment,
  DayScheduleBlock,
  StaffDaySchedule,
  WorkTimeWindow,
} from '../../../core/types/index.js'
import type { AdminColumnSelection } from '../../hooks/adminAgenda/types.js'
import { useSlotRangeDrag } from '../../hooks/agenda/useSlotRangeDrag.js'
import { cn } from '../shared/classNames.js'

export type AdminDayCalendarClassNames = {
  root?: string
  header?: string
  columnHeader?: string
  gutter?: string
  column?: string
  slot?: string
  slotFree?: string
  slotClosed?: string
  slotPast?: string
  slotSelected?: string
  event?: string
  block?: string
  nowLine?: string
}

export type AppointmentMovePropose = {
  appointment: DayScheduleAppointment
  fromStaffId: string
  fromStartTime: string
  toStaffId: string
  toStaffName: string
  toStartTime: string
}

export type AdminDayCalendarProps = {
  date: string
  schedules: StaffDaySchedule[]
  salonWindows: WorkTimeWindow[]
  selection: AdminColumnSelection | null
  pendingMoveSummary: PendingMoveSummary
  formSlotTime?: string | null
  formStaffId?: string | null
  gridInteractionsLocked?: boolean
  classNames?: AdminDayCalendarClassNames
  slots?: {
    columnHeader?: (schedule: StaffDaySchedule) => React.ReactNode
    eventContent?: (apt: DayScheduleAppointment) => React.ReactNode
    blockContent?: (block: DayScheduleBlock) => React.ReactNode
    /** false = atenuar en UI; la cita sigue ocupando franja */
    filterAppointment?: (apt: DayScheduleAppointment) => boolean
  }
  onToggleSlot: (staffId: string, staffName: string, time: string) => void
  onPaintSlots: (staffId: string, staffName: string, times: Set<string>) => void
  onEditAppointment: (staffId: string, apt: DayScheduleAppointment) => void
  onOpenBlock: (staffId: string, block: DayScheduleBlock) => void
  onProposeAppointmentMove?: (payload: AppointmentMovePropose) => void
  /** Alias de onProposeAppointmentMove (compat workspace). */
  onProposeMove?: (payload: AppointmentMovePropose) => void
}

function snapTimeFromY(y: number, range: CalendarDayRange): string {
  const slots = Math.floor(y / range.slotHeightPx)
  const minutes = range.startMinutes + slots * range.slotMinutes
  const clamped = Math.max(
    range.startMinutes,
    Math.min(range.endMinutes - range.slotMinutes, minutes),
  )
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function AdminDayCalendar({
  date,
  schedules,
  salonWindows,
  selection,
  pendingMoveSummary,
  formSlotTime: _formSlotTime,
  formStaffId: _formStaffId,
  gridInteractionsLocked,
  classNames,
  slots,
  onToggleSlot,
  onPaintSlots,
  onEditAppointment,
  onOpenBlock,
  onProposeAppointmentMove,
  onProposeMove,
}: AdminDayCalendarProps) {
  const proposeMove = onProposeAppointmentMove ?? onProposeMove
  const range = useMemo(
    () => resolveCalendarDayRange(schedules, undefined, salonWindows),
    [schedules, salonWindows],
  )
  const drag = useSlotRangeDrag(range.timeLabels)
  const gridRef = useRef<HTMLDivElement>(null)

  const nowTop = currentTimeLineTopPx(date, range)

  return (
    <div
      data-agenda-calendar=""
      className={cn(classNames?.root)}
      style={{ display: 'grid', gridTemplateColumns: `4rem repeat(${schedules.length}, 1fr)` }}
    >
      <div data-agenda-gutter="" className={cn(classNames?.gutter)}>
        <div data-agenda-gutter-spacer="" style={{ height: 40 }} />
        <div style={{ position: 'relative', height: range.totalHeightPx }}>
          {range.timeLabels.map((time) => (
            <div
              key={time}
              data-agenda-gutter-label=""
              style={{
                position: 'absolute',
                top: eventTopPx(time, range),
                height: range.slotHeightPx,
              }}
            >
              {time}
            </div>
          ))}
        </div>
      </div>

      {schedules.map((schedule) => {
        const cells = buildStaffDayGrid(schedule, date, range.slotMinutes, 'fullDisplay')
        const laneMap = assignOverlapLanes(schedule.appointments)
        const selected =
          selection?.staffId === schedule.staffId ? selection.times : new Set<string>()
        const paintPreview =
          drag.dragging && drag.preview && selection?.staffId === schedule.staffId
            ? drag.preview
            : null
        const visibleSelection = paintPreview ?? selected

        return (
          <div
            key={schedule.staffId}
            data-agenda-column=""
            data-staff-id={schedule.staffId}
            className={cn(classNames?.column)}
          >
                    <div data-agenda-column-header="" className={cn(classNames?.columnHeader)}>
                      {slots?.columnHeader?.(schedule) ?? schedule.staffName}
                    </div>
            <div
              ref={schedule === schedules[0] ? gridRef : undefined}
              data-agenda-column-grid=""
              style={{ position: 'relative', height: range.totalHeightPx }}
              onPointerLeave={() => {
                if (drag.dragging) drag.cancel()
              }}
            >
              {cells.map((cell) => {
                const isSelected = visibleSelection.has(cell.time)
                const closed =
                  cell.status === 'closed' ||
                  !slotStartInWorkWindows(cell.time, range.slotMinutes, schedule.windows)
                return (
                  <div
                    key={cell.time}
                    data-agenda-slot=""
                    data-status={cell.status}
                    data-selected={isSelected ? 'true' : 'false'}
                    className={cn(
                      classNames?.slot,
                      closed && classNames?.slotClosed,
                      cell.status === 'past' && classNames?.slotPast,
                      cell.status === 'free' && classNames?.slotFree,
                      isSelected && classNames?.slotSelected,
                    )}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: eventTopPx(cell.time, range),
                      height: range.slotHeightPx,
                    }}
                    onPointerDown={(e: ReactPointerEvent) => {
                      if (gridInteractionsLocked) return
                      if (e.button !== 0) return
                      e.currentTarget.setPointerCapture(e.pointerId)
                      drag.begin(cell.time, selected)
                    }}
                    onPointerEnter={() => {
                      if (drag.dragging) drag.move(cell.time)
                    }}
                    onPointerUp={() => {
                      const next = drag.end()
                      if (next) onPaintSlots(schedule.staffId, schedule.staffName, next)
                      else if (!drag.dragging) {
                        onToggleSlot(schedule.staffId, schedule.staffName, cell.time)
                      }
                    }}
                  />
                )
              })}

              {schedule.blocks.map((block) => {
                const duration =
                  eventHeightPx(
                    // duration from start/end
                    (() => {
                      const [sh, sm] = block.startTime.split(':').map(Number)
                      const [eh, em] = block.endTime.split(':').map(Number)
                      return eh * 60 + em - (sh * 60 + sm)
                    })(),
                    range,
                  )
                return (
                  <button
                    key={block.id}
                    type="button"
                    data-agenda-block=""
                    className={cn(classNames?.block)}
                    style={{
                      position: 'absolute',
                      left: 2,
                      right: 2,
                      top: eventTopPx(block.startTime, range),
                      height: duration,
                      zIndex: 2,
                    }}
                    onClick={() => onOpenBlock(schedule.staffId, block)}
                  >
                    {slots?.blockContent?.(block) ?? (block.note || 'Bloqueo')}
                  </button>
                )
              })}

              {schedule.appointments.map((apt) => {
                const visual = getPendingVisualForAppointment(pendingMoveSummary, apt.id)
                const startTime = visual?.targetStartTime ?? apt.startTime
                const lane = laneMap.get(apt.id) ?? FULL_WIDTH_LANE
                const matchesFilter = slots?.filterAppointment?.(apt) ?? true
                return (
                  <button
                    key={apt.id}
                    type="button"
                    data-agenda-event=""
                    data-appointment-id={apt.id}
                    data-filtered={matchesFilter ? 'in' : 'out'}
                    className={cn(classNames?.event)}
                    style={{
                      position: 'absolute',
                      top: eventTopPx(startTime, range),
                      height: eventHeightPx(apt.durationMinutes, range),
                      left: `${lane.leftPercent}%`,
                      width: `${lane.widthPercent}%`,
                      zIndex: matchesFilter ? 3 : 1,
                      opacity: matchesFilter ? undefined : 0.22,
                    }}
                    onClick={() => onEditAppointment(schedule.staffId, apt)}
                    draggable={Boolean(proposeMove) && !gridInteractionsLocked}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        'application/x-agenda-appointment',
                        JSON.stringify({
                          appointmentId: apt.id,
                          fromStaffId: schedule.staffId,
                          fromStartTime: apt.startTime,
                        }),
                      )
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (!proposeMove) return
                      const raw = e.dataTransfer.getData('application/x-agenda-appointment')
                      if (!raw) return
                      const data = JSON.parse(raw) as {
                        appointmentId: string
                        fromStaffId: string
                        fromStartTime: string
                      }
                      const appointment =
                        schedules
                          .flatMap((s) => s.appointments)
                          .find((a) => a.id === data.appointmentId) ?? apt
                      const rect = e.currentTarget.parentElement?.getBoundingClientRect()
                      const y = rect ? e.clientY - rect.top : 0
                      proposeMove({
                        appointment,
                        fromStaffId: data.fromStaffId,
                        fromStartTime: data.fromStartTime,
                        toStaffId: schedule.staffId,
                        toStaffName: schedule.staffName,
                        toStartTime: snapTimeFromY(y, range),
                      })
                    }}
                  >
                    {slots?.eventContent?.(apt) ?? (
                      <>
                        <strong>{apt.customerName}</strong>
                        <span>{apt.serviceName}</span>
                        <span>{startTime}</span>
                      </>
                    )}
                  </button>
                )
              })}

              {nowTop != null ? (
                <div
                  data-agenda-now-line=""
                  className={cn(classNames?.nowLine)}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: nowTop,
                    height: 2,
                    zIndex: 4,
                  }}
                />
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
