import type { ReactNode } from 'react'
import type { UseStaffAgendaReturn } from '../../hooks/useStaffAgenda.js'
import { useAgendaLabels } from '../../context.js'
import { StaffTimeGrid, type StaffTimeGridClassNames } from './StaffTimeGrid.js'
import { AgendaAppointmentModal } from '../shared/AgendaAppointmentModal.js'
import { BlockModal } from '../shared/BlockModal.js'
import { cn } from '../shared/classNames.js'
import { getAgendaConfig } from '../../../core/config.js'
import { minutesToTime, timeToMinutes } from '../../../core/time/index.js'

export type StaffAgendaPanelClassNames = {
  root?: string
  header?: string
  button?: string
  error?: string
  loading?: string
  grid?: StaffTimeGridClassNames
  actions?: string
}

export type StaffAgendaPanelProps = {
  agenda: UseStaffAgendaReturn
  date: string
  onDateChange: (date: string) => void
  onLogout?: () => void
  classNames?: StaffAgendaPanelClassNames
  slots?: {
    headerExtra?: ReactNode
    afterGrid?: ReactNode
  }
}

export function StaffAgendaPanel({
  agenda,
  date,
  onDateChange,
  onLogout,
  classNames,
  slots,
}: StaffAgendaPanelProps) {
  const labels = useAgendaLabels()

  return (
    <div data-agenda-workspace="staff" className={cn(classNames?.root)}>
      <header data-agenda-workspace-header="" className={cn(classNames?.header)}>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            if (e.target.value) onDateChange(e.target.value)
          }}
        />
        {slots?.headerExtra}
        {onLogout && (
          <button type="button" className={cn(classNames?.button)} onClick={onLogout}>
            {labels.logout}
          </button>
        )}
      </header>

      {agenda.error && (
        <p data-agenda-error="" role="alert" className={cn(classNames?.error)}>
          {agenda.error}
        </p>
      )}

      {agenda.loading && !agenda.schedule ? (
        <p className={cn(classNames?.loading)}>{labels.loading}</p>
      ) : agenda.schedule ? (
        <>
          <div data-agenda-selection-actions="" className={cn(classNames?.actions)}>
            <button
              type="button"
              className={cn(classNames?.button)}
              disabled={agenda.selection.size === 0 || agenda.busy}
              onClick={agenda.openCreateFromSelection}
            >
              {labels.createAppointment}
            </button>
            <button
              type="button"
              className={cn(classNames?.button)}
              disabled={agenda.selection.size === 0 || agenda.busy}
              onClick={agenda.openCreateBlockFromSelection}
            >
              {labels.createBlock}
            </button>
          </div>
          <StaffTimeGrid
            date={date}
            schedule={agenda.schedule}
            selectedTimes={agenda.selection}
            classNames={classNames?.grid}
            onToggleSlot={agenda.toggleSlot}
            onPaintSlots={agenda.applySelection}
            onSelectAppointment={agenda.openAppointment}
            onOpenBlock={agenda.openBlock}
          />
          {slots?.afterGrid}
          <AgendaAppointmentModal
            open={agenda.formOpen}
            mode={agenda.editingId ? 'edit' : 'create'}
            date={date}
            staffName={agenda.schedule.staffName}
            draft={agenda.draft}
            services={agenda.services}
            saving={agenda.busy}
            onDraftChange={(patch) => agenda.setDraft({ ...agenda.draft, ...patch })}
            onSubmit={() => void agenda.saveAppointment()}
            onClose={agenda.closeForm}
          />
          <BlockModal
            open={agenda.blockOpen}
            mode={agenda.editingBlockId ? 'detail' : 'create'}
            date={date}
            staffName={agenda.schedule.staffName}
            groups={
              agenda.editingBlockId
                ? null
                : [
                    {
                      startTime: agenda.blockStart,
                      endTime:
                        agenda.blockEnd ||
                        minutesToTime(
                          timeToMinutes(agenda.blockStart || '10:00') +
                            getAgendaConfig().slotMinutes,
                        ),
                    },
                  ]
            }
            block={
              agenda.editingBlockId
                ? {
                    id: agenda.editingBlockId,
                    startTime: agenda.blockStart,
                    endTime: agenda.blockEnd,
                    note: agenda.blockNote,
                  }
                : null
            }
            note={agenda.blockNote}
            busy={agenda.busy}
            onNoteChange={agenda.setBlockNote}
            onClose={agenda.closeBlock}
            onConfirmCreate={() => void agenda.saveBlock()}
            onSaveNote={() => void agenda.saveBlock()}
            onDelete={agenda.editingBlockId ? () => void agenda.deleteBlock() : undefined}
          />
        </>
      ) : (
        <p>{labels.professionalNotFound}</p>
      )}
    </div>
  )
}
