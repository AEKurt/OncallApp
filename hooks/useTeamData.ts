'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc, DocumentData, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { User, MonthlySchedules, MonthlyNotes, ExtendedSchedule, LockedMonths, MonthlyWeightSettings, TeamMember, ActivityLog, EnvironmentInfoMap, MonthlyUnavailability, DayNoteComments, MonthSettings } from '@/types'
import { WeightSettings } from '@/lib/scheduler'

// Helper to get month key from date (YYYY-MM format)
export function getMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function useTeamData(teamId: string | null, currentDate: Date = new Date()) {
  const [users, setUsers] = useState<User[]>([])
  const [monthlySchedules, setMonthlySchedules] = useState<MonthlySchedules>({})
  const [monthlyNotes, setMonthlyNotes] = useState<MonthlyNotes>({})
  const [lockedMonths, setLockedMonths] = useState<LockedMonths>({})
  const [monthlySettings, setMonthlySettings] = useState<MonthlyWeightSettings>({})
  const [defaultSettings, setDefaultSettings] = useState<WeightSettings | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamName, setTeamName] = useState<string>('')
  const [createdBy, setCreatedBy] = useState<string>('')
  const [inviteCode, setInviteCode] = useState<string>('')
  const [environmentInfo, setEnvironmentInfo] = useState<EnvironmentInfoMap>({})
  const [unavailability, setUnavailability] = useState<MonthlyUnavailability>({})
  const [loading, setLoading] = useState(true)

  // Get current month's schedule, notes, and settings
  const monthKey = getMonthKey(currentDate)
  const schedule = monthlySchedules[monthKey] || {}
  const notes = monthlyNotes[monthKey] || {}
  const isCurrentMonthLocked = lockedMonths[monthKey] || false
  const currentUnavailability = unavailability[monthKey] || []
  // Use month-specific settings if available, otherwise fall back to default, then to hardcoded default
  const settings = monthlySettings[monthKey] || defaultSettings || { 
    weekdayWeight: 1.0, 
    weekendWeight: 1.5, 
    holidayWeight: 2.0,
    strategyConfig: { strategy: 'balanced' as const, consecutiveDays: 7 }
  }

  useEffect(() => {
    if (!teamId) {
      setLoading(false)
      return
    }

    const teamRef = doc(db, 'teams', teamId)

    const unsubscribe = onSnapshot(
      teamRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as DocumentData
        setUsers(data.users || [])
        
        // Handle migration from old structure to new monthly structure
        if (data.schedules) {
          // Check if schedules use new ExtendedSchedule format or old string format
          const schedules = data.schedules || {}
          const migratedSchedules: MonthlySchedules = {}
          
          Object.keys(schedules).forEach(monthKey => {
            migratedSchedules[monthKey] = {}
            const monthSchedule = schedules[monthKey]
            
            Object.keys(monthSchedule).forEach(dateStr => {
              const assignment = monthSchedule[dateStr]
              
              // Check if already in new format (object with primary/secondary)
              if (typeof assignment === 'object' && assignment !== null && 'primary' in assignment) {
                migratedSchedules[monthKey][dateStr] = assignment
              } else if (typeof assignment === 'string') {
                // Migrate from old string format to new object format
                migratedSchedules[monthKey][dateStr] = { primary: assignment }
              }
            })
          })
          
          setMonthlySchedules(migratedSchedules)
        } else if (data.schedule) {
          // Migrate old schedule to new format
          const migratedSchedules: MonthlySchedules = {}
          Object.keys(data.schedule || {}).forEach(dateStr => {
            const date = new Date(dateStr)
            const key = getMonthKey(date)
            if (!migratedSchedules[key]) {
              migratedSchedules[key] = {}
            }
            // Convert old string format to new object format
            const userId = data.schedule[dateStr]
            migratedSchedules[key][dateStr] = typeof userId === 'string' ? { primary: userId } : userId
          })
          setMonthlySchedules(migratedSchedules)
        } else {
          setMonthlySchedules({})
        }

        // Handle migration from old notes to new monthly notes
        if (data.monthlyNotes) {
          setMonthlyNotes(data.monthlyNotes || {})
        } else if (data.notes) {
          // Migrate old notes to new format
          const migratedNotes: MonthlyNotes = {}
          Object.keys(data.notes || {}).forEach(dateStr => {
            const date = new Date(dateStr)
            const key = getMonthKey(date)
            if (!migratedNotes[key]) {
              migratedNotes[key] = {}
            }
            migratedNotes[key][dateStr] = data.notes[dateStr]
          })
          setMonthlyNotes(migratedNotes)
        } else {
          setMonthlyNotes({})
        }

        setLockedMonths(data.lockedMonths || {})
        setMonthlySettings(data.monthlySettings || {})
        setDefaultSettings(data.settings || null)
        setTeamMembers(data.teamMembers || [])
        setTeamName(data.name || '')
        setCreatedBy(data.createdBy || '')
        setInviteCode(data.inviteCode || '')
        setEnvironmentInfo(data.environmentInfo || {})
        setUnavailability(data.unavailability || {})
      }
      setLoading(false)
    },
      (error) => {
        console.error('Error fetching team data:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [teamId])

  const updateTeamUsers = async (newUsers: User[]) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    await updateDoc(teamRef, { users: newUsers })
  }

  const updateTeamSchedule = async (newSchedule: ExtendedSchedule, targetDate: Date = currentDate) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    const key = getMonthKey(targetDate)
    
    // Update only the specific month
    const updatedMonthlySchedules = {
      ...monthlySchedules,
      [key]: newSchedule
    }
    
    await updateDoc(teamRef, { schedules: updatedMonthlySchedules })
  }

  const updateTeamNotes = async (newNotes: DayNoteComments, targetDate: Date = currentDate) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    const key = getMonthKey(targetDate)
    
    // Update only the specific month
    const updatedMonthlyNotes = {
      ...monthlyNotes,
      [key]: newNotes
    }
    
    await updateDoc(teamRef, { monthlyNotes: updatedMonthlyNotes })
  }

  const updateTeamSettings = async (newSettings: MonthSettings, targetDate?: Date) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    
    // If targetDate is provided, update monthly settings for that month
    if (targetDate) {
      const key = getMonthKey(targetDate)
      const updatedMonthlySettings = {
        ...monthlySettings,
        [key]: newSettings
      }
      await updateDoc(teamRef, { monthlySettings: updatedMonthlySettings })
    } else {
      // Update default/global settings
      await updateDoc(teamRef, { settings: newSettings })
    }
  }

  const lockMonth = async (targetDate: Date = currentDate) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    const key = getMonthKey(targetDate)
    
    const updatedLockedMonths = {
      ...lockedMonths,
      [key]: true
    }
    
    await updateDoc(teamRef, { lockedMonths: updatedLockedMonths })
  }

  const unlockMonth = async (targetDate: Date = currentDate) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    const key = getMonthKey(targetDate)
    
    const updatedLockedMonths = {
      ...lockedMonths,
      [key]: false
    }
    
    await updateDoc(teamRef, { lockedMonths: updatedLockedMonths })
  }

  const updateEnvironmentInfo = async (environmentInfo: EnvironmentInfoMap) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    await updateDoc(teamRef, { environmentInfo })
  }

  const updateUnavailability = async (unavailability: MonthlyUnavailability) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    await updateDoc(teamRef, { unavailability })
  }

  return {
    users,
    schedule, // Current month's schedule
    notes, // Current month's notes
    settings, // Current month's settings (or default)
    isCurrentMonthLocked, // Is current month locked?
    currentUnavailability, // Current month's unavailability
    monthlySchedules, // All monthly schedules
    monthlyNotes, // All monthly notes
    monthlySettings, // All monthly settings
    defaultSettings, // Default/global settings
    lockedMonths, // All locked months
    unavailability, // All unavailability data
    teamMembers,
    teamName,
    createdBy,
    inviteCode,
    environmentInfo, // Environment/resource information
    loading,
    updateTeamUsers,
    updateTeamSchedule,
    updateTeamNotes,
    updateTeamSettings,
    updateEnvironmentInfo,
    updateUnavailability,
    lockMonth,
    unlockMonth,
  }
}

