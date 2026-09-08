import { addDaysToDateString, todaySalon } from '../../../core/time/index.js'
import { useAgendaLabels } from '../../context.js'
import { cn } from '../shared/classNames.js'

export type AdminAgendaControlBarClassNames = {
  root?: string
  dateLabel?: string
  button?: string
  todayButton?: string
}

export type AdminAgendaControlBarProps = {
  date: string
  onDateChange: (date: string) => void
  appointmentCount?: number
  classNames?: AdminAgendaControlBarClassNames
  onLogout?: () => void
  children?: React.ReactNode
}

export function AdminAgendaControlBar({
  date,
  onDateChange,
  appointmentCount,
  classNames,
  onLogout,
  children,
}: AdminAgendaControlBarProps) {
  const labels = useAgendaLabels()
  const isToday = date === todaySalon()

  return (
    <div data-agenda-control-bar="" className={cn(classNames?.root)} role="navigation">
      <button
        type="button"
        className={cn(classNames?.button)}
        aria-label={labels.previousDay}
        onClick={() => onDateChange(addDaysToDateString(date, -1))}
      >
        ‹
      </button>
      <button
        type="button"
        className={cn(classNames?.todayButton, classNames?.button)}
        disabled={isToday}
        onClick={() => onDateChange(todaySalon())}
      >
        {labels.today}
      </button>
      <input
        type="date"
        value={date}
        aria-label="Fecha"
        className={cn(classNames?.dateLabel)}
        onChange={(e) => {
          const next = e.target.value
          if (next) onDateChange(next)
        }}
      />
      <button
        type="button"
        className={cn(classNames?.button)}
        aria-label={labels.nextDay}
        onClick={() => onDateChange(addDaysToDateString(date, 1))}
      >
        ›
      </button>
      {appointmentCount != null && (
        <span data-agenda-appointment-count="">
          {appointmentCount} {appointmentCount === 1 ? 'cita' : 'citas'}
        </span>
      )}
      {children}
      {onLogout && (
        <button type="button" className={cn(classNames?.button)} onClick={onLogout}>
          {labels.logout}
        </button>
      )}
    </div>
  )
}
