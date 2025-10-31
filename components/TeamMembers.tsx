'use client'

import { useState } from 'react'
import { TeamMember } from '@/types'
import { Users, Crown, Copy, Check, LogOut, Trash2, UserX, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { leaveTeam, deleteTeam, removeMemberFromTeam, regenerateInviteCode } from '@/hooks/useTeamData'

interface TeamMembersProps {
  teamId: string
  teamName: string
  members: TeamMember[]
  currentUserId: string
  createdBy: string
  inviteCode: string
  onLeaveTeam: () => void
  onDeleteTeam: () => void
}

export function TeamMembers({ teamId, teamName, members, currentUserId, createdBy, inviteCode, onLeaveTeam, onDeleteTeam }: TeamMembersProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentUser = members.find(m => m.uid === currentUserId)
  const currentUserRole = currentUser?.role || 'member'
  const isCreator = currentUserId === createdBy

  const handleLeaveTeam = async () => {
    const confirmMessage = isCreator 
      ? 'Are you sure you want to leave this team? As the creator, make sure there is another admin before leaving.'
      : 'Are you sure you want to leave this team?'
    
    if (!confirm(confirmMessage)) return

    setLeaving(true)
    try {
      await leaveTeam(teamId, currentUserId, currentUser?.displayName || 'Unknown')
      setOpen(false)
      onLeaveTeam()
    } catch (error: any) {
      alert(error.message || 'Failed to leave team')
    } finally {
      setLeaving(false)
    }
  }

  const handleDeleteTeam = async () => {
    // Triple confirmation for safety
    const teamNameInput = prompt(
      `⚠️ DANGER: This will permanently delete the team and ALL data!\n\n` +
      `This includes:\n` +
      `• All team members will lose access\n` +
      `• All schedules will be deleted\n` +
      `• All notes will be deleted\n` +
      `• All activity logs will be deleted\n\n` +
      `Type the team name "${teamName}" to confirm deletion:`
    )

    if (teamNameInput !== teamName) {
      if (teamNameInput !== null) {
        alert('Team name does not match. Deletion cancelled.')
      }
      return
    }

    const finalConfirm = confirm(
      `🔴 FINAL WARNING!\n\n` +
      `Are you ABSOLUTELY SURE you want to delete "${teamName}"?\n\n` +
      `This action CANNOT be undone!`
    )

    if (!finalConfirm) return

    setDeleting(true)
    try {
      await deleteTeam(teamId, currentUserId, currentUser?.displayName || 'Unknown')
      setOpen(false)
      onDeleteTeam()
      alert('✅ Team deleted successfully')
    } catch (error: any) {
      alert(error.message || 'Failed to delete team')
    } finally {
      setDeleting(false)
    }
  }

  const handleRemoveMember = async (memberUid: string) => {
    const memberToRemove = members.find(m => m.uid === memberUid)
    
    if (!memberToRemove) return

    const confirmRemove = confirm(
      `Remove ${memberToRemove.displayName || memberToRemove.email} from the team?\n\nThey will lose access to all team data.`
    )

    if (!confirmRemove) return

    setRemovingMemberId(memberUid)
    try {
      await removeMemberFromTeam(teamId, memberUid, currentUserId, currentUser?.displayName || 'Unknown')
    } catch (error: any) {
      alert(error.message || 'Failed to remove member')
    } finally {
      setRemovingMemberId(null)
    }
  }

  const handleRegenerateInviteCode = async () => {
    const confirm = window.confirm(
      '⚠️ Regenerate Invite Code?\n\n' +
      'This will invalidate the old invite code.\n' +
      'Anyone with the old code will no longer be able to join.\n\n' +
      'Do you want to continue?'
    )

    if (!confirm) return

    setRegenerating(true)
    try {
      await regenerateInviteCode(teamId, currentUserId, currentUser?.displayName || 'Unknown')
      alert('✅ Invite code regenerated successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to regenerate invite code')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-cyber-purple to-cyber-pink rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(131,56,236,0.6)] transition-all duration-300 group z-50 animate-glow-pulse"
          title="Team Members"
        >
          <Users className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-cyber-purple via-cyber-pink to-cyber-blue bg-clip-text text-transparent">
            Team Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Info */}
          <div className="bg-gradient-to-r from-cyber-purple/10 to-cyber-pink/10 rounded-xl p-4 border-2 border-cyber-purple/30">
            <h3 className="font-bold text-lg text-foreground mb-2">{teamName}</h3>
            
            {/* Invite Code */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Invite Code</label>
              <div className="flex items-center gap-2">
                <code className="text-2xl bg-card px-4 py-2 rounded border border-border font-mono text-foreground flex-1 tracking-widest text-center">
                  {inviteCode}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="p-2 bg-card hover:bg-muted rounded-lg border border-border transition-all"
                  title="Copy Invite Code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {currentUserRole === 'admin' && (
                  <button
                    onClick={handleRegenerateInviteCode}
                    disabled={regenerating}
                    className="p-2 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/50 hover:border-amber-500 transition-all disabled:opacity-50"
                    title="Regenerate Invite Code"
                  >
                    <RefreshCw className={`w-4 h-4 text-amber-500 ${regenerating ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Share this invite code with others to invite them to the team!
              </p>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyber-purple" />
              Members ({members.length})
            </h4>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.uid}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    member.uid === currentUserId
                      ? 'bg-cyber-blue/10 border-cyber-blue'
                      : 'bg-card border-border'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt={member.displayName}
                        className="w-12 h-12 rounded-full border-2 border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-white font-bold text-lg">
                        {member.displayName.charAt(0)}
                      </div>
                    )}
                    {member.role === 'admin' && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-foreground">{member.displayName}</h5>
                      {member.uid === currentUserId && (
                        <span className="text-xs bg-cyber-blue/20 text-cyber-blue px-2 py-0.5 rounded-full font-mono">
                          You
                        </span>
                      )}
                      {member.uid === createdBy && (
                        <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-mono">
                          Creator
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        member.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {member.role === 'admin' ? '👑 Admin' : '👤 Member'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button (Admin only, not for self or creator) */}
                  {currentUserRole === 'admin' && 
                   member.uid !== currentUserId && 
                   member.uid !== createdBy && (
                    <button
                      onClick={() => handleRemoveMember(member.uid)}
                      disabled={removingMemberId === member.uid}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/50 hover:border-red-500 text-red-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove member from team"
                    >
                      {removingMemberId === member.uid ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <UserX className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Role Info */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h4 className="font-bold text-sm text-foreground mb-2">Your Role: {currentUserRole === 'admin' ? '👑 Admin' : '👤 Member'}</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {currentUserRole === 'admin' ? (
                <>
                  <li>✅ Create and modify schedules</li>
                  <li>✅ Add/remove users</li>
                  <li>✅ Remove team members</li>
                  <li>✅ Manage team settings</li>
                  <li>✅ View all team members</li>
                </>
              ) : (
                <>
                  <li>👀 View schedules</li>
                  <li>👀 View team members</li>
                  <li>❌ Cannot modify schedules</li>
                  <li>❌ Cannot manage settings</li>
                  <li>❌ Cannot remove members</li>
                </>
              )}
            </ul>
          </div>

          {/* Leave Team Button */}
          <button
            onClick={handleLeaveTeam}
            disabled={leaving || deleting}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/50 hover:border-red-500 text-red-500 rounded-lg transition-all font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5" />
            <span>{leaving ? 'Leaving...' : 'Leave Team'}</span>
          </button>

          {/* Delete Team Button (Only for Creator) */}
          {isCreator && (
            <>
              <div className="border-t-2 border-red-500/30 my-2"></div>
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30 mb-3">
                <p className="text-xs text-red-500 font-bold mb-1">⚠️ DANGER ZONE</p>
                <p className="text-xs text-muted-foreground">
                  As the team creator, you can permanently delete this team. This action cannot be undone!
                </p>
              </div>
              <button
                onClick={handleDeleteTeam}
                disabled={leaving || deleting}
                className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border-2 border-red-600 hover:border-red-700 text-red-600 rounded-lg transition-all font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5" />
                <span>{deleting ? 'Deleting...' : '🗑️ Delete Team Permanently'}</span>
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