// Generate a random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous characters
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a new team
export async function createTeam(userId: string, teamName: string, userEmail: string, userName: string, userPhoto?: string): Promise<string> {
  const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const inviteCode = generateInviteCode()
  const teamRef = doc(db, 'teams', teamId)

  const adminMember: TeamMember = {
    uid: userId,
    email: userEmail,
    displayName: userName,
    photoURL: userPhoto,
    role: 'admin',
    joinedAt: new Date().toISOString(),
  }

  await setDoc(teamRef, {
    name: teamName,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    inviteCode: inviteCode,
    members: [userId],
    teamMembers: [adminMember],
    users: [],
    schedules: {}, // Changed from schedule to schedules
    monthlyNotes: {}, // Changed from notes to monthlyNotes
    lockedMonths: {}, // Initialize locked months
    monthlySettings: {}, // Initialize monthly settings
    environmentInfo: {}, // Initialize environment info
    unavailability: {}, // Initialize unavailability tracking
    settings: {
      weekdayWeight: 1.0,
      weekendWeight: 1.5,
      holidayWeight: 2.0,
    },
  })

  // Log activity
  await logActivity(teamId, userId, userName, 'team_created', `Created team "${teamName}"`)

  return teamId
}

// Join an existing team by invite code
export async function joinTeamByInviteCode(inviteCode: string, userId: string, userEmail: string, userName: string, userPhoto?: string): Promise<string | null> {
  try {
    console.log('🔍 Attempting to join team with invite code:', inviteCode)
    console.log('🔍 User ID:', userId)
    
    // Find team by invite code
    const teamsRef = collection(db, 'teams')
    const q = query(teamsRef, where('inviteCode', '==', inviteCode.toUpperCase().trim()))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      console.error('❌ No team found with this invite code')
      throw new Error('Invalid invite code. Please check and try again.')
    }

    const teamDoc = querySnapshot.docs[0]
    const teamId = teamDoc.id
    const teamData = teamDoc.data()
    
    console.log('✅ Team found:', teamData.name)
    console.log('✅ Team ID:', teamId)
    
    // Check if user is already a member
    if (teamData.members?.includes(userId)) {
      console.log('✅ User already a member')
      return teamId
    }

    // Color palette for new users
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
      '#06b6d4', '#f97316', '#84cc16', '#6366f1', '#14b8a6',
    ]

    // Create user entry
    const currentUsers = teamData.users || []
    const userColor = colors[currentUsers.length % colors.length]
    const newUser = {
      id: userId,
      name: userName,
      totalWeight: 0,
      color: userColor,
    }

    // Create team member entry
    const newMember: TeamMember = {
      uid: userId,
      email: userEmail,
      displayName: userName,
      photoURL: userPhoto,
      role: 'member',
      joinedAt: new Date().toISOString(),
    }

    // Update team
    const teamRef = doc(db, 'teams', teamId)
    await updateDoc(teamRef, {
      members: [...(teamData.members || []), userId],
      teamMembers: [...(teamData.teamMembers || []), newMember],
      users: [...currentUsers, newUser],
    })

    console.log('✅ Member added successfully')
    console.log('✅ User added to schedule list automatically')

    // Log activity
    try {
      await logActivity(teamId, userId, userName, 'member_joined', `${userName} joined the team`)
    } catch (activityError) {
      console.warn('⚠️ Could not log activity, but join was successful')
    }

    return teamId
  } catch (error: any) {
    console.error('❌ Error joining team:', error)
    throw error
  }
}

