import { User, ExtendedSchedule, UnavailabilityEntry } from '@/types'
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isWeekend as checkIsWeekend,
  startOfWeek,
  endOfWeek,
  getMonth,
  getDate
} from 'date-fns'

export interface WeightSettings {
  weekdayWeight: number
  weekendWeight: number
  holidayWeight: number
}

export type ScheduleStrategy = 
  | 'balanced'           // Default: Fair distribution by weight
  | 'consecutive'        // Consecutive days (e.g., weekly rotations)
  | 'round-robin'        // Simple rotation regardless of weight
  | 'random'             // Random assignment
  | 'minimize-weekends'  // Minimize weekend assignments per person

export interface ScheduleStrategyConfig {
  strategy: ScheduleStrategy
  consecutiveDays?: number  // For consecutive strategy (default: 7)
  seed?: number            // For random strategy
}

export const DEFAULT_STRATEGY_CONFIG: ScheduleStrategyConfig = {
  strategy: 'balanced',
  consecutiveDays: 7,
}

export const DEFAULT_WEIGHTS: WeightSettings = {
  weekdayWeight: 1.0,
  weekendWeight: 1.5,
  holidayWeight: 2.0
}

// Türkiye Resmi Tatil Günleri (Sabit Tarihler)
// Format: { month: 0-11, day: 1-31 }
export const TURKISH_HOLIDAYS = [
  { month: 0, day: 1, name: 'Yılbaşı' },
  { month: 3, day: 23, name: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı' },
  { month: 4, day: 1, name: '1 Mayıs Emek ve Dayanışma Günü' },
  { month: 4, day: 19, name: '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı' },
  { month: 6, day: 15, name: '15 Temmuz Demokrasi ve Milli Birlik Günü' },
  { month: 7, day: 30, name: '30 Ağustos Zafer Bayramı' },
  { month: 9, day: 29, name: '29 Ekim Cumhuriyet Bayramı' },
]

export function isPublicHoliday(date: Date): boolean {
  const month = getMonth(date)
  const day = getDate(date)
  
  return TURKISH_HOLIDAYS.some(holiday => 
    holiday.month === month && holiday.day === day
  )
}

export function getHolidayName(date: Date): string | null {
  const month = getMonth(date)
  const day = getDate(date)
  
  const holiday = TURKISH_HOLIDAYS.find(h => 
    h.month === month && h.day === day
  )
  
  return holiday ? holiday.name : null
}

export function getDayWeight(date: Date, settings: WeightSettings | { weekdayWeight?: number; weekendWeight?: number; holidayWeight?: number } = DEFAULT_WEIGHTS): number {
  if (isPublicHoliday(date)) {
    return settings.holidayWeight ?? DEFAULT_WEIGHTS.holidayWeight
  }
  return checkIsWeekend(date) ? (settings.weekendWeight ?? DEFAULT_WEIGHTS.weekendWeight) : (settings.weekdayWeight ?? DEFAULT_WEIGHTS.weekdayWeight)
}

export function generateSchedule(
  users: User[], 
  currentDate: Date,
  settings: WeightSettings = DEFAULT_WEIGHTS,
  strategyConfig: ScheduleStrategyConfig = DEFAULT_STRATEGY_CONFIG,
  unavailability: UnavailabilityEntry[] = []
): ExtendedSchedule {
  if (users.length === 0) return {}

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Route to appropriate strategy
  switch (strategyConfig.strategy) {
    case 'consecutive':
      return generateConsecutiveSchedule(users, daysInMonth, settings, strategyConfig.consecutiveDays || 7, unavailability)
    case 'round-robin':
      return generateRoundRobinSchedule(users, daysInMonth, settings, unavailability)
    case 'random':
      return generateRandomSchedule(users, daysInMonth, settings, strategyConfig.seed, unavailability)
    case 'minimize-weekends':
      return generateMinimizeWeekendsSchedule(users, daysInMonth, settings, unavailability)
    case 'balanced':
    default:
      return generateBalancedSchedule(users, daysInMonth, settings, unavailability)
  }
}

// Strategy 1: Balanced (Original) - Fair distribution by weight
function generateBalancedSchedule(
  users: User[],
  daysInMonth: Date[],
  settings: WeightSettings,
  unavailability: UnavailabilityEntry[] = []
): ExtendedSchedule {
  const schedule: ExtendedSchedule = {}
  const primaryWeights: { [userId: string]: number } = {}
  const secondaryWeights: { [userId: string]: number } = {}
  
  // Initialize user weights
  users.forEach(user => {
    primaryWeights[user.id] = 0
    secondaryWeights[user.id] = 0
  })

  // Helper to check if a user is unavailable on a date
  const isUserUnavailable = (userId: string, dateString: string): boolean => {
    return unavailability.some(entry => entry.userId === userId && entry.date === dateString)
  }

  // For each day in the month, assign primary and secondary users
  daysInMonth.forEach(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    const dayWeight = getDayWeight(date, settings)
    
    // Filter available users for this date
    const availableUsers = users.filter(user => !isUserUnavailable(user.id, dateString))
    
    // If no users available, skip this day
    if (availableUsers.length === 0) {
      return
    }
    
    // Find user with minimum primary weight for primary assignment
    let minPrimaryWeight = Infinity
    let selectedPrimaryId = availableUsers[0].id
    
    availableUsers.forEach(user => {
      if (primaryWeights[user.id] < minPrimaryWeight) {
        minPrimaryWeight = primaryWeights[user.id]
        selectedPrimaryId = user.id
      }
    })
    
    // Find user with minimum secondary weight for secondary assignment
    let minSecondaryWeight = Infinity
    let selectedSecondaryId: string | undefined = undefined
    
    if (availableUsers.length > 1) {
      availableUsers.forEach(user => {
        if (user.id === selectedPrimaryId) return
        
        if (secondaryWeights[user.id] < minSecondaryWeight) {
          minSecondaryWeight = secondaryWeights[user.id]
          selectedSecondaryId = user.id
        }
      })
    }
    
    schedule[dateString] = {
      primary: selectedPrimaryId,
      ...(selectedSecondaryId ? { secondary: selectedSecondaryId } : {})
    }
    
    primaryWeights[selectedPrimaryId] += dayWeight
    if (selectedSecondaryId) {
      secondaryWeights[selectedSecondaryId] += dayWeight * 0.5
    }
  })

  return schedule
}

