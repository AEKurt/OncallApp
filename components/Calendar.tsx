'use client'

import { useState } from 'react'
import { User, DayNoteComments, ExtendedSchedule, MonthSettings, UnavailabilityEntry } from '@/types'
import { format, isSameMonth, isToday } from 'date-fns'
import { tr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Wand2, Zap, RotateCcw, StickyNote, Plus, UserPlus, X, Lock, Unlock, MessageSquare, CalendarX } from 'lucide-react'
import { getCalendarDays, getDayWeight, isPublicHoliday, getHolidayName } from '@/lib/scheduler'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DayNotesThread } from './DayNotesThread'

interface CalendarProps {
  users: User[]
  schedule: ExtendedSchedule
  notes: DayNoteComments
  currentDate: Date
  settings?: MonthSettings
  isLocked?: boolean
  isAdmin?: boolean
  unavailability?: UnavailabilityEntry[]
  currentUser?: {
    uid: string
    displayName: string
    photoURL?: string
  }
  onDateChange: (date: Date) => void
  onAssignUser: (date: string, userId: string | null, isSecondary?: boolean) => void
  onAddComment: (date: string, text: string) => void
  onEditComment: (date: string, commentId: string, newText: string) => void
  onDeleteComment: (date: string, commentId: string) => void
  onGenerateSchedule: () => void
  onResetSchedule: () => void
  onLockMonth?: () => void
  onUnlockMonth?: () => void
  onMarkUnavailable?: (date: string, userId: string, reason?: string) => void
  onRemoveUnavailable?: (date: string, userId: string) => void
}

