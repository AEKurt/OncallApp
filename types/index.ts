export interface User {
  id: string
  name: string
  totalWeight: number
  color?: string // User's unique color
}

export interface Schedule {
  [date: string]: string // date (YYYY-MM-DD) -> user id
}

// Extended schedule with primary and secondary (backup) assignments
export interface ScheduleAssignment {
  primary: string // Primary on-call user id
  secondary?: string // Secondary/backup on-call user id (optional)
}

export interface ExtendedSchedule {
  [date: string]: ScheduleAssignment // date (YYYY-MM-DD) -> assignment
}

// Comment/Note structure with user info
export interface NoteComment {
  id: string // Unique comment ID
  userId: string
  userName: string
  userPhotoURL?: string
  text: string
  timestamp: string // ISO string
  editedAt?: string // ISO string if edited
}

// Notes for a single day (array of comments)
export interface DayNoteComments {
  [date: string]: NoteComment[] // date (YYYY-MM-DD) -> array of comments
}

// Legacy: Simple string notes (for migration)
export interface DayNotes {
  [date: string]: string // date (YYYY-MM-DD) -> note
}

// Monthly schedules: { "2025-01": { "2025-01-15": { primary: "user123", secondary: "user456" } }, "2025-02": { ... } }
export interface MonthlySchedules {
  [monthKey: string]: ExtendedSchedule // monthKey format: "YYYY-MM"
}

// Monthly notes: { "2025-01": { "2025-01-15": [comments...] }, "2025-02": { ... } }
export interface MonthlyNotes {
  [monthKey: string]: DayNoteComments // monthKey format: "YYYY-MM"
}

// Locked months: { "2025-01": true, "2025-02": false }
export interface LockedMonths {
  [monthKey: string]: boolean // monthKey format: "YYYY-MM"
}

// Strategy configuration for scheduling
export interface StrategyConfig {
  strategy: 'balanced' | 'consecutive' | 'round-robin' | 'random' | 'minimize-weekends'
  consecutiveDays?: number // For consecutive strategy (default: 7)
  seed?: number // For random strategy
}

// Monthly settings including weights and strategy
export interface MonthSettings {
  weekdayWeight?: number
  weekendWeight?: number
  holidayWeight?: number
  strategyConfig?: StrategyConfig
}

// Monthly weight settings: { "2025-01": { weekdayWeight: 1.0, strategyConfig: {...} }, "2025-02": { ... } }
export interface MonthlyWeightSettings {
  [monthKey: string]: MonthSettings // monthKey format: "YYYY-MM"
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

// Environment/Resource Information for On-Call
export interface EnvironmentInfo {
  id: string
  title: string
  category: 'server' | 'database' | 'api' | 'credential' | 'runbook' | 'contact' | 'other'
  description?: string
  content: string // Supports Markdown
  tags: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  isSecret?: boolean // If true, show "reveal" button
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  updatedBy?: string
  updatedByName?: string
}

export interface EnvironmentInfoMap {
  [infoId: string]: EnvironmentInfo
}

// Unavailability tracking
export interface UnavailabilityEntry {
  userId: string
  userName: string
  date: string // YYYY-MM-DD
  reason?: string
  createdAt: string
}

export interface MonthlyUnavailability {
  [monthKey: string]: UnavailabilityEntry[] // monthKey format: "YYYY-MM"
}

export interface Team {
  id: string
  name: string
  createdBy: string
  createdAt: string
  members: string[] // UIDs
  teamMembers: TeamMember[] // Full member info
  users: User[]
  schedules: MonthlySchedules // Changed from schedule to schedules (monthly)
  notes: MonthlyNotes // Changed to monthly notes
  lockedMonths: LockedMonths // Months that are locked by admin
  settings: MonthSettings // Default/global settings (includes weights and strategy)
  monthlySettings: MonthlyWeightSettings // Per-month settings (weights and strategy)
  environmentInfo: EnvironmentInfoMap // On-call resource information
  unavailability: MonthlyUnavailability // User unavailability tracking
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

