export interface User {
  id: string
  name: string
  totalWeight: number
}

export interface Schedule {
  [date: string]: string // date (YYYY-MM-DD) -> user id
}

export interface DayNotes {
  [date: string]: string // date (YYYY-MM-DD) -> note
}

export interface DayInfo {
  date: Date
  dateString: string
  isWeekend: boolean
  isCurrentMonth: boolean
  weight: number
  assignedUserId?: string
  note?: string
}