// Join an existing team (legacy - by team ID, kept for backward compatibility)
export async function joinTeam(teamId: string, userId: string, userEmail: string, userName: string, userPhoto?: string): Promise<boolean> {
  try {
    console.log('🔍 Attempting to join team:', teamId)
    console.log('🔍 User ID:', userId)
    
    const teamRef = doc(db, 'teams', teamId)
    
    // First, try to read the team to check if it exists
    let teamData: any
    try {
      const teamSnapshot = await getDoc(teamRef)
      console.log('🔍 Team Snapshot exists:', teamSnapshot.exists())
      
      if (!teamSnapshot.exists()) {
        console.error('❌ Team does not exist in Firestore')
        throw new Error('Team not found. Please check the Team ID.')
      }
      
      teamData = teamSnapshot.data()
      console.log('✅ Team found:', teamData.name)
      console.log('✅ Current members:', teamData.members)
      
      // Check if user is already a member
      if (teamData.members?.includes(userId)) {
        console.log('✅ User already a member, redirecting...')
        return true
      }
    } catch (readError: any) {
      console.log('⚠️ Cannot read team directly, trying alternative method...')
      console.log('⚠️ Error:', readError.message)
      
      // If we can't read (permission denied), try to join anyway
      // The update permission might work if rules allow self-adding
      teamData = { members: [], teamMembers: [] }
    }

    const newMember: TeamMember = {
      uid: userId,
      email: userEmail,
      displayName: userName,
      photoURL: userPhoto,
      role: 'member',
      joinedAt: new Date().toISOString(),
    }

    console.log('➕ Adding new member:', newMember)

    // Color palette for new users
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
      '#06b6d4', '#f97316', '#84cc16', '#6366f1', '#14b8a6',
    ]

    // Create a user entry for the new member
    const currentUsers = teamData.users || []
    const userColor = colors[currentUsers.length % colors.length]
    const newUser = {
      id: userId,
      name: userName,
      totalWeight: 0,
      color: userColor,
    }

    // Try to update - this should work with the new rules
    await updateDoc(teamRef, {
      members: [...(teamData.members || []), userId],
      teamMembers: [...(teamData.teamMembers || []), newMember],
      users: [...currentUsers, newUser],
    })

    console.log('✅ Member added successfully')
    console.log('✅ User added to schedule list automatically')

    // Log activity
    try {
      await logActivity(teamId, userId, userName, 'member_joined', `${userName} joined the team`)
    } catch (activityError) {
      console.warn('⚠️ Could not log activity, but join was successful')
    }

    return true
  } catch (error: any) {
    console.error('❌ Error joining team:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error code:', error.code)
    
    // More specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please make sure Firestore rules are updated correctly.')
    } else if (error.code === 'not-found') {
      throw new Error('Team not found. Please check the Team ID.')
    } else {
      throw error
    }
  }
}

