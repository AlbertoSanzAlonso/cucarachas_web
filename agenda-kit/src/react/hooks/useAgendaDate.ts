import { useCallback, useState } from 'react'
import { addDaysToDateString, isValidDateString, todaySalon } from '../../core/time/index.js'

/**
 * Controlled agenda date without requiring react-router.
 * Host can sync with URL via onDateChange.
 */
export function useAgendaDate(initialDate?: string, onDateChange?: (date: string) => void) {
  const [date, setDateState] = useState(() => {
    if (initialDate && isValidDateString(initialDate)) return initialDate
    return todaySalon()
  })

  const setDate = useCallback(
    (next: string) => {
      if (!isValidDateString(next)) return
      setDateState(next)
      onDateChange?.(next)
    },
    [onDateChange],
  )

  const shiftDays = useCallback(
    (delta: number) => {
      setDate(addDaysToDateString(date, delta))
    },
    [date, setDate],
  )

  const goToday = useCallback(() => {
    setDate(todaySalon())
  }, [setDate])

  return { date, setDate, shiftDays, goToday }
}
