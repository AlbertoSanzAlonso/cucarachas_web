/** Runtime config the host injects (no hard-coded salon seed). */
export type AgendaKitConfig = {
  timezone: string
  slotMinutes: number
  openDays: readonly number[]
  maxDaysAhead: number
  displayStartHour?: number
  displayEndHour?: number
}

export const DEFAULT_AGENDA_CONFIG: AgendaKitConfig = {
  timezone: 'Europe/Madrid',
  slotMinutes: 30,
  openDays: [1, 2, 3, 4, 5, 6],
  maxDaysAhead: 60,
  displayStartHour: 9,
  displayEndHour: 21,
}

let activeConfig: AgendaKitConfig = { ...DEFAULT_AGENDA_CONFIG }

export function getAgendaConfig(): AgendaKitConfig {
  return activeConfig
}

export function setAgendaConfig(partial: Partial<AgendaKitConfig>): AgendaKitConfig {
  activeConfig = { ...activeConfig, ...partial }
  return activeConfig
}

export function withAgendaConfig<T>(
  partial: Partial<AgendaKitConfig>,
  fn: () => T,
): T {
  const prev = activeConfig
  activeConfig = { ...prev, ...partial }
  try {
    return fn()
  } finally {
    activeConfig = prev
  }
}