export function Calendar({
  users,
  schedule,
  notes,
  currentDate,
  settings = { weekdayWeight: 1.0, weekendWeight: 1.5, holidayWeight: 2.0 },
  isLocked = false,
  isAdmin = false,
  unavailability = [],
  currentUser,
  onDateChange,
  onAssignUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onGenerateSchedule,
  onResetSchedule,
  onLockMonth,
  onUnlockMonth,
  onMarkUnavailable,
  onRemoveUnavailable,
}: CalendarProps) {
  const calendarDays = getCalendarDays(currentDate)
  const [notesOpen, setNotesOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [userSelectOpen, setUserSelectOpen] = useState(false)
  const [selectedDateForUser, setSelectedDateForUser] = useState('')
  const [isSelectingSecondary, setIsSelectingSecondary] = useState(false)
  const [unavailableDialogOpen, setUnavailableDialogOpen] = useState(false)
  const [unavailableReason, setUnavailableReason] = useState('')

  const openNotesThread = (dateString: string) => {
    setSelectedDate(dateString)
    setNotesOpen(true)
  }

  const openUserSelect = (dateString: string, forSecondary: boolean = false) => {
    setSelectedDateForUser(dateString)
    setIsSelectingSecondary(forSecondary)
    setUserSelectOpen(true)
  }

  const handleUserSelect = (userId: string | null) => {
    onAssignUser(selectedDateForUser, userId, isSelectingSecondary)
    setUserSelectOpen(false)
    setIsSelectingSecondary(false)
  }

  const openUnavailableDialog = (dateString: string) => {
    setSelectedDate(dateString)
    setUnavailableReason('')
    setUnavailableDialogOpen(true)
  }

  const handleMarkUnavailable = () => {
    if (currentUser && onMarkUnavailable) {
      onMarkUnavailable(selectedDate, currentUser.uid, unavailableReason || undefined)
      setUnavailableDialogOpen(false)
      setUnavailableReason('')
    }
  }

  const handleRemoveUnavailable = (dateString: string) => {
    if (currentUser && onRemoveUnavailable) {
      onRemoveUnavailable(dateString, currentUser.uid)
    }
  }

  // Helper to check if current user is unavailable on a specific date
  const isUserUnavailable = (dateString: string): UnavailabilityEntry | undefined => {
    return unavailability.find(entry => entry.date === dateString && entry.userId === currentUser?.uid)
  }

  // Helper to get all unavailable users for a date
  const getUnavailableUsers = (dateString: string): UnavailabilityEntry[] => {
    return unavailability.filter(entry => entry.date === dateString)
  }

  const prevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    onDateChange(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    onDateChange(newDate)
  }

  const getUserById = (id: string) => users.find(u => u.id === id)

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground glow-text flex items-center gap-2">
              {format(currentDate, 'MMMM yyyy', { locale: tr })}
              {isLocked && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-500 text-xs font-bold">
                  <Lock className="w-3 h-3" />
                  LOCKED
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isLocked ? '🔒 This month is locked by admin' : 'View and edit on-call schedule'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Lock/Unlock Button (Admin Only) */}
          {isAdmin && (
            <>
              {isLocked ? (
                <button
                  onClick={onUnlockMonth}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-2 border-amber-500/50 text-amber-500 rounded-lg hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all font-bold text-sm inline-flex items-center justify-center gap-1.5 group"
                  title="Unlock Month"
                >
                  <Unlock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden lg:inline">Unlock</span>
                </button>
              ) : (
                <button
                  onClick={onLockMonth}
                  className="px-3 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-500/50 text-green-500 rounded-lg hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all font-bold text-sm inline-flex items-center justify-center gap-1.5 group"
                  title="Lock Month"
                >
                  <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden lg:inline">Lock</span>
                </button>
              )}
              <div className="w-px h-6 bg-border mx-1"></div>
            </>
          )}
          
          {/* Generate Schedule Button */}
          <button
            onClick={onGenerateSchedule}
            disabled={users.length === 0 || isLocked}
            className="px-4 py-2 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink text-white rounded-lg hover:shadow-[0_0_20px_rgba(58,134,255,0.6)] transition-all font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            title={isLocked ? "Month is locked" : "Auto Assign"}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Wand2 className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10 hidden lg:inline">Auto Assign</span>
            <Zap className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform hidden lg:inline" />
          </button>
          
          {/* Reset Button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset the entire schedule? This action cannot be undone!')) {
                onResetSchedule()
              }
            }}
            disabled={Object.keys(schedule).length === 0 || isLocked}
            className="px-3 py-2 bg-gradient-to-r from-cyber-pink/20 to-destructive/20 border-2 border-cyber-pink/50 text-cyber-pink rounded-lg hover:shadow-[0_0_15px_rgba(255,0,110,0.4)] transition-all font-bold text-sm inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed group"
            title={isLocked ? "Month is locked" : "Reset Schedule"}
          >
            <RotateCcw className="w-4 h-4 group-hover:rotate-[-360deg] transition-transform duration-500" />
          </button>

          <div className="w-px h-6 bg-border mx-1"></div>

          {/* Month Navigation */}
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-muted rounded-lg transition-all hover:shadow-[0_0_15px_rgba(58,134,255,0.3)]"
            title="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-cyber-blue" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-muted rounded-lg transition-all hover:shadow-[0_0_15px_rgba(58,134,255,0.3)]"
            title="Next month"
          >
            <ChevronRight className="w-5 h-5 text-cyber-blue" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border-2 border-border rounded-xl overflow-hidden shadow-[0_0_30px_rgba(58,134,255,0.2)]">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-card border-b-2 border-border">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`py-5 text-center text-base font-bold uppercase tracking-wider ${
                index >= 5 ? 'text-cyber-pink' : 'text-cyber-blue'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 bg-card/50 cyber-grid-bg">
          {calendarDays.map((date) => {
            const dateString = format(date, 'yyyy-MM-dd')
            const assignment = schedule[dateString]
            const primaryUser = assignment?.primary ? getUserById(assignment.primary) : null
            const secondaryUser = assignment?.secondary ? getUserById(assignment.secondary) : null
                const dayNote = notes[dateString] || []
                const hasComments = dayNote.length > 0
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isCurrentDay = isToday(date)
            const dayWeight = getDayWeight(date, settings)
            const isWeekendDay = dayWeight > (settings.weekdayWeight ?? 1.0) && !isPublicHoliday(date)
            const isHoliday = isPublicHoliday(date)
            const holidayName = getHolidayName(date)

            return (
              <div
                key={dateString}
                className={`min-h-[180px] p-4 border-r border-b border-border/50 ${
                  !isCurrentMonth ? 'bg-muted/30' : isHoliday ? 'bg-gradient-to-br from-cyber-pink/10 to-cyber-purple/10' : 'bg-card'
                } ${
                  isCurrentDay
                    ? 'ring-2 ring-cyber-cyan ring-inset shadow-[inset_0_0_20px_rgba(6,255,240,0.3)]'
                    : ''
                } transition-all hover:bg-muted/50`}
                title={holidayName || undefined}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-base font-bold ${
                        !isCurrentMonth
                          ? 'text-muted-foreground'
                          : isHoliday
                          ? 'text-cyber-pink'
                          : isWeekendDay
                          ? 'text-cyber-purple'
                          : 'text-cyber-blue'
                      } ${isCurrentDay ? 'text-cyber-cyan text-xl' : ''}`}
                    >
                      {format(date, 'd')}
                    </span>
                    <div className="flex items-center gap-1">
                      {hasComments && (
                        <MessageSquare className="w-4 h-4 text-cyber-yellow fill-cyber-yellow/30" />
                      )}
                      {(() => {
                        const unavailableToday = getUnavailableUsers(dateString)
                        if (unavailableToday.length > 0) {
                          return (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/40 font-mono flex items-center gap-1" title={`${unavailableToday.length} unavailable: ${unavailableToday.map(u => u.userName).join(', ')}`}>
                              <CalendarX className="w-3 h-3" />
                              {unavailableToday.length}
                            </span>
                          )
                        }
                      })()}
                      {isHoliday && (
                        <span className="text-xs bg-cyber-pink/30 text-cyber-pink px-2 py-1 rounded-full border border-cyber-pink/50 font-mono font-bold">
                          🎉 {dayWeight}x
                        </span>
                      )}
                      {isWeekendDay && (
                        <span className="text-xs bg-cyber-purple/20 text-cyber-purple px-2 py-1 rounded-full border border-cyber-purple/30 font-mono">
                          {dayWeight}x
                        </span>
                      )}
                    </div>
                  </div>

                  {isCurrentMonth && (
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Primary User Assignment */}
                      <button
                        onClick={() => openUserSelect(dateString)}
                        disabled={users.length === 0}
                        className={`group w-full px-3 py-2.5 rounded-lg border-2 transition-all font-bold inline-flex items-center justify-between gap-2 relative overflow-hidden ${
                          primaryUser
                            ? 'text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                            : 'bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 text-muted-foreground hover:from-cyber-blue/10 hover:to-cyber-purple/10 hover:border-cyber-blue/40 hover:text-foreground hover:shadow-[0_0_15px_rgba(58,134,255,0.3)]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        type="button"
                        title="Ana Nöbetçi"
                        style={primaryUser?.color ? {
                          background: `linear-gradient(135deg, ${primaryUser.color}dd, ${primaryUser.color}99)`,
                          borderColor: `${primaryUser.color}cc`
                        } : undefined}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {primaryUser ? (
                          <>
                            <div className="flex items-center gap-2 relative z-10">
                              <span className="text-xs font-bold opacity-70">Ana</span>
                              <span className="text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{primaryUser.name}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                            <span className="text-xs relative z-10">Ana Nöbetçi</span>
                          </>
                        )}
                      </button>

                      {/* Secondary User Assignment */}
                      <button
                        onClick={() => openUserSelect(dateString, true)}
                        disabled={users.length === 0 || !primaryUser}
                        className={`group w-full px-3 py-2 rounded-lg border-2 transition-all font-medium inline-flex items-center justify-between gap-2 relative overflow-hidden ${
                          secondaryUser
                            ? 'text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                            : 'bg-gradient-to-r from-muted/30 to-muted/20 border-border/30 text-muted-foreground hover:from-amber-500/10 hover:to-amber-600/10 hover:border-amber-500/40 hover:text-foreground hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                        type="button"
                        title="Yedek Nöbetçi"
                        style={secondaryUser?.color ? {
                          background: `linear-gradient(135deg, ${secondaryUser.color}aa, ${secondaryUser.color}66)`,
                          borderColor: `${secondaryUser.color}88`,
                          opacity: 0.85
                        } : undefined}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {secondaryUser ? (
                          <>
                            <div className="flex items-center gap-2 relative z-10">
                              <span className="text-xs opacity-70">Yedek</span>
                              <span className="text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{secondaryUser.name}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3 relative z-10 group-hover:scale-110 transition-transform" />
                            <span className="text-xs relative z-10">Yedek</span>
                          </>
                        )}
                      </button>

                      {/* Comments Button */}
                      <button
                        onClick={() => openNotesThread(dateString)}
                        className={`group w-full px-3 py-2.5 rounded-lg border-2 transition-all font-bold inline-flex items-center justify-center gap-2 relative overflow-hidden ${
                          hasComments
                            ? 'bg-gradient-to-r from-cyber-yellow/20 to-amber-500/20 border-cyber-yellow/60 text-cyber-yellow hover:border-cyber-yellow hover:shadow-[0_0_15px_rgba(255,190,11,0.4)]'
                            : 'bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 text-muted-foreground hover:from-cyber-cyan/20 hover:to-cyber-blue/20 hover:border-cyber-cyan/60 hover:text-cyber-cyan hover:shadow-[0_0_15px_rgba(6,255,240,0.3)]'
                        }`}
                        type="button"
                        title="View or add comments"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer"></div>
                        {hasComments ? (
                          <>
                            <MessageSquare className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform fill-cyber-yellow/30" />
                            <span className="text-xs relative z-10">{dayNote.length}</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                            <span className="text-xs relative z-10">💬</span>
                          </>
                        )}
                      </button>

                      {/* Unavailability Button */}
                      {(() => {
                        const userUnavailable = isUserUnavailable(dateString)
                        const allUnavailable = getUnavailableUsers(dateString)
                        const hasUnavailable = allUnavailable.length > 0

                        return (
                          <button
                            onClick={() => userUnavailable ? handleRemoveUnavailable(dateString) : openUnavailableDialog(dateString)}
                            disabled={isLocked}
                            className={`group w-full px-3 py-2.5 rounded-lg border-2 transition-all font-bold inline-flex items-center justify-center gap-2 relative overflow-hidden ${
                              userUnavailable
                                ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/60 text-red-400 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                                : hasUnavailable
                                ? 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30 text-red-400/70 hover:border-red-500/50'
                                : 'bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 text-muted-foreground hover:from-red-500/10 hover:to-red-600/10 hover:border-red-500/40 hover:text-red-400/70'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            type="button"
                            title={userUnavailable ? `You marked unavailable${userUnavailable.reason ? ': ' + userUnavailable.reason : ''}` : hasUnavailable ? `${allUnavailable.length} user(s) unavailable` : 'Mark yourself unavailable'}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer"></div>
                            {userUnavailable ? (
                              <>
                                <CalendarX className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform fill-red-500/30" />
                                <span className="text-xs relative z-10">✓</span>
                              </>
                            ) : hasUnavailable ? (
                              <>
                                <CalendarX className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                                <span className="text-xs relative z-10">{allUnavailable.length}</span>
                              </>
                            ) : (
                              <>
                                <CalendarX className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                                <span className="text-xs relative z-10">🚫</span>
                              </>
                            )}
                          </button>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Notes Thread Dialog */}
      {currentUser && (
        <DayNotesThread
          date={selectedDate}
          comments={notes[selectedDate] || []}
          isOpen={notesOpen}
          isLocked={isLocked}
          currentUser={currentUser}
          onClose={() => setNotesOpen(false)}
          onAddComment={(text) => onAddComment(selectedDate, text)}
          onEditComment={(commentId, newText) => onEditComment(selectedDate, commentId, newText)}
          onDeleteComment={(commentId) => onDeleteComment(selectedDate, commentId)}
        />
      )}

      {/* User Selection Dialog */}
      <Dialog open={userSelectOpen} onOpenChange={setUserSelectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <UserPlus className={`w-6 h-6 ${isSelectingSecondary ? 'text-amber-500' : 'text-cyber-blue'}`} />
              <span className="glow-text">
                {isSelectingSecondary ? 'Yedek Nöbetçi Seç' : 'Ana Nöbetçi Seç'}
              </span>
            </DialogTitle>
            <DialogDescription>
              {selectedDateForUser && format(new Date(selectedDateForUser), 'd MMMM yyyy', { locale: tr })} - 
              {isSelectingSecondary ? ' Yedek nöbetçiyi seçin' : ' Ana nöbetçiyi seçin'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No users added yet</p>
              </div>
            ) : (
              <>
                {/* Get current assignment to check primary user */}
                {(() => {
                  const currentAssignment = schedule[selectedDateForUser]
                  const currentPrimaryId = currentAssignment?.primary
                  const currentSecondaryId = currentAssignment?.secondary
                  const currentUserId = isSelectingSecondary ? currentSecondaryId : currentPrimaryId
                  
                  return (
                    <>
                      {currentUserId && (
                        <button
                          onClick={() => handleUserSelect(null)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-destructive/20 to-destructive/10 border-2 border-destructive/50 text-destructive rounded-lg hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all font-bold inline-flex items-center justify-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          <span>Remove {isSelectingSecondary ? 'Secondary' : 'Primary'}</span>
                        </button>
                      )}
                      
                      {users.map((user) => {
                        // Disable if this user is already assigned as primary and we're selecting secondary
                        const isDisabled = isSelectingSecondary && currentPrimaryId === user.id
                        const isCurrentlySelected = currentUserId === user.id
                        
                        return (
                          <button
                            key={user.id}
                            onClick={() => !isDisabled && handleUserSelect(user.id)}
                            disabled={isDisabled}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all font-bold inline-flex items-center justify-center gap-2 ${
                              isDisabled
                                ? 'bg-muted/30 border-border/30 text-muted-foreground opacity-40 cursor-not-allowed'
                                : isCurrentlySelected
                                ? 'bg-gradient-to-r from-cyber-blue/30 to-cyber-purple/30 border-cyber-blue text-cyber-blue shadow-[0_0_20px_rgba(58,134,255,0.4)]'
                                : 'bg-gradient-to-r from-muted/50 to-muted/30 border-border hover:from-cyber-blue/20 hover:to-cyber-purple/20 hover:border-cyber-blue/50 hover:shadow-[0_0_15px_rgba(58,134,255,0.3)]'
                            }`}
                          >
                            <span>{user.name}</span>
                            {isDisabled && (
                              <span className="text-xs bg-amber-500/30 text-amber-500 px-2 py-1 rounded-full">Ana Nöbetçi</span>
                            )}
                            {isCurrentlySelected && !isDisabled && (
                              <span className="text-xs bg-cyber-cyan/30 text-cyber-cyan px-2 py-1 rounded-full">Selected</span>
                            )}
                          </button>
                        )
                      })}
                    </>
                  )
                })()}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unavailability Dialog */}
      <Dialog open={unavailableDialogOpen} onOpenChange={setUnavailableDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-card via-card to-muted/30 border-2 border-cyber-purple/30 shadow-2xl shadow-cyber-purple/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
              <CalendarX className="w-6 h-6 text-red-400" />
              Mark Unavailable
            </DialogTitle>
            <DialogDescription>
              {selectedDate && format(new Date(selectedDate), 'd MMMM yyyy', { locale: tr })} - 
              Mark yourself as unavailable for on-call duty
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="unavailable-reason" className="text-sm font-medium text-foreground mb-2 block">
                Reason (Optional)
              </label>
              <textarea
                id="unavailable-reason"
                value={unavailableReason}
                onChange={(e) => setUnavailableReason(e.target.value)}
                placeholder="e.g., On vacation, PTO, Medical appointment..."
                className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:border-cyber-purple focus:ring-2 focus:ring-cyber-purple/20 transition-all resize-none"
                rows={3}
              />
            </div>

            {/* Show existing unavailability entries for this date */}
            {(() => {
              const allUnavailable = getUnavailableUsers(selectedDate)
              if (allUnavailable.length > 0) {
                return (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Currently Unavailable:</p>
                    <div className="space-y-2">
                      {allUnavailable.map((entry) => {
                        const user = users.find(u => u.id === entry.userId)
                        return (
                          <div key={entry.userId} className="flex items-start gap-2 text-sm p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <CalendarX className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{entry.userName || user?.name || 'Unknown User'}</p>
                              {entry.reason && <p className="text-muted-foreground text-xs mt-0.5">{entry.reason}</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }
              return null
            })()}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setUnavailableDialogOpen(false)}
                className="flex-1 px-4 py-2.5 bg-muted/50 hover:bg-muted border-2 border-border hover:border-border rounded-lg transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkUnavailable}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-2 border-red-500 hover:border-red-600 rounded-lg transition-all font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
              >
                Mark Unavailable
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground bg-card/50 p-4 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyber-cyan rounded ring-2 ring-cyber-cyan/50"></div>
          <span className="font-medium">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-cyber-pink/30 to-cyber-purple/30 rounded border-2 border-cyber-pink/50"></div>
          <span>🎉 Public Holiday <span className="text-cyber-pink font-mono font-bold">({(settings.holidayWeight ?? 2.0).toFixed(1)}x)</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyber-purple/20 rounded border border-cyber-purple/50"></div>
          <span>Weekend <span className="text-cyber-purple font-mono font-bold">({(settings.weekendWeight ?? 1.5).toFixed(1)}x)</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-card rounded border border-cyber-blue/50"></div>
          <span>Weekday <span className="text-cyber-blue font-mono font-bold">({(settings.weekdayWeight ?? 1.0).toFixed(1)}x)</span></span>
        </div>
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-cyber-yellow" />
          <span>Has Note</span>
        </div>
      </div>
    </div>
  )
}
