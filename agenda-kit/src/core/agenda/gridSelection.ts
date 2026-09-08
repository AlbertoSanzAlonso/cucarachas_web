import {
  buildStaffDayGrid,
  groupContiguousSlotTimes,
  summarizeGridSelection,
  type GridSelectionSummary,
} from './timeGrid.js'
import type { PendingBlockGroup, StaffDaySchedule } from '../types/index.js'

const EMPTY_SUMMARY: GridSelectionSummary = {
  freeTimes: [],
  blockIds: [],
  hasAppointment: false,
}

export function summarizeScheduleGridSelection(
  schedule: StaffDaySchedule,
  date: string,
  times: Set<string>,
): GridSelectionSummary {
  const cells = buildStaffDayGrid(schedule, date, undefined, 'fullDisplay')
  return summarizeGridSelection(times, cells)
}

export function summarizeStaffColumnGridSelection(
  schedules: StaffDaySchedule[],
  staffId: string,
  date: string,
  times: Set<string>,
): GridSelectionSummary {
  const schedule = schedules.find((s) => s.staffId === staffId)
  if (!schedule) return EMPTY_SUMMARY
  return summarizeScheduleGridSelection(schedule, date, times)
}

export function blockGroupsFromGridSummary(
  summary: GridSelectionSummary,
): PendingBlockGroup[] | null {
  if (summary.hasAppointment || summary.freeTimes.length === 0) return null
  return groupContiguousSlotTimes(summary.freeTimes)
}

export function singleFreeTimeFromGridSummary(
  summary: GridSelectionSummary,
): string | undefined {
  if (summary.freeTimes.length !== 1) return undefined
  return summary.freeTimes[0]
}
