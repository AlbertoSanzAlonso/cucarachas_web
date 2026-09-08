import { getAgendaConfig } from '../config.js'
import { minutesToTime } from '../time/index.js'

/** Slots entre displayStartHour y displayEndHour según config activa. */
export function getAllDaySlots(): string[] {
  const cfg = getAgendaConfig()
  const startHour = cfg.displayStartHour ?? 9
  const endHour = cfg.displayEndHour ?? 21
  const slotMinutes = cfg.slotMinutes
  const startMin = startHour * 60
  const endMin = endHour * 60
  const slots: string[] = []
  for (let m = startMin; m < endMin; m += slotMinutes) {
    slots.push(minutesToTime(m))
  }
  return slots
}

/** Alias: regenera desde la config actual (no un array estático). */
export function ALL_DAY_SLOTS(): string[] {
  return getAllDaySlots()
}

export type EditableServiceTimeOptions = {
  freeOptions: string[]
  occupiedOptions: string[]
  extraCurrent: string[]
  isOccupied: boolean
}

/**
 * Opciones del selector de hora de un tratamiento adicional.
 * Ofrece toda la franja libre del especialista seleccionado ese día.
 */
export function buildEditableServiceTimeOptions(input: {
  currentVal: string
  /** Slots libres del especialista de este tratamiento. */
  perServiceFree: readonly string[]
  /** Fallback si aún no hay slots por servicio. */
  fallbackFree: readonly string[]
  /** Horas de esta misma visita que no deben marcarse ocupadas. */
  ownTimes?: ReadonlySet<string> | readonly string[]
}): EditableServiceTimeOptions {
  const { currentVal, perServiceFree, fallbackFree } = input
  const ownTimes = input.ownTimes
    ? input.ownTimes instanceof Set
      ? input.ownTimes
      : new Set(input.ownTimes)
    : new Set<string>()

  const hasPerServiceSlots = perServiceFree.length > 0
  const sourceFree = hasPerServiceSlots ? perServiceFree : fallbackFree
  const freeSet = new Set(sourceFree)
  for (const time of ownTimes) {
    if (time) freeSet.add(time)
  }
  const freeOptions = [...freeSet].sort()

  const lastFree = freeOptions.length > 0 ? freeOptions[freeOptions.length - 1]! : null
  const firstFree = freeOptions.length > 0 ? freeOptions[0]! : null

  const occupiedOptions = getAllDaySlots().filter((t) => {
    if (freeSet.has(t)) return false
    if (hasPerServiceSlots || fallbackFree.length > 0) {
      if (firstFree && t < firstFree) return false
      if (lastFree && t > lastFree) return false
    }
    return true
  })

  const isOccupied = currentVal !== '' && !freeSet.has(currentVal)
  const extraCurrent =
    currentVal !== '' &&
    !freeSet.has(currentVal) &&
    !occupiedOptions.includes(currentVal)
      ? [currentVal]
      : []

  return { freeOptions, occupiedOptions, extraCurrent, isOccupied }
}