// Get user's teams
export async function getUserTeams(userId: string): Promise<Array<{ id: string; name: string; role: string }>> {
  try {
    const teamsQuery = query(
      collection(db, 'teams'),
      where('members', 'array-contains', userId)
    )
    
    const snapshot = await getDocs(teamsQuery)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      const member = data.teamMembers?.find((m: TeamMember) => m.uid === userId)
      return {
        id: doc.id,
        name: data.name || 'Unnamed Team',
        role: member?.role || 'member',
      }
    })
  } catch (error) {
    console.error('Error getting user teams:', error)
    return []
  }
}

// Log activity
export async function logActivity(
  teamId: string,
  userId: string,
  userName: string,
  action: string,
  details: string
) {
  try {
    const activityRef = collection(db, 'teams', teamId, 'activity')
    await addDoc(activityRef, {
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

// Get activity logs
export async function getActivityLogs(teamId: string, limitCount: number = 20): Promise<ActivityLog[]> {
  try {
    const activityRef = collection(db, 'teams', teamId, 'activity')
    const q = query(activityRef, orderBy('timestamp', 'desc'), limit(limitCount))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      teamId,
      ...doc.data(),
    } as ActivityLog))
  } catch (error) {
    console.error('Error getting activity logs:', error)
    return []
  }
}

// Leave team
export async function leaveTeam(teamId: string, userId: string, userName: string): Promise<boolean> {
  try {
    const teamRef = doc(db, 'teams', teamId)
    const teamSnapshot = await getDoc(teamRef)
    
    if (!teamSnapshot.exists()) {
      return false
    }

    const teamData = teamSnapshot.data()
    
    // Don't allow creator to leave if they're the only admin
    if (teamData.createdBy === userId) {
      const admins = teamData.teamMembers?.filter((m: TeamMember) => m.role === 'admin') || []
      if (admins.length <= 1) {
        throw new Error('Cannot leave: You are the only admin. Promote another member to admin first.')
      }
    }

    // Remove from members array
    const newMembers = (teamData.members || []).filter((id: string) => id !== userId)
    
    // Remove from teamMembers array
    const newTeamMembers = (teamData.teamMembers || []).filter((m: TeamMember) => m.uid !== userId)

    await updateDoc(teamRef, {
      members: newMembers,
      teamMembers: newTeamMembers,
    })

    // Log activity
    await logActivity(teamId, userId, userName, 'member_left', `${userName} left the team`)

    return true
  } catch (error) {
    console.error('Error leaving team:', error)
    throw error
  }
}

// Delete team (only creator can delete)
export async function deleteTeam(teamId: string, userId: string, userName: string): Promise<boolean> {
  try {
    const teamRef = doc(db, 'teams', teamId)
    const teamSnapshot = await getDoc(teamRef)
    
    if (!teamSnapshot.exists()) {
      return false
    }

    const teamData = teamSnapshot.data()
    
    // Only creator can delete team
    if (teamData.createdBy !== userId) {
      throw new Error('Only the team creator can delete the team.')
    }

    // Log activity before deletion
    await logActivity(teamId, userId, userName, 'team_deleted', `${userName} deleted the team "${teamData.name}"`)

    // Delete all activity subcollection documents first
    const activityRef = collection(db, 'teams', teamId, 'activity')
    const activitySnapshot = await getDocs(activityRef)
    
    const deleteBatch = activitySnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deleteBatch)

    // Delete the team document
    await deleteDoc(teamRef)

    return true
  } catch (error) {
    console.error('Error deleting team:', error)
    throw error
  }
}

