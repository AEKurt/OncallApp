import { User, Schedule } from '@/types'
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isWeekend as checkIsWeekend,
  startOfWeek,
  endOfWeek
} from 'date-fns'

export interface WeightSettings {
  weekdayWeight: number
  weekendWeight: number
}

export const DEFAULT_WEIGHTS: WeightSettings = {
  weekdayWeight: 1.0,
  weekendWeight: 1.5
}

export function getDayWeight(date: Date, settings: WeightSettings = DEFAULT_WEIGHTS): number {
  return checkIsWeekend(date) ? settings.weekendWeight : settings.weekdayWeight
}

export function generateSchedule(
  users: User[], 
  currentDate: Date,
  settings: WeightSettings = DEFAULT_WEIGHTS
): Schedule {
  if (users.length === 0) return {}

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const schedule: Schedule = {}
  const userWeights: { [userId: string]: number } = {}
  
  // Initialize user weights
  users.forEach(user => {
    userWeights[user.id] = 0
  })

  // For each day in the month, assign the user with lowest weight
  daysInMonth.forEach(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    const dayWeight = getDayWeight(date, settings)
    
    // Find user with minimum weight
    let minWeight = Infinity
    let selectedUserId = users[0].id
    
    users.forEach(user => {
      if (userWeights[user.id] < minWeight) {
        minWeight = userWeights[user.id]
        selectedUserId = user.id
      }
    })
    
    schedule[dateString] = selectedUserId
    userWeights[selectedUserId] += dayWeight
  })

  return schedule
}

export function calculateUserWeights(
  users: User[], 
  schedule: Schedule, 
  currentDate: Date,
  settings: WeightSettings = DEFAULT_WEIGHTS
): { [userId: string]: number } {
  const weights: { [userId: string]: number } = {}
  
  users.forEach(user => {
    weights[user.id] = 0
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  daysInMonth.forEach(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    const userId = schedule[dateString]
    if (userId && weights[userId] !== undefined) {
      const dayWeight = getDayWeight(date, settings)
      weights[userId] += dayWeight
    }
  })

  return weights
}

export function getCalendarDays(currentDate: Date) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // Get full weeks (including days from prev/next month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
}

