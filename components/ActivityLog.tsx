'use client'

import { useState, useEffect } from 'react'
import { ActivityLog } from '@/types'
import { getActivityLogs } from '@/hooks/useTeamData'
import { Activity, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLogProps {
  teamId: string
}

export function ActivityLogComponent({ teamId }: ActivityLogProps) {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && teamId) {
      loadLogs()
    }
  }, [open, teamId])

  const loadLogs = async () => {
    setLoading(true)
    const activityLogs = await getActivityLogs(teamId, 50)
    setLogs(activityLogs)
    setLoading(false)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'team_created':
        return '🎉'
      case 'team_deleted':
        return '🗑️'
      case 'member_joined':
        return '👋'
      case 'member_left':
        return '👋'
      case 'member_removed':
        return '🚫'
      case 'invite_code_regenerated':
        return '🔄'
      case 'month_locked':
        return '🔒'
      case 'month_unlocked':
        return '🔓'
      case 'user_added':
        return '➕'
      case 'user_removed':
        return '➖'
      case 'users_synced':
        return '🔄'
      case 'schedule_generated':
        return '🤖'
      case 'schedule_reset':
        return '🔄'
      case 'settings_updated':
        return '⚙️'
      case 'data_imported':
        return '📥'
      case 'data_cleared':
        return '🗑️'
      case 'users_imported':
        return '📋'
      case 'comment_added':
        return '💬'
      case 'comment_edited':
        return '✏️'
      case 'comment_deleted':
        return '🗑️'
      case 'env_info_added':
        return '📚'
      case 'env_info_updated':
        return '📝'
      case 'env_info_deleted':
        return '🗑️'
      case 'marked_unavailable':
        return '🚫'
      case 'removed_unavailable':
        return '✅'
      default:
        return '📝'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'team_created':
      case 'member_joined':
      case 'user_added':
      case 'users_synced':
      case 'schedule_generated':
      case 'comment_added':
      case 'env_info_added':
        return 'text-green-500'
      case 'team_deleted':
      case 'member_left':
      case 'member_removed':
      case 'user_removed':
      case 'schedule_reset':
      case 'data_cleared':
      case 'comment_deleted':
      case 'env_info_deleted':
      case 'marked_unavailable':
        return 'text-red-500'
      case 'settings_updated':
      case 'data_imported':
      case 'removed_unavailable':
      case 'users_imported':
      case 'invite_code_regenerated':
      case 'comment_edited':
      case 'env_info_updated':
        return 'text-blue-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed right-6 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300 group z-50 animate-glow-pulse"
          style={{ bottom: '15rem' }}
          title="Activity Log"
        >
          <Activity className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-500" />
            Activity Log
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-cyber-blue animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-cyber-blue/50 transition-all"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 text-2xl">
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          <span className="font-bold text-cyber-blue">{log.userName}</span>
                          {' '}
                          <span className={`${getActionColor(log.action)}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {log.details}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="w-full py-2 px-4 bg-muted hover:bg-muted/80 rounded-lg transition-all text-sm font-medium text-foreground inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