// Regenerate invite code (admin only)
export async function regenerateInviteCode(teamId: string, userId: string, userName: string): Promise<string> {
  try {
    const teamRef = doc(db, 'teams', teamId)
    const teamSnapshot = await getDoc(teamRef)
    
    if (!teamSnapshot.exists()) {
      throw new Error('Team not found.')
    }

    const teamData = teamSnapshot.data()
    
    // Check if current user is admin
    const currentUserMember = teamData.teamMembers?.find((m: TeamMember) => m.uid === userId)
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      throw new Error('Only admins can regenerate the invite code.')
    }

    // Generate new invite code
    const newInviteCode = generateInviteCode()
    
    await updateDoc(teamRef, {
      inviteCode: newInviteCode,
    })

    // Log activity
    await logActivity(
      teamId, 
      userId, 
      userName, 
      'invite_code_regenerated', 
      `${userName} regenerated the team invite code`
    )

    return newInviteCode
  } catch (error) {
    console.error('Error regenerating invite code:', error)
    throw error
  }
}

// Remove member from team (admin only)
export async function removeMemberFromTeam(
  teamId: string, 
  memberUidToRemove: string, 
  currentUserId: string, 
  currentUserName: string
): Promise<boolean> {
  try {
    const teamRef = doc(db, 'teams', teamId)
    const teamSnapshot = await getDoc(teamRef)
    
    if (!teamSnapshot.exists()) {
      throw new Error('Team not found.')
    }

    const teamData = teamSnapshot.data()
    
    // Check if current user is admin
    const currentUserMember = teamData.teamMembers?.find((m: TeamMember) => m.uid === currentUserId)
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      throw new Error('Only admins can remove members.')
    }

    // Don't allow removing yourself
    if (memberUidToRemove === currentUserId) {
      throw new Error('Cannot remove yourself. Use "Leave Team" instead.')
    }

    // Don't allow removing the creator
    if (memberUidToRemove === teamData.createdBy) {
      throw new Error('Cannot remove the team creator.')
    }

    // Get member info for logging
    const memberToRemove = teamData.teamMembers?.find((m: TeamMember) => m.uid === memberUidToRemove)
    
    // Remove from members array
    const newMembers = (teamData.members || []).filter((id: string) => id !== memberUidToRemove)
    
    // Remove from teamMembers array
    const newTeamMembers = (teamData.teamMembers || []).filter((m: TeamMember) => m.uid !== memberUidToRemove)

    await updateDoc(teamRef, {
      members: newMembers,
      teamMembers: newTeamMembers,
    })

    // Log activity
    await logActivity(
      teamId, 
      currentUserId, 
      currentUserName, 
      'member_removed', 
      `${currentUserName} removed ${memberToRemove?.displayName || 'a member'} from the team`
    )

    return true
  } catch (error) {
    console.error('Error removing member:', error)
    throw error
  }
}

