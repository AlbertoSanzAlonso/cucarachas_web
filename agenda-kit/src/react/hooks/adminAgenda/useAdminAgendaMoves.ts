import { useCallback, useState } from 'react'
import type { DayScheduleAppointment, StaffDaySchedule } from '../../../core/types/index.js'
import {
  buildBookingGroupMoveDrafts,
  validatePendingMovesForSave,
} from '../../../core/agenda/placement.js'
import {
  getFinalMovesForSave,
  summarizePendingMoves,
  type AppointmentMoveDraft,
} from '../../../core/agenda/pendingMoves.js'
import { useAgendaDataSource } from '../../context.js'
import type { AdminColumnSelection } from './types.js'

export type AppointmentDragEndPayload = {
  appointment: DayScheduleAppointment
  fromStaffId: string
  fromStartTime: string
  toStaffId: string
  toStaffName: string
  toStartTime: string
}

export function useAdminAgendaMoves(input: {
  token: string
  date: string
  schedules: StaffDaySchedule[]
  load: (opts?: { silent?: boolean }) => Promise<void>
  setError: (msg: string | null) => void
  clearSelection: () => void
  onMovesCommitted?: () => void
}) {
  const ds = useAgendaDataSource()
  const [pendingMoves, setPendingMoves] = useState<AppointmentMoveDraft[]>([])
  const [moveBusy, setMoveBusy] = useState(false)

  const pendingMoveSummary = summarizePendingMoves(pendingMoves)

  const resetMoves = useCallback(() => setPendingMoves([]), [])

  const proposeMove = useCallback(
    (payload: AppointmentDragEndPayload) => {
      const result = buildBookingGroupMoveDrafts(
        input.schedules,
        input.date,
        {
          appointment: payload.appointment,
          fromStaffId: payload.fromStaffId,
          fromStartTime: payload.fromStartTime,
          toStaffId: payload.toStaffId,
          toStaffName: payload.toStaffName,
          toStartTime: payload.toStartTime,
        },
        pendingMoves,
        pendingMoveSummary,
      )
      if (!result.ok) {
        input.setError(result.message)
        return
      }
      if (result.moves.length === 0) return
      setPendingMoves((prev) => [...prev, ...result.moves])
      input.clearSelection()
    },
    [input, pendingMoves, pendingMoveSummary],
  )

  const discardMoves = useCallback(() => {
    setPendingMoves([])
  }, [])

  const undoLastPendingMove = useCallback(() => {
    setPendingMoves((prev) => (prev.length === 0 ? prev : prev.slice(0, -1)))
  }, [])

  const commitMoves = useCallback(async () => {
    const validation = validatePendingMovesForSave(
      input.schedules,
      input.date,
      pendingMoves,
    )
    if (!validation.ok) {
      input.setError(validation.message)
      return
    }
    setMoveBusy(true)
    input.setError(null)
    try {
      for (const move of getFinalMovesForSave(pendingMoves)) {
        await ds.updateAppointment(
          move.appointment.id,
          {
            staffId: move.toStaffId,
            startTime: move.toStartTime,
            date: input.date,
          },
          input.token,
          'admin',
        )
      }
      setPendingMoves([])
      input.onMovesCommitted?.()
      await input.load({ silent: true })
    } catch (e) {
      input.setError(e instanceof Error ? e.message : 'Error al guardar movimientos')
    } finally {
      setMoveBusy(false)
    }
  }, [ds, input, pendingMoves])

  return {
    pendingMoves,
    pendingMoveSummary,
    moveBusy,
    proposeMove,
    discardMoves,
    undoLastPendingMove,
    commitMoves,
    resetMoves,
  }
}

export type { AdminColumnSelection }
