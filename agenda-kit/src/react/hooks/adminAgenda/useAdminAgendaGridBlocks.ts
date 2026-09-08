import { useCallback, useState } from 'react'
import {
  blockGroupsFromGridSummary,
  summarizeStaffColumnGridSelection,
} from '../../../core/agenda/gridSelection.js'
import type {
  BlockScope,
  DayScheduleBlock,
  PendingBlockGroup,
  StaffDaySchedule,
} from '../../../core/types/index.js'
import { useAgendaDataSource } from '../../context.js'
import type { AdminColumnSelection } from './types.js'

type AdminBlockView = {
  staffId: string
  staffName: string
  block: DayScheduleBlock
}

type GridBlocksDeps = {
  token: string
  date: string
  schedules: StaffDaySchedule[]
  selection: AdminColumnSelection | null
  clearSelection: () => void
  setSelection: (value: AdminColumnSelection | null) => void
  load: (opts?: { silent?: boolean }) => Promise<void>
  setError: (message: string | null) => void
  setGridActionsBusy: (busy: boolean) => void
}

export function useAdminAgendaGridBlocks({
  token,
  date,
  schedules,
  selection,
  clearSelection,
  setSelection,
  load,
  setError,
  setGridActionsBusy,
}: GridBlocksDeps) {
  const ds = useAgendaDataSource()
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [pendingBlockGroups, setPendingBlockGroups] = useState<PendingBlockGroup[]>([])
  const [viewingBlock, setViewingBlock] = useState<AdminBlockView | null>(null)
  const [blockDetailBusy, setBlockDetailBusy] = useState(false)
  const [blockNote, setBlockNote] = useState('')

  const requestBlockSelectedSlots = useCallback(() => {
    if (!selection) return
    const summary = summarizeStaffColumnGridSelection(
      schedules,
      selection.staffId,
      date,
      selection.times,
    )
    const groups = blockGroupsFromGridSummary(summary)
    if (!groups || groups.length === 0) return
    setPendingBlockGroups(groups)
    setBlockModalOpen(true)
  }, [selection, schedules, date])

  const cancelBlockModal = useCallback(() => {
    setBlockModalOpen(false)
    setPendingBlockGroups([])
  }, [])

  const confirmBlockWithScope = useCallback(
    async (scope: BlockScope = 'single', endDate?: string, note?: string) => {
      if (!selection || !token || pendingBlockGroups.length === 0) return
      setGridActionsBusy(true)
      setError(null)
      try {
        for (const group of pendingBlockGroups) {
          await ds.createBlock(
            {
              staffId: selection.staffId,
              date,
              startTime: group.startTime,
              endTime: group.endTime,
              scope,
              endDate,
              note,
            },
            token,
            'admin',
          )
        }
        setBlockModalOpen(false)
        setPendingBlockGroups([])
        clearSelection()
        await load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo bloquear')
      } finally {
        setGridActionsBusy(false)
      }
    },
    [
      selection,
      token,
      pendingBlockGroups,
      date,
      ds,
      clearSelection,
      load,
      setError,
      setGridActionsBusy,
    ],
  )

  const unblockSelectedSlots = useCallback(async () => {
    if (!selection || !token) return
    const { blockIds } = summarizeStaffColumnGridSelection(
      schedules,
      selection.staffId,
      date,
      selection.times,
    )
    if (blockIds.length === 0) return

    setGridActionsBusy(true)
    setError(null)
    try {
      for (const id of blockIds) {
        await ds.deleteBlock(id, token, 'admin')
      }
      clearSelection()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo quitar el bloqueo')
    } finally {
      setGridActionsBusy(false)
    }
  }, [selection, token, schedules, date, ds, clearSelection, load, setError, setGridActionsBusy])

  const openBlockDetail = useCallback(
    (staffId: string, block: DayScheduleBlock) => {
      const staffName = schedules.find((s) => s.staffId === staffId)?.staffName ?? ''
      setSelection(null)
      setViewingBlock({ staffId, staffName, block })
      setBlockNote(block.note ?? '')
    },
    [schedules, setSelection],
  )

  const closeBlockDetail = useCallback(() => {
    setViewingBlock(null)
    setBlockNote('')
  }, [])

  const resizeBlock = useCallback(
    async (_staffId: string, block: DayScheduleBlock, startTime: string, endTime: string) => {
      if (!token) return
      if (block.startTime === startTime && block.endTime === endTime) return
      setGridActionsBusy(true)
      setError(null)
      try {
        await ds.updateBlock(block.id, { startTime, endTime }, token, 'admin')
        await load({ silent: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo ajustar el bloqueo')
        await load({ silent: true })
      } finally {
        setGridActionsBusy(false)
      }
    },
    [token, ds, load, setError, setGridActionsBusy],
  )

  const saveBlockNote = useCallback(
    async (note: string) => {
      if (!viewingBlock || !token) return
      setBlockDetailBusy(true)
      setError(null)
      try {
        await ds.updateBlock(viewingBlock.block.id, { note }, token, 'admin')
        setViewingBlock(null)
        await load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar la nota')
      } finally {
        setBlockDetailBusy(false)
      }
    },
    [viewingBlock, token, ds, load, setError],
  )

  const deleteViewingBlock = useCallback(async () => {
    if (!viewingBlock || !token) return
    setBlockDetailBusy(true)
    setError(null)
    try {
      await ds.deleteBlock(viewingBlock.block.id, token, 'admin')
      setViewingBlock(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el bloqueo')
    } finally {
      setBlockDetailBusy(false)
    }
  }, [viewingBlock, token, ds, load, setError])

  return {
    blockModalOpen,
    pendingBlockGroups,
    requestBlockSelectedSlots,
    cancelBlockModal,
    confirmBlockWithScope,
    unblockSelectedSlots,
    viewingBlock,
    blockDetailBusy,
    blockNote,
    setBlockNote,
    openBlockDetail,
    resizeBlock,
    closeBlockDetail,
    saveBlockNote,
    deleteViewingBlock,
  }
}
