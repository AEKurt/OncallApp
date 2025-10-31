'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createTeam, joinTeam, getUserTeams } from '@/hooks/useTeamData'
import { Users, Plus, LogOut, UserPlus, RefreshCw } from 'lucide-react'

interface TeamSelectionProps {
  onTeamSelected: (teamId: string) => void
}

export function TeamSelection({ onTeamSelected }: TeamSelectionProps) {
  const { user, signOut } = useAuth()
  const [teamName, setTeamName] = useState('')
  const [teamIdToJoin, setTeamIdToJoin] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [existingTeams, setExistingTeams] = useState<Array<{ id: string; name: string; role: string }>>([])
  const [loadingTeams, setLoadingTeams] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserTeams()
    }
  }, [user])

  const loadUserTeams = async () => {
    if (!user) return
    setLoadingTeams(true)
    const teams = await getUserTeams(user.uid)
    setExistingTeams(teams)
    setLoadingTeams(false)
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !user) return

    setCreating(true)
    try {
      const teamId = await createTeam(
        user.uid,
        teamName.trim(),
        user.email || '',
        user.displayName || 'Unknown User',
        user.photoURL || undefined
      )
      onTeamSelected(teamId)
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Failed to create team. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleJoinTeam = async () => {
    if (!teamIdToJoin.trim() || !user) return

    setJoining(true)
    try {
      const success = await joinTeam(
        teamIdToJoin.trim(),
        user.uid,
        user.email || '',
        user.displayName || 'Unknown User',
        user.photoURL || undefined
      )
      
      if (success) {
        onTeamSelected(teamIdToJoin.trim())
      } else {
        alert('Team not found. Please check the Team ID.')
      }
    } catch (error) {
      console.error('Error joining team:', error)
      alert('Failed to join team. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-background cyber-grid-bg">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Logout Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={signOut}
          className="px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-card transition-all inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-5xl">
        {/* User Info */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-20 h-20 rounded-full border-4 border-cyber-blue shadow-[0_0_20px_rgba(58,134,255,0.5)]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-white text-3xl font-bold">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-black text-foreground mb-2">
            Welcome, <span className="bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">{user?.displayName}</span>!
          </h1>
          <p className="text-muted-foreground">Select a team or create a new one</p>
        </div>

        {/* Existing Teams */}
        {loadingTeams ? (
          <div className="text-center mb-8">
            <RefreshCw className="w-8 h-8 text-cyber-blue animate-spin mx-auto" />
          </div>
        ) : existingTeams.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 text-center">Your Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {existingTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => onTeamSelected(team.id)}
                  className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border-2 border-border hover:border-cyber-blue transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-cyber-blue/20 rounded-lg group-hover:bg-cyber-blue/30 transition-all">
                        <Users className="w-6 h-6 text-cyber-blue" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-foreground text-lg">{team.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {team.role === 'admin' ? '👑 Admin' : '👤 Member'}
                        </p>
                      </div>
                    </div>
                    <div className="text-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Create or Join Team */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create Team */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-[0_0_50px_rgba(58,134,255,0.3)] p-8 border-2 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyber-blue/20 rounded-lg">
                <Plus className="w-6 h-6 text-cyber-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Create Team</h2>
                <p className="text-sm text-muted-foreground">Start a new team</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Engineering Team..."
                  className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTeam()}
                />
              </div>

              <button
                onClick={handleCreateTeam}
                disabled={!teamName.trim() || creating}
                className="w-full py-4 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink text-white rounded-lg hover:shadow-[0_0_30px_rgba(58,134,255,0.6)] transition-all font-bold text-lg inline-flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Plus className="w-6 h-6 relative z-10" />
                <span className="relative z-10">{creating ? 'Creating...' : 'Create Team'}</span>
              </button>
            </div>
          </div>

          {/* Join Team */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-[0_0_50px_rgba(131,56,236,0.3)] p-8 border-2 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyber-purple/20 rounded-lg">
                <UserPlus className="w-6 h-6 text-cyber-purple" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Join Team</h2>
                <p className="text-sm text-muted-foreground">Enter team ID</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Team ID
                </label>
                <input
                  type="text"
                  value={teamIdToJoin}
                  onChange={(e) => setTeamIdToJoin(e.target.value)}
                  placeholder="team_xxxxxxxxxxxxx"
                  className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-purple focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all font-mono text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinTeam()}
                />
              </div>

              <button
                onClick={handleJoinTeam}
                disabled={!teamIdToJoin.trim() || joining}
                className="w-full py-4 bg-gradient-to-r from-cyber-purple to-cyber-pink text-white rounded-lg hover:shadow-[0_0_30px_rgba(131,56,236,0.6)] transition-all font-bold text-lg inline-flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink to-cyber-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <UserPlus className="w-6 h-6 relative z-10" />
                <span className="relative z-10">{joining ? 'Joining...' : 'Join Team'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Features Info */}
        <div className="mt-8 bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border">
          <h3 className="font-bold text-foreground mb-3">✨ Team Features:</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• 📅 <strong>Real-time collaboration</strong> - See changes instantly</li>
            <li>• 👥 <strong>Team members management</strong> - Add/remove team members</li>
            <li>• 🔐 <strong>Role-based permissions</strong> - Admin vs Member roles</li>
            <li>• 📊 <strong>Activity tracking</strong> - See who did what</li>
            <li>• ⚖️ <strong>Fair scheduling</strong> - Automatic load distribution</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
