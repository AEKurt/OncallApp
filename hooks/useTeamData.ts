'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc, DocumentData, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { User, Schedule, DayNotes, TeamMember, ActivityLog } from '@/types'
import { WeightSettings } from '@/lib/scheduler'

export function useTeamData(teamId: string | null) {
  const [users, setUsers] = useState<User[]>([])
  const [schedule, setSchedule] = useState<Schedule>({})
  const [notes, setNotes] = useState<DayNotes>({})
  const [settings, setSettings] = useState<WeightSettings | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamName, setTeamName] = useState<string>('')
  const [createdBy, setCreatedBy] = useState<string>('')
  const [loading, setLoading] = useState(true)

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
          setSchedule(data.schedule || {})
          setNotes(data.notes || {})
          setSettings(data.settings || null)
          setTeamMembers(data.teamMembers || [])
          setTeamName(data.name || '')
          setCreatedBy(data.createdBy || '')
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

  const updateTeamSchedule = async (newSchedule: Schedule) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    await updateDoc(teamRef, { schedule: newSchedule })
  }

  const updateTeamNotes = async (newNotes: DayNotes) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    await updateDoc(teamRef, { notes: newNotes })
  }

  const updateTeamSettings = async (newSettings: WeightSettings) => {
    if (!teamId) return
    const teamRef = doc(db, 'teams', teamId)
    await updateDoc(teamRef, { settings: newSettings })
  }

  return {
    users,
    schedule,
    notes,
    settings,
    teamMembers,
    teamName,
    createdBy,
    loading,
    updateTeamUsers,
    updateTeamSchedule,
    updateTeamNotes,
    updateTeamSettings,
  }
}

// Create a new team
export async function createTeam(userId: string, teamName: string, userEmail: string, userName: string, userPhoto?: string): Promise<string> {
  const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
    members: [userId],
    teamMembers: [adminMember],
    users: [],
    schedule: {},
    notes: {},
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

// Join an existing team
export async function joinTeam(teamId: string, userId: string, userEmail: string, userName: string, userPhoto?: string): Promise<boolean> {
  try {
    const teamRef = doc(db, 'teams', teamId)
    const teamDoc = await getDocs(query(collection(db, 'teams'), where('__name__', '==', teamId), limit(1)))
    
    if (teamDoc.empty) {
      return false
    }

    const teamData = teamDoc.docs[0].data()
    
    // Check if user is already a member
    if (teamData.members?.includes(userId)) {
      return true
    }

    const newMember: TeamMember = {
      uid: userId,
      email: userEmail,
      displayName: userName,
      photoURL: userPhoto,
      role: 'member',
      joinedAt: new Date().toISOString(),
    }

    await updateDoc(teamRef, {
      members: [...(teamData.members || []), userId],
      teamMembers: [...(teamData.teamMembers || []), newMember],
    })

    // Log activity
    await logActivity(teamId, userId, userName, 'member_joined', `${userName} joined the team`)

    return true
  } catch (error) {
    console.error('Error joining team:', error)
    return false
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
    const teamDoc = await getDocs(query(collection(db, 'teams'), where('__name__', '==', teamId), limit(1)))
    
    if (teamDoc.empty) {
      return false
    }

    const teamData = teamDoc.docs[0].data()
    
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
    const teamDoc = await getDocs(query(collection(db, 'teams'), where('__name__', '==', teamId), limit(1)))
    
    if (teamDoc.empty) {
      return false
    }

    const teamData = teamDoc.docs[0].data()
    
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

