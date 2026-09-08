export {
  AgendaDataSourceProvider,
  AgendaLabelsProvider,
  useAgendaDataSource,
  useOptionalAgendaDataSource,
  useAgendaLabels,
} from './context.js'

export type { AgendaLabels } from './labels.js'
export { DEFAULT_AGENDA_LABELS_ES } from './labels.js'

export type { AppointmentDraft, Locale } from './types.js'
export {
  EMPTY_APPOINTMENT_DRAFT,
  appointmentToDraft,
  joinCustomerName,
  splitCustomerName,
  normalizeLocale,
} from './types.js'

export { useAgendaDate } from './hooks/useAgendaDate.js'
export { useAgendaPolling } from './hooks/agenda/useAgendaPolling.js'
export { useAgendaConfirm } from './hooks/agenda/useAgendaConfirm.js'
export type { ConfirmDialogState } from './hooks/agenda/useAgendaConfirm.js'
export { useSlotRangeDrag } from './hooks/agenda/useSlotRangeDrag.js'

export { useAdminAgenda } from './hooks/adminAgenda/index.js'
export type {
  AdminColumnSelection,
  AppointmentDragEndPayload,
  UseAdminAgendaReturn,
} from './hooks/adminAgenda/index.js'
export type { AppointmentMoveDraft } from '../core/agenda/pendingMoves.js'

export { useStaffAgenda } from './hooks/useStaffAgenda.js'
export type { UseStaffAgendaReturn } from './hooks/useStaffAgenda.js'

export { cn } from './components/shared/classNames.js'
export { ConfirmDialog } from './components/shared/ConfirmDialog.js'
export { ClockTimeInput } from './components/shared/ClockTimeInput.js'
export { AgendaAppointmentModal } from './components/shared/AgendaAppointmentModal.js'
export { BlockModal } from './components/shared/BlockModal.js'

export { AdminDayCalendar } from './components/admin/AdminDayCalendar.js'
export type {
  AdminDayCalendarProps,
  AdminDayCalendarClassNames,
  AppointmentMovePropose,
} from './components/admin/AdminDayCalendar.js'
export { AppointmentMoveBar } from './components/admin/AppointmentMoveBar.js'
export type { AppointmentMoveBarProps } from './components/admin/AppointmentMoveBar.js'
export { AdminAgendaControlBar } from './components/admin/AdminAgendaControlBar.js'
export type {
  AdminAgendaControlBarProps,
  AdminAgendaControlBarClassNames,
} from './components/admin/AdminAgendaControlBar.js'
export { AdminAgendaWorkspace } from './components/admin/AdminAgendaWorkspace.js'
export type {
  AdminAgendaWorkspaceProps,
  AdminAgendaWorkspaceClassNames,
} from './components/admin/AdminAgendaWorkspace.js'

export { StaffTimeGrid } from './components/staff/StaffTimeGrid.js'
export type {
  StaffTimeGridProps,
  StaffTimeGridClassNames,
} from './components/staff/StaffTimeGrid.js'
export { StaffAgendaPanel } from './components/staff/StaffAgendaPanel.js'
export type {
  StaffAgendaPanelProps,
  StaffAgendaPanelClassNames,
} from './components/staff/StaffAgendaPanel.js'
