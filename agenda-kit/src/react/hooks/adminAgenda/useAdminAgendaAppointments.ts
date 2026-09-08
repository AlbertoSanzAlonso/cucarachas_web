import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  BookableService,
  DayScheduleAppointment,
  StaffDaySchedule,
} from '../../../core/types/index.js'
import { useAgendaDataSource } from '../../context.js'
import {
  appointmentToDraft,
  EMPTY_APPOINTMENT_DRAFT,
  joinCustomerName,
  type AppointmentDraft,
} from '../../types.js'
import type { AdminColumnSelection } from './types.js'
import type { ConfirmDialogState } from '../agenda/useAgendaConfirm.js'

type AppointmentsDeps = {
  token: string
  date: string
  schedules: StaffDaySchedule[]
  selection: AdminColumnSelection | null
  clearSelection: () => void
  setSelection: (value: AdminColumnSelection | null) => void
  load: (opts?: { silent?: boolean }) => Promise<void>
  setError: (message: string | null) => void
  setConfirmDialog: (dialog: ConfirmDialogState | null) => void
}

export function useAdminAgendaAppointments({
  token,
  date,
  schedules,
  selection,
  clearSelection,
  setSelection,
  load,
  setError,
  setConfirmDialog,
}: AppointmentsDeps) {
  const ds = useAgendaDataSource()
  const [activeStaffId, setActiveStaffId] = useState<string | null>(null)
  const [services, setServices] = useState<BookableService[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [staffList, setStaffList] = useState<{ id: string; name: string; role: string | null }[]>(
    [],
  )
  const [slots, setSlots] = useState<string[]>([])
  const [slotsOverHours, setSlotsOverHours] = useState<string[]>([])
  const availabilityRequestId = useRef(0)
  const [aptDraft, setAptDraft] = useState<AppointmentDraft>({ ...EMPTY_APPOINTMENT_DRAFT })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false)
  const [viewingAppointment, setViewingAppointment] = useState<{
    staffId: string
    staffName: string
    apt: DayScheduleAppointment
  } | null>(null)
  const [detailEditMode, setDetailEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false)
  const [noShowBusy, setNoShowBusy] = useState(false)
  const [pendingNoShowId, setPendingNoShowId] = useState<string | null>(null)

  const scheduleForActiveStaff = schedules.find((s) => s.staffId === activeStaffId) ?? null

  useEffect(() => {
    if (!token) {
      setServices([])
      setStaffList([])
      setCatalogLoading(false)
      return
    }
    setCatalogLoading(true)
    void Promise.allSettled([ds.fetchServices(token), ds.fetchStaffList(token)])
      .then(([servicesResult, staffResult]) => {
        setServices(servicesResult.status === 'fulfilled' ? servicesResult.value : [])
        setStaffList(staffResult.status === 'fulfilled' ? staffResult.value : [])
      })
      .finally(() => setCatalogLoading(false))
  }, [ds, token])

  useEffect(() => {
    const filteredIds = aptDraft.serviceIds.filter((s) => s !== '')
    const effectiveDate = editingId && aptDraft.date ? aptDraft.date : date
    if (!activeStaffId || filteredIds.length === 0 || !effectiveDate || !token) {
      setSlots([])
      setSlotsOverHours([])
      return
    }

    const requestId = ++availabilityRequestId.current
    void ds
      .fetchSlots({
        date: effectiveDate,
        serviceIds: filteredIds,
        staffId: activeStaffId,
        token,
        mode: 'admin',
        excludeAppointmentId: editingId ?? undefined,
        serviceDurations: aptDraft.serviceDurations,
      })
      .then((r) => {
        if (requestId !== availabilityRequestId.current) return
        setSlots(r.slots)
        setSlotsOverHours(r.slotsOverHours)
      })
      .catch(() => {
        if (requestId !== availabilityRequestId.current) return
        setSlots([])
        setSlotsOverHours([])
      })
  }, [
    ds,
    activeStaffId,
    aptDraft.serviceIds.join(','),
    aptDraft.serviceDurations.join(','),
    aptDraft.date,
    date,
    token,
    editingId,
  ])

  const resetAppointmentForm = useCallback(() => {
    setEditingId(null)
    setError(null)
    setAptDraft({ ...EMPTY_APPOINTMENT_DRAFT })
  }, [setError])

  const selectStaff = useCallback((staffId: string) => {
    setActiveStaffId(staffId)
  }, [])

  const openNewAppointment = useCallback(
    (staffId: string, _staffName: string, time?: string) => {
      setActiveStaffId(staffId)
      setSelection(null)
      setEditingId(null)
      setViewingAppointment(null)
      setDetailEditMode(false)
      setAptDraft({
        ...EMPTY_APPOINTMENT_DRAFT,
        date,
        startTime: time ?? '',
      })
      setAppointmentFormOpen(true)
    },
    [date, setSelection],
  )

  const openNewAppointmentForActiveStaff = useCallback(() => {
    if (!activeStaffId) return
    openNewAppointment(activeStaffId, '')
  }, [activeStaffId, openNewAppointment])

  const closeAppointmentDetail = useCallback(() => {
    setViewingAppointment(null)
    setDetailEditMode(false)
    setEditingId(null)
    setError(null)
    setAptDraft({ ...EMPTY_APPOINTMENT_DRAFT })
  }, [setError])

  const openAppointmentDetail = useCallback(
    (staffId: string, apt: DayScheduleAppointment) => {
      const staffName = schedules.find((s) => s.staffId === staffId)?.staffName ?? ''
      setActiveStaffId(staffId)
      setSelection(null)
      setEditingId(apt.id)
      setDetailEditMode(false)
      setAppointmentFormOpen(false)
      setViewingAppointment({ staffId, staffName, apt })

      let siblings: DayScheduleAppointment[] | undefined
      if (apt.bookingGroupId) {
        const allApts = schedules.flatMap((s) => s.appointments)
        const groupApts = allApts.filter(
          (a) => a.bookingGroupId === apt.bookingGroupId && a.colorGroupRole !== 'wash',
        )
        if (groupApts.length > 1) siblings = groupApts
      }

      setAptDraft(appointmentToDraft(apt, undefined, siblings, date))
    },
    [date, schedules, setSelection],
  )

  const startDetailEdit = useCallback(() => {
    setDetailEditMode(true)
  }, [])

  const createAppointmentFromSelection = useCallback(() => {
    if (!selection || selection.times.size !== 1) return
    const startTime = [...selection.times][0]
    if (!startTime) return
    openNewAppointment(selection.staffId, selection.staffName, startTime)
  }, [selection, openNewAppointment])

  const buildPayload = useCallback(
    (staffId: string) => {
      const filteredIds = aptDraft.serviceIds.filter(Boolean)
      return {
        date: aptDraft.date || date,
        startTime: aptDraft.startTime,
        staffId,
        serviceIds: filteredIds,
        serviceDurations: aptDraft.serviceDurations,
        serviceStartTimes: aptDraft.serviceStartTimes,
        staffAssignments: aptDraft.staffAssignments,
        customerFirstName: aptDraft.customerFirstName,
        customerLastName: aptDraft.customerLastName,
        customerName: joinCustomerName(aptDraft.customerFirstName, aptDraft.customerLastName),
        customerPhone: aptDraft.customerPhone,
        customerEmail: aptDraft.customerEmail || undefined,
        notes: aptDraft.notes || undefined,
        locale: aptDraft.customerLocale,
      }
    },
    [aptDraft, date],
  )

  const persistAppointment = useCallback(async (): Promise<boolean> => {
    if (!activeStaffId || !token) return false
    if (!aptDraft.startTime || !aptDraft.customerPhone.trim()) {
      setError('Teléfono y hora son obligatorios')
      return false
    }
    setIsSubmitting(true)
    setError(null)
    try {
      if (editingId) {
        await ds.updateAppointment(
          editingId,
          {
            ...buildPayload(activeStaffId),
            serviceId: aptDraft.serviceIds.find(Boolean) ?? undefined,
            durationMinutes: aptDraft.serviceDurations[0] ?? undefined,
          },
          token,
          'admin',
        )
      } else {
        await ds.createAppointment(buildPayload(activeStaffId), token, 'admin')
      }
      setAppointmentFormOpen(false)
      closeAppointmentDetail()
      resetAppointmentForm()
      clearSelection()
      await load()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la cita')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [
    activeStaffId,
    token,
    aptDraft,
    editingId,
    ds,
    buildPayload,
    closeAppointmentDetail,
    resetAppointmentForm,
    clearSelection,
    load,
    setError,
  ])

  const saveAppointment = useCallback(
    async (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.()
      return persistAppointment()
    },
    [persistAppointment],
  )

  const cancelAppointmentById = useCallback(
    (id: string) => {
      setConfirmDialog({
        title: '¿Cancelar esta cita?',
        message: 'La cita quedará cancelada.',
        confirmLabel: 'Cancelar cita',
        onConfirm: async () => {
          setError(null)
          try {
            await ds.cancelAppointment(id, token, 'admin')
            setAppointmentFormOpen(false)
            closeAppointmentDetail()
            resetAppointmentForm()
            await load()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo cancelar la cita')
          }
        },
      })
    },
    [
      setConfirmDialog,
      ds,
      token,
      closeAppointmentDetail,
      resetAppointmentForm,
      load,
      setError,
    ],
  )

  const markNoShowById = useCallback((id: string) => {
    setPendingNoShowId(id)
    setNoShowDialogOpen(true)
  }, [])

  const closeNoShowDialog = useCallback(() => {
    if (noShowBusy) return
    setNoShowDialogOpen(false)
    setPendingNoShowId(null)
  }, [noShowBusy])

  const persistNoShow = useCallback(async (): Promise<boolean> => {
    if (!pendingNoShowId || !token) return false
    setNoShowBusy(true)
    setError(null)
    try {
      await ds.markNoShow(pendingNoShowId, token, 'admin')
      setNoShowDialogOpen(false)
      setPendingNoShowId(null)
      closeAppointmentDetail()
      resetAppointmentForm()
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la inasistencia')
      return false
    } finally {
      setNoShowBusy(false)
    }
  }, [
    pendingNoShowId,
    token,
    ds,
    closeAppointmentDetail,
    resetAppointmentForm,
    load,
    setError,
  ])

  const resetAppointmentUi = useCallback(() => {
    setActiveStaffId(null)
    setAppointmentFormOpen(false)
    setEditingId(null)
    setViewingAppointment(null)
    setDetailEditMode(false)
    setAptDraft({ ...EMPTY_APPOINTMENT_DRAFT })
    setNoShowDialogOpen(false)
    setPendingNoShowId(null)
  }, [])

  const servicesForPicker = useMemo(() => {
    const byId = new Map(services.map((s) => [s.id, s]))
    for (const id of aptDraft.serviceIds) {
      if (!id || byId.has(id)) continue
      const fromSchedule = schedules.flatMap((s) => s.appointments).find((a) => a.serviceId === id)
      if (!fromSchedule) continue
      byId.set(id, {
        id: fromSchedule.serviceId,
        nameEs: fromSchedule.serviceName,
        nameEn: fromSchedule.serviceName,
        durationMinutes: fromSchedule.durationMinutes,
        categoryId: fromSchedule.categoryId,
      })
    }
    return Array.from(byId.values())
  }, [services, aptDraft.serviceIds, schedules])

  return {
    activeStaffId,
    scheduleForActiveStaff,
    services: servicesForPicker,
    catalogLoading,
    adminStaff: staffList,
    slots,
    slotsOverHours,
    aptDraft,
    setAptDraft,
    editingId,
    appointmentFormOpen,
    setAppointmentFormOpen,
    resetAppointmentForm,
    selectStaff,
    openNewAppointment,
    openNewAppointmentForActiveStaff,
    viewingAppointment,
    detailEditMode,
    setDetailEditMode,
    openAppointmentDetail,
    closeAppointmentDetail,
    startDetailEdit,
    createAppointmentFromSelection,
    persistAppointment,
    saveAppointment,
    isSubmitting,
    cancelAppointmentById,
    noShowDialogOpen,
    noShowBusy,
    closeNoShowDialog,
    persistNoShow,
    markNoShowById,
    resetAppointmentUi,
    formSlotTime:
      appointmentFormOpen && !editingId && activeStaffId ? aptDraft.startTime || null : null,
    formStaffId: appointmentFormOpen && !editingId ? activeStaffId : null,
  }
}
