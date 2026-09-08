import { useCallback, useEffect } from 'react'
import { useAgendaPolling } from '../agenda/useAgendaPolling.js'
import { useAgendaConfirm } from '../agenda/useAgendaConfirm.js'
import { useAdminAgendaSchedule } from './useAdminAgendaSchedule.js'
import { useAdminAgendaSelection } from './useAdminAgendaSelection.js'
import { useAdminAgendaGridBlocks } from './useAdminAgendaGridBlocks.js'
import { useAdminAgendaAppointments } from './useAdminAgendaAppointments.js'
import { useAdminAgendaMoves } from './useAdminAgendaMoves.js'

export type { AdminColumnSelection } from './types.js'
export type { AppointmentMoveDraft } from '../../../core/agenda/pendingMoves.js'
export type { AppointmentDragEndPayload } from './useAdminAgendaMoves.js'

export function useAdminAgenda(token: string, date: string) {
  const schedule = useAdminAgendaSchedule(token, date)
  const selectionState = useAdminAgendaSelection(schedule.schedules, date)
  const confirm = useAgendaConfirm()

  const appointments = useAdminAgendaAppointments({
    token,
    date,
    schedules: schedule.schedules,
    selection: selectionState.selection,
    clearSelection: selectionState.clearSelection,
    setSelection: selectionState.setSelection,
    load: schedule.load,
    setError: schedule.setError,
    setConfirmDialog: confirm.setConfirmDialog,
  })

  const blocks = useAdminAgendaGridBlocks({
    token,
    date,
    schedules: schedule.schedules,
    selection: selectionState.selection,
    clearSelection: selectionState.clearSelection,
    setSelection: selectionState.setSelection,
    load: schedule.load,
    setError: schedule.setError,
    setGridActionsBusy: schedule.setGridActionsBusy,
  })

  const moves = useAdminAgendaMoves({
    token,
    date,
    schedules: schedule.schedules,
    load: schedule.load,
    setError: schedule.setError,
    clearSelection: selectionState.clearSelection,
  })

  useEffect(() => {
    selectionState.resetSelection()
    appointments.resetAppointmentUi()
    moves.resetMoves()
    // Reset only when the agenda day changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const gridInteractionsLocked = moves.pendingMoves.length > 0

  const pollPaused =
    schedule.gridActionsBusy ||
    gridInteractionsLocked ||
    appointments.appointmentFormOpen ||
    appointments.detailEditMode ||
    appointments.noShowDialogOpen ||
    appointments.noShowBusy ||
    blocks.blockModalOpen ||
    blocks.viewingBlock != null ||
    blocks.blockDetailBusy ||
    confirm.confirmDialog != null ||
    moves.moveBusy

  useAgendaPolling(schedule.load, {
    enabled: Boolean(token),
    paused: pollPaused,
  })

  useEffect(() => {
    if (!gridInteractionsLocked) return
    selectionState.clearSelection()
    appointments.setAppointmentFormOpen(false)
    appointments.resetAppointmentForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridInteractionsLocked])

  const toggleSlot = useCallback(
    (staffId: string, staffName: string, time: string) => {
      if (gridInteractionsLocked) return
      appointments.selectStaff(staffId)
      selectionState.toggleSlot(staffId, staffName, time)
    },
    [gridInteractionsLocked, appointments.selectStaff, selectionState.toggleSlot],
  )

  const applySlots = useCallback(
    (staffId: string, staffName: string, times: Set<string>) => {
      if (gridInteractionsLocked) return
      appointments.selectStaff(staffId)
      selectionState.applySlots(staffId, staffName, times)
    },
    [gridInteractionsLocked, appointments.selectStaff, selectionState.applySlots],
  )

  const requestBlockSelectedSlots = useCallback(() => {
    if (gridInteractionsLocked) return
    blocks.requestBlockSelectedSlots()
  }, [gridInteractionsLocked, blocks.requestBlockSelectedSlots])

  const unblockSelectedSlots = useCallback(async () => {
    if (gridInteractionsLocked) return
    await blocks.unblockSelectedSlots()
  }, [gridInteractionsLocked, blocks.unblockSelectedSlots])

  const createAppointmentFromSelection = useCallback(() => {
    if (gridInteractionsLocked) return
    appointments.createAppointmentFromSelection()
  }, [gridInteractionsLocked, appointments.createAppointmentFromSelection])

  const openNewAppointmentForActiveStaff = useCallback(() => {
    if (gridInteractionsLocked) return
    appointments.openNewAppointmentForActiveStaff()
  }, [gridInteractionsLocked, appointments.openNewAppointmentForActiveStaff])

  return {
    schedules: schedule.schedules,
    salonWindows: schedule.salonWindows,
    loading: schedule.loading,
    error: schedule.error,
    setError: schedule.setError,
    load: schedule.load,
    selection: selectionState.selection,
    selectionSummary: selectionState.selectionSummary,
    toggleSlot,
    applySlots,
    clearSelection: selectionState.clearSelection,
    gridInteractionsLocked,
    gridActionsBusy: schedule.gridActionsBusy,
    blockModalOpen: blocks.blockModalOpen,
    pendingBlockGroups: blocks.pendingBlockGroups,
    requestBlockSelectedSlots,
    cancelBlockModal: blocks.cancelBlockModal,
    confirmBlockWithScope: blocks.confirmBlockWithScope,
    unblockSelectedSlots,
    createAppointmentFromSelection,
    appointmentFormOpen: appointments.appointmentFormOpen,
    setAppointmentFormOpen: appointments.setAppointmentFormOpen,
    activeStaffId: appointments.activeStaffId,
    scheduleForActiveStaff: appointments.scheduleForActiveStaff,
    services: appointments.services,
    catalogLoading: appointments.catalogLoading,
    adminStaff: appointments.adminStaff,
    slots: appointments.slots,
    slotsOverHours: appointments.slotsOverHours,
    aptDraft: appointments.aptDraft,
    setAptDraft: appointments.setAptDraft,
    editingId: appointments.editingId,
    resetAppointmentForm: appointments.resetAppointmentForm,
    selectStaff: appointments.selectStaff,
    openNewAppointment: appointments.openNewAppointment,
    openNewAppointmentForActiveStaff,
    viewingAppointment: appointments.viewingAppointment,
    detailEditMode: appointments.detailEditMode,
    openAppointmentDetail: appointments.openAppointmentDetail,
    closeAppointmentDetail: appointments.closeAppointmentDetail,
    startDetailEdit: appointments.startDetailEdit,
    setDetailEditMode: appointments.setDetailEditMode,
    saveAppointment: appointments.saveAppointment,
    persistAppointment: appointments.persistAppointment,
    isSubmitting: appointments.isSubmitting,
    cancelAppointmentById: appointments.cancelAppointmentById,
    noShowDialogOpen: appointments.noShowDialogOpen,
    noShowBusy: appointments.noShowBusy,
    closeNoShowDialog: appointments.closeNoShowDialog,
    markNoShowById: appointments.markNoShowById,
    confirmNoShow: appointments.persistNoShow,
    viewingBlock: blocks.viewingBlock,
    blockDetailBusy: blocks.blockDetailBusy,
    blockNote: blocks.blockNote,
    setBlockNote: blocks.setBlockNote,
    openBlockDetail: blocks.openBlockDetail,
    resizeBlock: blocks.resizeBlock,
    closeBlockDetail: blocks.closeBlockDetail,
    saveBlockNote: blocks.saveBlockNote,
    deleteViewingBlock: blocks.deleteViewingBlock,
    confirmDialog: confirm.confirmDialog,
    confirmBusy: confirm.busy,
    closeConfirmDialog: confirm.close,
    runConfirmDialog: confirm.confirm,
    formSlotTime: appointments.formSlotTime,
    formStaffId: appointments.formStaffId,
    pendingMoves: moves.pendingMoves,
    pendingMoveSummary: moves.pendingMoveSummary,
    proposeAppointmentMove: moves.proposeMove,
    undoLastPendingMove: moves.undoLastPendingMove,
    discardPendingMoves: moves.discardMoves,
    commitPendingMoves: moves.commitMoves,
    moveBusy: moves.moveBusy,
  }
}

export type UseAdminAgendaReturn = ReturnType<typeof useAdminAgenda>