// Strategy 2: Consecutive Days - People work consecutive days (e.g., weekly rotations)
function generateConsecutiveSchedule(
  users: User[],
  daysInMonth: Date[],
  settings: WeightSettings,
  consecutiveDays: number,
  unavailability: UnavailabilityEntry[] = []
): ExtendedSchedule {
  const schedule: ExtendedSchedule = {}
  let currentUserIndex = 0
  let currentSecondaryIndex = 1 % users.length
  let dayCount = 0

  const isUserUnavailable = (userId: string, dateString: string): boolean => {
    return unavailability.some(entry => entry.userId === userId && entry.date === dateString)
  }

  daysInMonth.forEach(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    
    // Find available primary user
    let attempts = 0
    while (attempts < users.length && isUserUnavailable(users[currentUserIndex].id, dateString)) {
      currentUserIndex = (currentUserIndex + 1) % users.length
      currentSecondaryIndex = (currentUserIndex + 1) % users.length
      attempts++
    }
    
    // If no available user found, skip this day
    if (attempts >= users.length) {
      return
    }
    
    // Switch to next user after consecutiveDays
    if (dayCount >= consecutiveDays) {
      currentUserIndex = (currentUserIndex + 1) % users.length
      currentSecondaryIndex = (currentUserIndex + 1) % users.length
      dayCount = 0
    }
    
    const primaryUser = users[currentUserIndex]
    let secondaryUser = users.length > 1 ? users[currentSecondaryIndex] : undefined
    
    // If secondary is unavailable, try to find another one
    if (secondaryUser && isUserUnavailable(secondaryUser.id, dateString)) {
      secondaryUser = users.find((u, i) => 
        i !== currentUserIndex && !isUserUnavailable(u.id, dateString)
      )
    }
    
    schedule[dateString] = {
      primary: primaryUser.id,
      ...(secondaryUser ? { secondary: secondaryUser.id } : {})
    }
    
    dayCount++
  })

  return schedule
}

