import { useAgendaLabels } from '../../context.js'
import type { PendingMoveSummary } from '../../../core/agenda/pendingMoves.js'
import { cn } from '../shared/classNames.js'

export type AppointmentMoveBarProps = {
  summary: PendingMoveSummary
  busy?: boolean
  onSave: () => void
  onDiscard: () => void
  onUndo?: () => void
  classNames?: {
    root?: string
    message?: string
    save?: string
    discard?: string
    undo?: string
  }
}

export function AppointmentMoveBar({
  summary,
  busy,
  onSave,
  onDiscard,
  onUndo,
  classNames,
}: AppointmentMoveBarProps) {
  const labels = useAgendaLabels()
  if (summary.count === 0) return null

  return (
    <div data-agenda-move-bar="" className={cn(classNames?.root)} role="status">
      <span data-agenda-move-message="" className={classNames?.message}>
        {labels.movePending}: {summary.count}
      </span>
      {onUndo ? (
        <button
          type="button"
          data-agenda-move-undo=""
          className={classNames?.undo}
          disabled={busy}
          onClick={onUndo}
        >
          Deshacer
        </button>
      ) : null}
      <button
        type="button"
        data-agenda-move-discard=""
        className={classNames?.discard}
        disabled={busy}
        onClick={onDiscard}
      >
        {labels.discardMoves}
      </button>
      <button
        type="button"
        data-agenda-move-save=""
        className={classNames?.save}
        disabled={busy}
        onClick={onSave}
      >
        {labels.saveMoves}
      </button>
    </div>
  )
}
