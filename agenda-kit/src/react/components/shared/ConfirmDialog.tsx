import { useAgendaLabels } from '../../context.js'
import { cn } from './classNames.js'

export type ConfirmDialogClassNames = {
  overlay?: string
  panel?: string
  title?: string
  message?: string
  actions?: string
  button?: string
  confirmButton?: string
  cancelButton?: string
}

export type ConfirmDialogProps = {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  busy?: boolean
  classNames?: ConfirmDialogClassNames
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  busy = false,
  classNames,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const labels = useAgendaLabels()
  if (!open) return null

  return (
    <div
      data-agenda-confirm-dialog=""
      role="dialog"
      aria-modal="true"
      aria-labelledby="agenda-confirm-title"
      className={cn(classNames?.overlay)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={busy ? undefined : onClose}
    >
      <div
        className={cn(classNames?.panel)}
        style={{ width: '100%', maxWidth: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="agenda-confirm-title" className={cn(classNames?.title)}>
          {title}
        </h2>
        {message && <p className={cn(classNames?.message)}>{message}</p>}
        <div className={cn(classNames?.actions)}>
          <button
            type="button"
            className={cn(classNames?.button, classNames?.cancelButton)}
            disabled={busy}
            onClick={onClose}
          >
            {cancelLabel ?? labels.close}
          </button>
          <button
            type="button"
            className={cn(classNames?.button, classNames?.confirmButton)}
            disabled={busy}
            onClick={() => void onConfirm()}
          >
            {busy ? labels.loading : (confirmLabel ?? labels.save)}
          </button>
        </div>
      </div>
    </div>
  )
}
