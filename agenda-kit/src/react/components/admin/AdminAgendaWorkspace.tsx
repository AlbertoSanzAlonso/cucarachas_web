import type { ReactNode } from 'react'
import type { PendingMoveSummary } from '../../../core/agenda/pendingMoves.js'
import type {
  DayScheduleAppointment,
  DayScheduleBlock,
  StaffDaySchedule,
  WorkTimeWindow,
} from '../../../core/types/index.js'
import type { UseAdminAgendaReturn } from '../../hooks/adminAgenda/index.js'
import { useAgendaLabels } from '../../context.js'
import { AdminAgendaControlBar } from './AdminAgendaControlBar.js'
import { AdminDayCalendar, type AdminDayCalendarClassNames } from './AdminDayCalendar.js'
import { AppointmentMoveBar } from './AppointmentMoveBar.js'
import { cn } from '../shared/classNames.js'

export type AdminAgendaWorkspaceClassNames = {
  root?: string
  header?: string
  main?: string
  error?: string
  loading?: string
  calendar?: AdminDayCalendarClassNames
}

export type AdminAgendaWorkspaceProps = {
  date: string
  onDateChange: (date: string) => void
  agenda: UseAdminAgendaReturn
  onLogout?: () => void
  classNames?: AdminAgendaWorkspaceClassNames
  slots?: {
    controlBarExtra?: ReactNode
    columnHeader?: (schedule: StaffDaySchedule) => ReactNode
    eventContent?: (apt: DayScheduleAppointment) => ReactNode
    blockContent?: (block: DayScheduleBlock) => ReactNode
    afterCalendar?: ReactNode
  }
}

export function AdminAgendaWorkspace({
  date,
  onDateChange,
  agenda,
  onLogout,
  classNames,
  slots,
}: AdminAgendaWorkspaceProps) {
  const labels = useAgendaLabels()
  const totalAppointments = agenda.schedules.reduce((n, s) => n + s.appointments.length, 0)
  const emptyPending: PendingMoveSummary = {
    count: 0,
    lastMove: null,
    byAppointmentId: new Map(),
  }

  return (
    <div data-agenda-workspace="admin" className={cn(classNames?.root)}>
      <header data-agenda-workspace-header="" className={cn(classNames?.header)}>
        <AdminAgendaControlBar
          date={date}
          onDateChange={onDateChange}
          appointmentCount={totalAppointments}
          onLogout={onLogout}
        >
          {slots?.controlBarExtra}
        </AdminAgendaControlBar>
        {agenda.error && (
          <p data-agenda-error="" role="alert" className={cn(classNames?.error)}>
            {agenda.error}
          </p>
        )}
      </header>

      <main data-agenda-workspace-main="" className={cn(classNames?.main)}>
        {agenda.loading && agenda.schedules.length === 0 ? (
          <p className={cn(classNames?.loading)}>{labels.loading}</p>
        ) : (
          <AdminDayCalendar
            date={date}
            schedules={agenda.schedules}
            salonWindows={agenda.salonWindows as WorkTimeWindow[]}
            selection={agenda.selection}
            pendingMoveSummary={agenda.pendingMoveSummary ?? emptyPending}
            formSlotTime={agenda.formSlotTime}
            formStaffId={agenda.formStaffId}
            gridInteractionsLocked={agenda.gridInteractionsLocked}
            classNames={classNames?.calendar}
            slots={{
              columnHeader: slots?.columnHeader,
              eventContent: slots?.eventContent,
              blockContent: slots?.blockContent,
            }}
            onToggleSlot={agenda.toggleSlot}
            onPaintSlots={agenda.applySlots}
            onEditAppointment={agenda.openAppointmentDetail}
            onOpenBlock={agenda.openBlockDetail}
            onProposeMove={agenda.proposeAppointmentMove}
          />
        )}
        {slots?.afterCalendar}
      </main>

      <AppointmentMoveBar
        summary={agenda.pendingMoveSummary ?? emptyPending}
        busy={agenda.moveBusy}
        onUndo={agenda.undoLastPendingMove}
        onSave={() => void agenda.commitPendingMoves()}
        onDiscard={agenda.discardPendingMoves}
      />
    </div>
  )
}
