import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { AppointmentDraft } from '../../types.js'
import type { BookableService } from '../../../core/types/index.js'
import { useAgendaLabels } from '../../context.js'
import { ClockTimeInput } from './ClockTimeInput.js'
import { cn } from './classNames.js'

export type AgendaAppointmentModalClassNames = {
  overlay?: string
  panel?: string
  header?: string
  body?: string
  footer?: string
  field?: string
  label?: string
  input?: string
  button?: string
  error?: string
}

export type AgendaAppointmentModalProps = {
  open: boolean
  mode?: 'create' | 'edit' | 'view'
  date: string
  staffName?: string
  draft: AppointmentDraft
  services: BookableService[]
  slots?: string[]
  saving?: boolean
  error?: string | null
  classNames?: AgendaAppointmentModalClassNames
  slotsRender?: {
    header?: ReactNode
    footer?: ReactNode
    beforeFields?: ReactNode
    afterFields?: ReactNode
  }
  onDraftChange: (patch: Partial<AppointmentDraft>) => void
  onSubmit: () => void | Promise<void>
  onClose: () => void
  onCancelAppointment?: () => void
  onMarkNoShow?: () => void
  onStartEdit?: () => void
}

export function AgendaAppointmentModal({
  open,
  mode = 'create',
  date,
  staffName,
  draft,
  services,
  slots = [],
  saving = false,
  error,
  classNames,
  slotsRender,
  onDraftChange,
  onSubmit,
  onClose,
  onCancelAppointment,
  onMarkNoShow,
  onStartEdit,
}: AgendaAppointmentModalProps) {
  const labels = useAgendaLabels()
  const readOnly = mode === 'view'

  if (!open) return null

  const title =
    mode === 'create'
      ? labels.createAppointment
      : mode === 'edit'
        ? labels.editAppointment
        : labels.editAppointment

  return createPortal(
    <div
      data-agenda-appointment-modal=""
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
      onClick={saving ? undefined : onClose}
    >
      <div
        className={cn(classNames?.panel)}
        style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={cn(classNames?.header)}>
          {slotsRender?.header ?? (
            <>
              <h2>{title}</h2>
              <p>
                {date}
                {staffName ? ` · ${staffName}` : ''}
              </p>
            </>
          )}
        </header>

        <form
          className={cn(classNames?.body)}
          onSubmit={(e) => {
            e.preventDefault()
            if (!readOnly) void onSubmit()
          }}
        >
          {slotsRender?.beforeFields}

          <div className={cn(classNames?.field)}>
            <label className={cn(classNames?.label)}>Nombre</label>
            <input
              className={cn(classNames?.input)}
              disabled={readOnly || saving}
              value={draft.customerFirstName}
              onChange={(e) => onDraftChange({ customerFirstName: e.target.value })}
              required={!readOnly}
            />
          </div>
          <div className={cn(classNames?.field)}>
            <label className={cn(classNames?.label)}>Apellidos</label>
            <input
              className={cn(classNames?.input)}
              disabled={readOnly || saving}
              value={draft.customerLastName}
              onChange={(e) => onDraftChange({ customerLastName: e.target.value })}
            />
          </div>
          <div className={cn(classNames?.field)}>
            <label className={cn(classNames?.label)}>Teléfono</label>
            <input
              className={cn(classNames?.input)}
              disabled={readOnly || saving}
              value={draft.customerPhone}
              onChange={(e) => onDraftChange({ customerPhone: e.target.value })}
              required={!readOnly}
            />
          </div>
          <div className={cn(classNames?.field)}>
            <label className={cn(classNames?.label)}>Email</label>
            <input
              type="email"
              className={cn(classNames?.input)}
              disabled={readOnly || saving}
              value={draft.customerEmail}
              onChange={(e) => onDraftChange({ customerEmail: e.target.value })}
            />
          </div>

          <div className={cn(classNames?.field)}>
            <label className={cn(classNames?.label)}>Servicio</label>
            <select
              className={cn(classNames?.input)}
              disabled={readOnly || saving}
              value={draft.serviceIds[0] ?? ''}
              onChange={(e) => {
                const id = e.target.value
                const svc = services.find((s) => s.id === id)
                onDraftChange({
                  serviceIds: id ? [id] : [],
                  serviceDurations: svc ? [svc.durationMinutes] : [],
                })
              }}
              required={!readOnly}
            >
              <option value="">—</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameEs} ({s.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>

          <div className={cn(classNames?.field)}>
            <label className={cn(classNames?.label)}>Hora</label>
            {slots.length > 0 && !readOnly ? (
              <select
                className={cn(classNames?.input)}
                disabled={saving}
                value={draft.startTime}
                onChange={(e) => onDraftChange({ startTime: e.target.value })}
                required
              >
                <option value="">—</option>
                {slots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            ) : (
              <ClockTimeInput
                value={draft.startTime}
                disabled={readOnly || saving}
                onChange={(startTime) => onDraftChange({ startTime })}
                className={cn(classNames?.input)}
              />
            )}
          </div>

          <div className={cn(classNames?.field)}>
            <label className={cn(classNames?.label)}>Notas</label>
            <textarea
              className={cn(classNames?.input)}
              disabled={readOnly || saving}
              value={draft.notes}
              onChange={(e) => onDraftChange({ notes: e.target.value })}
              rows={3}
            />
          </div>

          {slotsRender?.afterFields}

          {error && (
            <p role="alert" className={cn(classNames?.error)}>
              {error}
            </p>
          )}

          <footer className={cn(classNames?.footer)}>
            {slotsRender?.footer ?? (
              <>
                <button
                  type="button"
                  className={cn(classNames?.button)}
                  disabled={saving}
                  onClick={onClose}
                >
                  {labels.close}
                </button>
                {readOnly && onStartEdit && (
                  <button
                    type="button"
                    className={cn(classNames?.button)}
                    onClick={onStartEdit}
                  >
                    {labels.editAppointment}
                  </button>
                )}
                {!readOnly && (
                  <button type="submit" className={cn(classNames?.button)} disabled={saving}>
                    {saving ? labels.loading : labels.save}
                  </button>
                )}
                {onCancelAppointment && (
                  <button
                    type="button"
                    className={cn(classNames?.button)}
                    disabled={saving}
                    onClick={onCancelAppointment}
                  >
                    {labels.cancel}
                  </button>
                )}
                {onMarkNoShow && (
                  <button
                    type="button"
                    className={cn(classNames?.button)}
                    disabled={saving}
                    onClick={onMarkNoShow}
                  >
                    {labels.noShow}
                  </button>
                )}
              </>
            )}
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  )
}
