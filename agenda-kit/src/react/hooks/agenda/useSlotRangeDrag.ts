import { useMemo, useState } from 'react'
import {
  orderedTimesBetween,
  paintSlotRange,
  type SlotPaintMode,
} from '../../../core/agenda/slotRangeSelection.js'

export function useSlotRangeDrag(orderedTimes: readonly string[]) {
  const [dragging, setDragging] = useState(false)
  const [anchor, setAnchor] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [mode, setMode] = useState<SlotPaintMode>('add')
  const [base, setBase] = useState<ReadonlySet<string>>(new Set())

  const preview = useMemo(() => {
    if (!dragging || !anchor || !cursor) return null
    const range = orderedTimesBetween(orderedTimes, anchor, cursor)
    return paintSlotRange(base, range, mode)
  }, [dragging, anchor, cursor, orderedTimes, base, mode])

  function begin(time: string, currentSelection: ReadonlySet<string>) {
    const nextMode: SlotPaintMode = currentSelection.has(time) ? 'remove' : 'add'
    setMode(nextMode)
    setBase(new Set(currentSelection))
    setAnchor(time)
    setCursor(time)
    setDragging(true)
  }

  function move(time: string) {
    if (!dragging) return
    setCursor(time)
  }

  function end(): Set<string> | null {
    if (!dragging || !anchor || !cursor) {
      setDragging(false)
      return null
    }
    const range = orderedTimesBetween(orderedTimes, anchor, cursor)
    const next = paintSlotRange(base, range, mode)
    setDragging(false)
    setAnchor(null)
    setCursor(null)
    return next
  }

  function cancel() {
    setDragging(false)
    setAnchor(null)
    setCursor(null)
  }

  return { dragging, preview, begin, move, end, cancel }
}
