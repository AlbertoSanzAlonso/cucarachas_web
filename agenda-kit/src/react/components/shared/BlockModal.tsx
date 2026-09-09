import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { DayScheduleBlock, PendingBlockGroup } from '../../../core/types/index.js'
import { useAgendaLabels } from '../../context.js'
import { ClockTimeInput } from './ClockTimeInput.js'
import { cn } from './classNames.js'

export type BlockModalClassNames = {
  overlay?: string
  panel?: string
  header?: string
  body?: string
  footer?: string
  field?: string
  label?: string
  input?: string
  button?: string
}

export type BlockModalProps = {
  open: boolean
  mode?: 'create' | 'detail'
  date?: string
  staffName?: string
  /** Create mode: contiguous groups from selection */
  groups?: PendingBlockGroup[] | null
  /** Detail mode */
  block?: DayScheduleBlock | null
  note?: string
  busy?: boolean
  classNames?: BlockModalClassNames
  slots?: {
    header?: ReactNode
    footer?: ReactNode
  }
  onNoteChange?: (note: string) => void
  onClose: () => void
  onConfirmCreate?: (note?: string) => void | Promise<void>
  onSaveNote?: (note: string) => void | Promise<void>
  onDelete?: () => void | Promise<void>
}

export function BlockModal({
  open,
  mode = 'create',
  date,
  staffName,
  groups,
  block,
  note: noteProp = '',
  busy = false,
  classNames,
  slots,
  onNoteChange,
  onClose,
  onConfirmCreate,
  onSaveNote,
  onDelete,
}: BlockModalProps) {
  const labels = useAgendaLabels()
  const [localNote, setLocalNote] = useState(noteProp)

  if (!open) return null

  const note = onNoteChange ? noteProp : localNote
  const setNote = (value: string) => {
    if (onNoteChange) onNoteChange(value)
    else setLocalNote(value)
  }

  return createPortal(
    <div
      data-agenda-block-modal={mode}
      role="dialog"
      aria-modal="true"
      className={cn(classNames?.overlay)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={busy ? undefined : onClose}
    >
      <div
        className={cn(classNames?.panel)}
        style={{ width: '100%', maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={cn(classNames?.header)}>
          {slots?.header ?? (
            <>
              <h2>{mode === 'create' ? labels.createBlock : labels.blocked}</h2>
              <p>
                {date}
                {staffName ? ` · ${staffName}` : ''}
              </p>
            </>
          )}
        </header>

        <div className={cn(classNames?.body)}>
          {mode === 'create' && groups && groups.length > 0 && (
            <ul>
              {groups.map((g) => (
                <li key={`${g.startTime}-${g.endTime}`}>
                  {g.startTime} – {g.endTime}
                </li>
              ))}
            </ul>
          )}

          {mode === 'detail' && block && (
            <p>
              {block.startTime} – {block.endTime}
            </p>
          )}

          <div className={cn(classNames?.field)}>
            <label className={cn(classNames?.label)}>Nota</label>
            <textarea
              className={cn(classNames?.input)}
              disabled={busy}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {mode === 'detail' && block && (
            <div className={cn(classNames?.field)}>
              <label className={cn(classNames?.label)}>Horario</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <ClockTimeInput
                  value={block.startTime}
                  disabled
                  onChange={() => {}}
                  className={cn(classNames?.input)}
                />
                <span>–</span>
                <ClockTimeInput
                  value={block.endTime}
                  disabled
                  onChange={() => {}}
                  className={cn(classNames?.input)}
                />
              </div>
            </div>
          )}
        </div>

        <footer className={cn(classNames?.footer)}>
          {slots?.footer ?? (
            <>
              <button
                type="button"
                className={cn(classNames?.button)}
                disabled={busy}
                onClick={onClose}
              >
                {labels.close}
              </button>
              {mode === 'create' && onConfirmCreate && (
                <button
                  type="button"
                  className={cn(classNames?.button)}
                  disabled={busy}
                  onClick={() => void onConfirmCreate(note || undefined)}
                >
                  {busy ? labels.loading : labels.createBlock}
                </button>
              )}
              {mode === 'detail' && onSaveNote && (
                <button
                  type="button"
                  className={cn(classNames?.button)}
                  disabled={busy}
                  onClick={() => void onSaveNote(note)}
                >
                  {busy ? labels.loading : labels.save}
                </button>
              )}
              {mode === 'detail' && onDelete && (
                <button
                  type="button"
                  className={cn(classNames?.button)}
                  disabled={busy}
                  onClick={() => void onDelete()}
                >
                  {labels.unblock}
                </button>
              )}
            </>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  )
}
