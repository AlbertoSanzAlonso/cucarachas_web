import { useCallback, useEffect, useState } from 'react'
import type {
  BookableService,
  DayScheduleAppointment,
  DayScheduleBlock,
  StaffDaySchedule,
} from '../../core/types/index.js'
import { useAgendaDataSource } from '../context.js'
import {
  appointmentToDraft,
  EMPTY_APPOINTMENT_DRAFT,
  joinCustomerName,
  type AppointmentDraft,
} from '../types.js'
import { getAgendaConfig } from '../../core/config.js'
import { minutesToTime, timeToMinutes } from '../../core/time/index.js'

export function useStaffAgenda(token: string, date: string) {
  const ds = useAgendaDataSource()
  const [schedule, setSchedule] = useState<StaffDaySchedule | null>(null)
  const [services, setServices] = useState<BookableService[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState<AppointmentDraft>({ ...EMPTY_APPOINTMENT_DRAFT, date })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [blockOpen, setBlockOpen] = useState(false)
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockNote, setBlockNote] = useState('')
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!token) return
      if (!opts?.silent) setLoading(true)
      try {
        const [day, svc] = await Promise.all([
          ds.fetchDaySchedule(date, token, 'staff'),
          ds.fetchServices(token),
        ])
        setSchedule(day.schedules[0] ?? null)
        setServices(svc)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar')
      } finally {
        if (!opts?.silent) setLoading(false)
      }
    },
    [ds, token, date],
  )

  useEffect(() => {
    void load()
  }, [load])

  const toggleSlot = useCallback((time: string) => {
    setSelection((prev) => {
      const next = new Set(prev)
      if (next.has(time)) next.delete(time)
      else next.add(time)
      return next
    })
  }, [])

  const openAppointment = useCallback(
    (apt: DayScheduleAppointment) => {
      setEditingId(apt.id)
      setDraft(appointmentToDraft(apt, undefined, undefined, date))
      setFormOpen(true)
    },
    [date],
  )

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditingId(null)
    setDraft({ ...EMPTY_APPOINTMENT_DRAFT, date })
  }, [date])

  const saveAppointment = useCallback(async () => {
    if (!schedule) return
    setBusy(true)
    setError(null)
    try {
      const payload = {
        staffId: schedule.staffId,
        serviceIds: draft.serviceIds.filter(Boolean),
        serviceId: draft.serviceIds[0],
        date: draft.date || date,
        startTime: draft.startTime,
        customerFirstName: draft.customerFirstName,
        customerLastName: draft.customerLastName,
        customerName: joinCustomerName(draft.customerFirstName, draft.customerLastName),
        customerPhone: draft.customerPhone,
        customerEmail: draft.customerEmail,
        notes: draft.notes,
        customerLocale: draft.customerLocale,
      }
      if (editingId) {
        await ds.updateAppointment(editingId, payload, token, 'staff')
      } else {
        await ds.createAppointment(payload, token, 'staff')
      }
      closeForm()
      setSelection(new Set())
      await load({ silent: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar cita')
    } finally {
      setBusy(false)
    }
  }, [schedule, draft, date, editingId, ds, token, closeForm, load])

  const openBlock = useCallback((block: DayScheduleBlock) => {
    setEditingBlockId(block.id)
    setBlockStart(block.startTime)
    setBlockEnd(block.endTime)
    setBlockNote(block.note ?? '')
    setBlockOpen(true)
  }, [])

  const closeBlock = useCallback(() => {
    setBlockOpen(false)
    setEditingBlockId(null)
    setBlockNote('')
  }, [])

  const saveBlock = useCallback(async () => {
    if (!schedule) return
    setBusy(true)
    try {
      if (editingBlockId) {
        await ds.updateBlock(
          editingBlockId,
          { startTime: blockStart, endTime: blockEnd, note: blockNote },
          token,
          'staff',
        )
      } else {
        let start = blockStart
        let end = blockEnd
        if (selection.size > 0) {
          const sorted = [...selection].sort()
          start = sorted[0]!
          const last = sorted[sorted.length - 1]!
          end = minutesToTime(timeToMinutes(last) + getAgendaConfig().slotMinutes)
        }
        await ds.createBlock(
          {
            staffId: schedule.staffId,
            date,
            startTime: start,
            endTime: end,
            note: blockNote,
          },
          token,
          'staff',
        )
      }
      closeBlock()
      setSelection(new Set())
      await load({ silent: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar bloqueo')
    } finally {
      setBusy(false)
    }
  }, [
    schedule,
    editingBlockId,
    blockStart,
    blockEnd,
    blockNote,
    selection,
    ds,
    token,
    date,
    closeBlock,
    load,
  ])

  const deleteBlock = useCallback(async () => {
    if (!editingBlockId) return
    setBusy(true)
    try {
      await ds.deleteBlock(editingBlockId, token, 'staff')
      closeBlock()
      await load({ silent: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar bloqueo')
    } finally {
      setBusy(false)
    }
  }, [editingBlockId, ds, token, closeBlock, load])

  const openCreateFromSelection = useCallback(() => {
    const times = [...selection].sort()
    setEditingId(null)
    setDraft({
      ...EMPTY_APPOINTMENT_DRAFT,
      date,
      startTime: times[0] ?? '',
    })
    setFormOpen(true)
  }, [selection, date])

  const openCreateBlockFromSelection = useCallback(() => {
    const times = [...selection].sort()
    if (times.length === 0) return
    const slot = getAgendaConfig().slotMinutes
    setEditingBlockId(null)
    setBlockStart(times[0]!)
    setBlockEnd(minutesToTime(timeToMinutes(times[times.length - 1]!) + slot))
    setBlockNote('')
    setBlockOpen(true)
  }, [selection])

  return {
    schedule,
    services,
    loading,
    error,
    busy,
    selection,
    toggleSlot,
    applySelection: (times: Set<string>) => setSelection(new Set(times)),
    formOpen,
    draft,
    setDraft,
    editingId,
    openAppointment,
    openCreateFromSelection,
    openCreateBlockFromSelection,
    closeForm,
    saveAppointment,
    blockOpen,
    blockStart,
    blockEnd,
    blockNote,
    setBlockStart,
    setBlockEnd,
    setBlockNote,
    editingBlockId,
    openBlock,
    closeBlock,
    saveBlock,
    deleteBlock,
    load,
  }
}

export type UseStaffAgendaReturn = ReturnType<typeof useStaffAgenda>
