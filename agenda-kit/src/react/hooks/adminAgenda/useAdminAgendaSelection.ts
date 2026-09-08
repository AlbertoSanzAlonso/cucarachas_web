import { useCallback, useState } from 'react'
import type { StaffDaySchedule } from '../../../core/types/index.js'
import {
  summarizeStaffColumnGridSelection,
  blockGroupsFromGridSummary,
  singleFreeTimeFromGridSummary,
} from '../../../core/agenda/gridSelection.js'
import type { AdminColumnSelection } from './types.js'

export function useAdminAgendaSelection(schedules: StaffDaySchedule[], date: string) {
  const [selection, setSelection] = useState<AdminColumnSelection | null>(null)

  const clearSelection = useCallback(() => setSelection(null), [])
  const resetSelection = clearSelection

  const toggleSlot = useCallback((staffId: string, staffName: string, time: string) => {
    setSelection((prev) => {
      if (!prev || prev.staffId !== staffId) {
        return { staffId, staffName, times: new Set([time]) }
      }
      const times = new Set(prev.times)
      if (times.has(time)) times.delete(time)
      else times.add(time)
      if (times.size === 0) return null
      return { staffId, staffName, times }
    })
  }, [])

  const applySlots = useCallback((staffId: string, staffName: string, times: Set<string>) => {
    if (times.size === 0) {
      setSelection(null)
      return
    }
    setSelection({ staffId, staffName, times: new Set(times) })
  }, [])

  const selectionSummary = selection
    ? summarizeStaffColumnGridSelection(schedules, selection.staffId, date, selection.times)
    : null

  const pendingBlockGroups = selectionSummary
    ? blockGroupsFromGridSummary(selectionSummary)
    : null

  const singleFreeTime = selectionSummary
    ? singleFreeTimeFromGridSummary(selectionSummary)
    : undefined

  return {
    selection,
    setSelection,
    clearSelection,
    resetSelection,
    toggleSlot,
    applySlots,
    selectionSummary,
    pendingBlockGroups,
    singleFreeTime,
  }
}