// Strategy 3: Round Robin - Simple rotation every day
function generateRoundRobinSchedule(
  users: User[],
  daysInMonth: Date[],
  settings: WeightSettings,
  unavailability: UnavailabilityEntry[] = []
): ExtendedSchedule {
  const schedule: ExtendedSchedule = {}
  let currentIndex = 0

  const isUserUnavailable = (userId: string, dateString: string): boolean => {
    return unavailability.some(entry => entry.userId === userId && entry.date === dateString)
  }

  daysInMonth.forEach(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    
    // Find available primary user
    let attempts = 0
    while (attempts < users.length && isUserUnavailable(users[currentIndex].id, dateString)) {
      currentIndex = (currentIndex + 1) % users.length
      attempts++
    }
    
    // If no available user found, skip this day
    if (attempts >= users.length) {
      return
    }
    
    const primaryUser = users[currentIndex]
    const secondaryIndex = (currentIndex + 1) % users.length
    let secondaryUser = users.length > 1 ? users[secondaryIndex] : undefined
    
    // If secondary is unavailable, try to find another one
    if (secondaryUser && isUserUnavailable(secondaryUser.id, dateString)) {
      secondaryUser = users.find((u, i) => 
        i !== currentIndex && !isUserUnavailable(u.id, dateString)
      )
    }
    
    schedule[dateString] = {
      primary: primaryUser.id,
      ...(secondaryUser ? { secondary: secondaryUser.id } : {})
    }
    
    currentIndex = (currentIndex + 1) % users.length
  })

  return schedule
}

// Strategy 4: Random - Random assignment with constraints
function generateRandomSchedule(
  users: User[],
  daysInMonth: Date[],
  settings: WeightSettings,
  seed?: number,
  unavailability: UnavailabilityEntry[] = []
): ExtendedSchedule {
  const schedule: ExtendedSchedule = {}
  
  // Simple seeded random for reproducibility
  let randomSeed = seed || Date.now()
  const seededRandom = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280
    return randomSeed / 233280
  }

  const isUserUnavailable = (userId: string, dateString: string): boolean => {
    return unavailability.some(entry => entry.userId === userId && entry.date === dateString)
  }

  daysInMonth.forEach(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    
    // Filter available users
    const availableUsers = users.filter(user => !isUserUnavailable(user.id, dateString))
    
    // If no users available, skip this day
    if (availableUsers.length === 0) {
      return
    }
    
    // Random primary from available users
    const primaryIndex = Math.floor(seededRandom() * availableUsers.length)
    const primaryUser = availableUsers[primaryIndex]
    
    // Random secondary (different from primary)
    let secondaryUser: User | undefined
    if (availableUsers.length > 1) {
      const secondaryAvailable = availableUsers.filter(u => u.id !== primaryUser.id)
      if (secondaryAvailable.length > 0) {
        const secondaryIndex = Math.floor(seededRandom() * secondaryAvailable.length)
        secondaryUser = secondaryAvailable[secondaryIndex]
      }
    }
    
    schedule[dateString] = {
      primary: primaryUser.id,
      ...(secondaryUser ? { secondary: secondaryUser.id } : {})
    }
  })

  return schedule
}

