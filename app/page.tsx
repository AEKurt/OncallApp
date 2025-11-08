'use client'

import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Calendar } from '@/components/Calendar'
import { UserManagement } from '@/components/UserManagement'
import { Statistics } from '@/components/Statistics'
import { Settings, WeightSettings as WeightSettingsType } from '@/components/Settings'
import { LoginPage } from '@/components/LoginPage'
import { TeamSelection } from '@/components/TeamSelection'
import { TeamMembers } from '@/components/TeamMembers'
import { ActivityLogComponent } from '@/components/ActivityLog'
import { ThemeToggleCompact } from '@/components/ThemeToggle'
import { generateSchedule, DEFAULT_WEIGHTS } from '@/lib/scheduler'
import { User, ExtendedSchedule } from '@/types'
import { Users, Calendar as CalendarIcon, Zap, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTeamData, logActivity } from '@/hooks/useTeamData'

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'calendar' | 'users'>('calendar')

  const {
    users,
    schedule,
    notes,
    settings,
    isCurrentMonthLocked,
    monthlySchedules,
    monthlyNotes,
    monthlySettings,
    defaultSettings,
    lockedMonths,
    teamMembers,
    teamName,
    createdBy,
    inviteCode,
    loading: teamLoading,
    updateTeamUsers,
    updateTeamSchedule,
    updateTeamNotes,
    updateTeamSettings,
    lockMonth,
    unlockMonth,
  } = useTeamData(selectedTeamId, currentDate) // Pass currentDate to hook

  const weightSettings = settings || DEFAULT_WEIGHTS
  
  // Check if current user is admin
  const currentUserRole = teamMembers.find(m => m.uid === user?.uid)?.role || 'member'
  const isAdmin = currentUserRole === 'admin'

  // Save selected team to localStorage
  useEffect(() => {
    if (selectedTeamId) {
      localStorage.setItem('selected-team-id', selectedTeamId)
    }
  }, [selectedTeamId])

  // Load selected team from localStorage
  useEffect(() => {
    const savedTeamId = localStorage.getItem('selected-team-id')
    if (savedTeamId && user) {
      setSelectedTeamId(savedTeamId)
    }
  }, [user])

  const addUser = (name: string) => {
    // All team members can add users (not just admins)
    
    // Color palette for users
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // green
      '#06b6d4', // cyan
      '#f97316', // orange
      '#84cc16', // lime
      '#6366f1', // indigo
      '#14b8a6', // teal
    ]
    
    // Assign color based on user index
    const userColor = colors[users.length % colors.length]
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      totalWeight: 0,
      color: userColor,
    }
    updateTeamUsers([...users, newUser])
    
    // Log activity
    if (selectedTeamId && user) {
      logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'user_added', `Added user "${name}"`)
    }
  }

  const syncTeamMembersToUsers = () => {
    // All team members can sync (not just admins)
    // Color palette for users
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
      '#06b6d4', '#f97316', '#84cc16', '#6366f1', '#14b8a6',
    ]

    const newUsers = [...users]
    let addedCount = 0

    teamMembers.forEach((member, index) => {
      // Check if member is already in user list (by uid or name)
      const existingUser = users.find(u => 
        u.id === member.uid || 
        u.name === member.displayName ||
        u.name === member.email
      )

      if (!existingUser) {
        const userColor = colors[(users.length + addedCount) % colors.length]
        newUsers.push({
          id: member.uid,
          name: member.displayName,
          totalWeight: 0,
          color: userColor,
        })
        addedCount++
      }
    })

    if (addedCount > 0) {
      updateTeamUsers(newUsers)
      alert(`✅ ${addedCount} team member(s) added to user list!`)
      
      // Log activity
      if (selectedTeamId && user) {
        logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'users_synced', `Synced ${addedCount} team members to user list`)
      }
    } else {
      alert('ℹ️ All team members are already in the user list')
    }
  }

  const removeUser = (id: string) => {
    // All team members can remove users (not just admins)
    
    // Check if this user is a team member
    const isTeamMember = teamMembers.some(m => m.uid === id)
    
    if (isTeamMember) {
      const confirmMsg = '⚠️ This user is a team member!\n\nRemoving them from the user list will NOT remove them from the team.\nThey can still access the schedule.\n\nDo you want to continue?'
      if (!confirm(confirmMsg)) {
        return
      }
    }
    
    const removedUser = users.find(u => u.id === id)
    const newUsers = users.filter(user => user.id !== id)
    updateTeamUsers(newUsers)
    
    // Remove user from ALL monthly schedules
    if (selectedTeamId) {
      const updatedSchedules = { ...monthlySchedules }
      let removedFromAnyMonth = false
      
      Object.keys(updatedSchedules).forEach(monthKey => {
        Object.keys(updatedSchedules[monthKey]).forEach(date => {
          const assignment = updatedSchedules[monthKey][date]
          let modified = false
          
          // Check and remove from primary
          if (assignment.primary === id) {
            // If there's a secondary, promote them to primary
            if (assignment.secondary) {
              updatedSchedules[monthKey][date] = { primary: assignment.secondary }
              delete updatedSchedules[monthKey][date].secondary
            } else {
              // No secondary, delete the whole assignment
              delete updatedSchedules[monthKey][date]
            }
            modified = true
            removedFromAnyMonth = true
          }
          
          // Check and remove from secondary
          if (assignment.secondary === id) {
            delete updatedSchedules[monthKey][date].secondary
            modified = true
            removedFromAnyMonth = true
          }
        })
      })
      
      if (removedFromAnyMonth) {
        const teamRef = doc(db, 'teams', selectedTeamId)
        updateDoc(teamRef, {
          schedules: updatedSchedules,
        }).catch(err => console.error('Error removing user from schedules:', err))
      }
    }
    
    // Log activity
    if (selectedTeamId && user && removedUser) {
      logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'user_removed', `Removed user "${removedUser.name}"`)
    }
  }

  const clearAllUsers = () => {
    if (!isAdmin) {
      alert('⚠️ Only admins can clear all data')
      return
    }
    
    if (confirm('Are you sure you want to clear all users, ALL MONTH schedules, and notes? This will affect all team members!')) {
      updateTeamUsers([])
      // Clear all monthly schedules and notes through Firestore
      if (selectedTeamId) {
        const teamRef = doc(db, 'teams', selectedTeamId)
        updateDoc(teamRef, {
          users: [],
          schedules: {},
          monthlyNotes: {},
        }).catch(err => console.error('Error clearing data:', err))
      }
      
      // Log activity
      if (selectedTeamId && user) {
        logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'data_cleared', 'Cleared all users, schedules (all months), and notes')
      }
    }
  }

  const importUsers = (importedUsers: User[]) => {
    if (!isAdmin) {
      alert('⚠️ Only admins can import users')
      return
    }
    
    updateTeamUsers(importedUsers)
    // Clear all monthly schedules and notes through Firestore
    if (selectedTeamId) {
      const teamRef = doc(db, 'teams', selectedTeamId)
      updateDoc(teamRef, {
        users: importedUsers,
        schedules: {},
        monthlyNotes: {},
      }).catch(err => console.error('Error importing users:', err))
    }
    
    // Log activity
    if (selectedTeamId && user) {
      logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'users_imported', `Imported ${importedUsers.length} users`)
    }
  }

  const handleGenerateSchedule = () => {
    // Check if month is locked
    if (isCurrentMonthLocked) {
      alert('🔒 This month is locked! Only admins can unlock it to make changes.')
      return
    }
    
    // All team members can generate schedules
    if (users.length === 0) {
      alert('Please add users first!')
      return
    }
    const newSchedule = generateSchedule(users, currentDate, weightSettings)
    updateTeamSchedule(newSchedule)
    
    // Log activity
    if (selectedTeamId && user) {
      logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'schedule_generated', `Generated auto schedule`)
    }
  }

  const handleResetSchedule = () => {
    // Check if month is locked
    if (isCurrentMonthLocked) {
      alert('🔒 This month is locked! Only admins can unlock it to make changes.')
      return
    }
    
    // All team members can reset schedules
    if (confirm('Reset schedule and notes for the CURRENT MONTH? This will affect all team members!')) {
      updateTeamSchedule({}) // This will clear only current month's schedule
      updateTeamNotes({}) // This will clear only current month's notes
      
      // Log activity
      if (selectedTeamId && user) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
        logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'schedule_reset', `Reset schedule and notes for ${monthKey}`)
      }
    }
  }

  const handleAssignUser = (date: string, userId: string | null, isSecondary: boolean = false) => {
    // Check if month is locked
    if (isCurrentMonthLocked) {
      alert('🔒 This month is locked! Only admins can unlock it to make changes.')
      return
    }
    
    // All team members can assign users to schedule
    const newSchedule = { ...schedule }
    
    if (!newSchedule[date]) {
      newSchedule[date] = { primary: '' }
    }
    
    if (isSecondary) {
      // Assigning secondary
      if (userId === null) {
        delete newSchedule[date].secondary
      } else {
        newSchedule[date] = { ...newSchedule[date], secondary: userId }
      }
    } else {
      // Assigning primary
      if (userId === null) {
        // If removing primary and there's a secondary, remove the whole assignment
        delete newSchedule[date]
      } else {
        newSchedule[date] = { ...newSchedule[date], primary: userId }
      }
    }
    
    // Clean up empty assignments
    if (newSchedule[date] && !newSchedule[date].primary && !newSchedule[date].secondary) {
      delete newSchedule[date]
    }
    
    updateTeamSchedule(newSchedule)
    
    // Log activity (optional - can be noisy)
    // if (selectedTeamId && user) {
    //   const assignedUser = users.find(u => u.id === userId)
    //   const role = isSecondary ? 'secondary' : 'primary'
    //   logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'user_assigned', `Assigned ${assignedUser?.name || 'user'} as ${role} to ${date}`)
    // }
  }

  const handleUpdateNote = (date: string, note: string) => {
    // Check if month is locked
    if (isCurrentMonthLocked) {
      alert('🔒 This month is locked! Only admins can unlock it to make changes.')
      return
    }
    
    const newNotes = { ...notes }
    if (note.trim() === '') {
      delete newNotes[date]
    } else {
      newNotes[date] = note
    }
    updateTeamNotes(newNotes)
  }

  const handleLockMonth = async () => {
    if (!isAdmin) {
      alert('⚠️ Only admins can lock/unlock months')
      return
    }
    
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    
    if (confirm(`Lock this month (${monthKey})? Nobody will be able to edit the schedule until you unlock it.`)) {
      await lockMonth(currentDate)
      
      // Log activity
      if (selectedTeamId && user) {
        logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'month_locked', `Locked month ${monthKey}`)
      }
    }
  }

  const handleUnlockMonth = async () => {
    if (!isAdmin) {
      alert('⚠️ Only admins can lock/unlock months')
      return
    }
    
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    
    if (confirm(`Unlock this month (${monthKey})? Team members will be able to edit the schedule again.`)) {
      await unlockMonth(currentDate)
      
      // Log activity
      if (selectedTeamId && user) {
        logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'month_unlocked', `Unlocked month ${monthKey}`)
      }
    }
  }

  const handleSettingsChange = (newSettings: WeightSettingsType, isMonthSpecific: boolean) => {
    if (!isAdmin) {
      alert('⚠️ Only admins can change settings')
      return
    }
    
    // If isMonthSpecific is true, save for current month only
    // Otherwise, save as default/global settings
    const targetDate = isMonthSpecific ? currentDate : undefined
    updateTeamSettings(newSettings, targetDate)
    
    // Log activity
    if (selectedTeamId && user) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      const scope = isMonthSpecific ? ` for ${monthKey}` : ' (default for all months)'
      logActivity(selectedTeamId, user.uid, user.displayName || 'Unknown', 'settings_updated', `Updated weight settings${scope}`)
    }
  }

  const handleSignOut = async () => {
    if (confirm('Sign out?')) {
      setSelectedTeamId(null)
      localStorage.removeItem('selected-team-id')
      await signOut()
    }
  }

  const handleLeaveTeam = () => {
    setSelectedTeamId(null)
    localStorage.removeItem('selected-team-id')
    alert('✅ You have left the team successfully!')
  }

  const handleDeleteTeam = () => {
    setSelectedTeamId(null)
    localStorage.removeItem('selected-team-id')
    // Success message already shown in TeamMembers component
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background cyber-grid-bg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyber-blue animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginPage />
  }

  // Show team selection if no team selected
  if (!selectedTeamId) {
    return <TeamSelection onTeamSelected={setSelectedTeamId} />
  }

  // Show loading while fetching team data
  if (teamLoading) {
    return (
      <div className="min-h-screen bg-background cyber-grid-bg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyber-blue animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading team data...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background cyber-grid-bg">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-[0_4px_30px_rgba(58,134,255,0.2)]">
        <div className="container mx-auto px-4 py-2 max-w-[1600px]">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Logo & User Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Logo */}
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img 
                  src="/logo.svg" 
                  alt="PICUS Logo" 
                  className="h-5 md:h-7 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>
              {/* User Info */}
              <div className="flex items-center gap-2 min-w-0">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-7 h-7 rounded-full border-2 border-cyber-blue flex-shrink-0"
                  />
                )}
                <span className="text-sm text-muted-foreground truncate">
                  {user.displayName}
                </span>
              </div>
            </div>

            {/* Center: Title */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-cyber-cyan animate-pulse" />
              <h1 className="text-lg md:text-2xl font-black text-foreground glow-text whitespace-nowrap">
                <span className="bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
                  ON-CALL SCHEDULE
                </span>
              </h1>
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-cyber-cyan animate-pulse" />
            </div>

            {/* Right: Team Info & Actions */}
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
              {/* Team Name & Change Team */}
              <div className="flex items-center gap-2 min-w-0">
                {teamName && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card/50 backdrop-blur-sm border border-border rounded-lg">
                    <Users className="w-3.5 h-3.5 text-cyber-purple flex-shrink-0" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider truncate">
                      {teamName}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedTeamId(null)}
                  className="px-3 py-1.5 text-xs bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-card transition-all text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  Change Team
                </button>
              </div>
              {/* Sign Out */}
              <div className="flex items-center gap-2">
                <ThemeToggleCompact />
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-xs bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-card transition-all inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-[1600px] relative z-10">

        {/* Tab Navigation */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-xl border-2 border-border bg-card p-1 shadow-[0_0_30px_rgba(58,134,255,0.2)]">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`inline-flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white shadow-[0_0_20px_rgba(58,134,255,0.5)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`inline-flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-cyber-purple to-cyber-pink text-white shadow-[0_0_20px_rgba(131,56,236,0.5)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Users
              <span className="ml-2 px-2 py-0.5 bg-cyber-cyan/20 text-cyber-cyan rounded-full text-xs font-mono">
                {users.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full">
          {activeTab === 'calendar' ? (
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-[0_0_50px_rgba(58,134,255,0.3)] p-6 border-2 border-border">
              <Calendar
                users={users}
                schedule={schedule}
                notes={notes}
                currentDate={currentDate}
                settings={weightSettings}
                isLocked={isCurrentMonthLocked}
                isAdmin={isAdmin}
                onDateChange={setCurrentDate}
                onAssignUser={handleAssignUser}
                onUpdateNote={handleUpdateNote}
                onGenerateSchedule={handleGenerateSchedule}
                onResetSchedule={handleResetSchedule}
                onLockMonth={handleLockMonth}
                onUnlockMonth={handleUnlockMonth}
              />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto bg-card/80 backdrop-blur-sm rounded-2xl shadow-[0_0_50px_rgba(131,56,236,0.3)] p-6 border-2 border-border">
              <UserManagement
                users={users}
                onAddUser={addUser}
                onRemoveUser={removeUser}
                onClearAll={clearAllUsers}
                onImportUsers={importUsers}
                onSyncTeamMembers={syncTeamMembersToUsers}
                teamMembersCount={teamMembers.length}
              />
            </div>
          )}
        </div>
      </div>

      {/* Settings Button (Floating) */}
      <Settings 
        settings={weightSettings} 
        currentMonth={format(currentDate, 'MMMM yyyy', { locale: tr })}
        onSettingsChange={handleSettingsChange} 
      />
      
      {/* Statistics Button (Floating) */}
      <Statistics 
        users={users} 
        schedule={schedule} 
        currentDate={currentDate}
        settings={weightSettings}
      />
      
      {/* Team Members Button (Floating) */}
      {selectedTeamId && user && (
        <TeamMembers
          teamId={selectedTeamId}
          teamName={teamName}
          members={teamMembers}
          currentUserId={user.uid}
          createdBy={createdBy}
          inviteCode={inviteCode}
          onLeaveTeam={handleLeaveTeam}
          onDeleteTeam={handleDeleteTeam}
        />
      )}
      
      {/* Activity Log Button (Floating) */}
      {selectedTeamId && (
        <ActivityLogComponent teamId={selectedTeamId} />
      )}
    </main>
  )
}

