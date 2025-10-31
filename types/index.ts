export interface User {
  id: string
  name: string
  totalWeight: number
  color?: string // User's unique color
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

export interface TeamMember {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: 'admin' | 'member'
  joinedAt: string
}

export interface Team {
  id: string
  name: string
  createdBy: string
  createdAt: string
  members: string[] // UIDs
  teamMembers: TeamMember[] // Full member info
  users: User[]
  schedule: Schedule
  notes: DayNotes
  settings: any
}

export interface ActivityLog {
  id: string
  teamId: string
  userId: string
  userName: string
  action: string
  details: string
  timestamp: string
}