// Strategy 5: Minimize Weekends - Distribute weekend load fairly
function generateMinimizeWeekendsSchedule(
  users: User[],
  daysInMonth: Date[],
  settings: WeightSettings,
  unavailability: UnavailabilityEntry[] = []
): ExtendedSchedule {
  const schedule: ExtendedSchedule = {}
  const weekendCounts: { [userId: string]: number } = {}
  const totalCounts: { [userId: string]: number } = {}
  
  users.forEach(user => {
    weekendCounts[user.id] = 0
    totalCounts[user.id] = 0
  })

  const isUserUnavailable = (userId: string, dateString: string): boolean => {
    return unavailability.some(entry => entry.userId === userId && entry.date === dateString)
  }

  // Separate weekends and weekdays
  const weekends: Date[] = []
  const weekdays: Date[] = []
  
  daysInMonth.forEach(date => {
    if (checkIsWeekend(date) || isPublicHoliday(date)) {
      weekends.push(date)
    } else {
      weekdays.push(date)
    }
  })

  // Assign weekends first (fair distribution)
  weekends.forEach(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    
    // Filter available users
    const availableUsers = users.filter(user => !isUserUnavailable(user.id, dateString))
    
    // If no users available, skip this day
    if (availableUsers.length === 0) {
      return
    }
    
    // Find user with minimum weekend assignments
    let minWeekendCount = Infinity
    let selectedPrimaryId = availableUsers[0].id
    
    availableUsers.forEach(user => {
      if (weekendCounts[user.id] < minWeekendCount) {
        minWeekendCount = weekendCounts[user.id]
        selectedPrimaryId = user.id
      }
    })
    
    // Secondary with second-lowest weekend count
    let secondMinWeekendCount = Infinity
    let selectedSecondaryId: string | undefined
    
    if (availableUsers.length > 1) {
      availableUsers.forEach(user => {
        if (user.id === selectedPrimaryId) return
        if (weekendCounts[user.id] < secondMinWeekendCount) {
          secondMinWeekendCount = weekendCounts[user.id]
          selectedSecondaryId = user.id
        }
      })
    }
    
    schedule[dateString] = {
      primary: selectedPrimaryId,
      ...(selectedSecondaryId ? { secondary: selectedSecondaryId } : {})
    }
    
    weekendCounts[selectedPrimaryId]++
    totalCounts[selectedPrimaryId]++
    if (selectedSecondaryId) {
      weekendCounts[selectedSecondaryId]++
      totalCounts[selectedSecondaryId]++
    }
  })

  // Assign weekdays (balanced)
  weekdays.forEach(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    
    // Filter available users
    const availableUsers = users.filter(user => !isUserUnavailable(user.id, dateString))
    
    // If no users available, skip this day
    if (availableUsers.length === 0) {
      return
    }
    
    let minTotalCount = Infinity
    let selectedPrimaryId = availableUsers[0].id
    
    availableUsers.forEach(user => {
      if (totalCounts[user.id] < minTotalCount) {
        minTotalCount = totalCounts[user.id]
        selectedPrimaryId = user.id
      }
    })
    
    let secondMinTotalCount = Infinity
    let selectedSecondaryId: string | undefined
    
    if (availableUsers.length > 1) {
      availableUsers.forEach(user => {
        if (user.id === selectedPrimaryId) return
        if (totalCounts[user.id] < secondMinTotalCount) {
          secondMinTotalCount = totalCounts[user.id]
          selectedSecondaryId = user.id
        }
      })
    }
    
    schedule[dateString] = {
      primary: selectedPrimaryId,
      ...(selectedSecondaryId ? { secondary: selectedSecondaryId } : {})
    }
    
    totalCounts[selectedPrimaryId]++
    if (selectedSecondaryId) {
      totalCounts[selectedSecondaryId]++
    }
  })

  return schedule
}

export function calculateUserWeights(
  users: User[], 
  schedule: ExtendedSchedule, 
  currentDate: Date,
  settings: WeightSettings | { weekdayWeight?: number; weekendWeight?: number; holidayWeight?: number } = DEFAULT_WEIGHTS
): { [userId: string]: { primary: number; secondary: number; total: number } } {
  const weights: { [userId: string]: { primary: number; secondary: number; total: number } } = {}
  
  // Extract weight settings (MonthSettings might have extra fields like strategyConfig)
  const weightSettings: WeightSettings = {
    weekdayWeight: settings.weekdayWeight || 1.0,
    weekendWeight: settings.weekendWeight || 1.5,
    holidayWeight: settings.holidayWeight || 2.0
  }
  
  users.forEach(user => {
    weights[user.id] = { primary: 0, secondary: 0, total: 0 }
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  daysInMonth.forEach(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    const assignment = schedule[dateString]
    if (assignment) {
      const dayWeight = getDayWeight(date, weightSettings)
      
      // Add primary weight
      if (assignment.primary && weights[assignment.primary]) {
        weights[assignment.primary].primary += dayWeight
        weights[assignment.primary].total += dayWeight
      }
      
      // Add secondary weight (counts as 50% of primary)
      if (assignment.secondary && weights[assignment.secondary]) {
        const secondaryWeight = dayWeight * 0.5
        weights[assignment.secondary].secondary += secondaryWeight
        weights[assignment.secondary].total += secondaryWeight
      }
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

