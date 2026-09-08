export type AdminColumnSelection = {
  staffId: string
  staffName: string
  times: Set<string>
}

export type EditingScheduleBaseline = {
  schedulesKey: string
} | null
