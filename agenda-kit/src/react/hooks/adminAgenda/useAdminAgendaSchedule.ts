import { useCallback, useEffect, useState } from 'react'
import type { StaffDaySchedule, WorkTimeWindow } from '../../../core/types/index.js'
import { useAgendaDataSource } from '../../context.js'

export function useAdminAgendaSchedule(token: string, date: string) {
  const ds = useAgendaDataSource()
  const [schedules, setSchedules] = useState<StaffDaySchedule[]>([])
  const [salonWindows, setSalonWindows] = useState<WorkTimeWindow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gridActionsBusy, setGridActionsBusy] = useState(false)

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!token) return
      if (!opts?.silent) setLoading(true)
      try {
        const res = await ds.fetchDaySchedule(date, token, 'admin')
        setSchedules(res.schedules)
        setSalonWindows(res.salonWindows ?? [])
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar la agenda')
      } finally {
        if (!opts?.silent) setLoading(false)
      }
    },
    [ds, token, date],
  )

  useEffect(() => {
    void load()
  }, [load])

  return {
    schedules,
    salonWindows,
    loading,
    error,
    setError,
    load,
    gridActionsBusy,
    setGridActionsBusy,
  }
}
