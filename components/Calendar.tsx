'use client'

import { useState } from 'react'
import { User, Schedule, DayNotes } from '@/types'
import { format, isSameMonth, isToday } from 'date-fns'
import { tr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Wand2, Zap, RotateCcw, StickyNote, Plus, UserPlus, X } from 'lucide-react'
import { getCalendarDays, getDayWeight, WeightSettings, DEFAULT_WEIGHTS, isPublicHoliday, getHolidayName } from '@/lib/scheduler'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RichTextEditor } from '@/components/RichTextEditor'

interface CalendarProps {
  users: User[]
  schedule: Schedule
  notes: DayNotes
  currentDate: Date
  settings?: WeightSettings
  onDateChange: (date: Date) => void
  onAssignUser: (date: string, userId: string | null) => void
  onUpdateNote: (date: string, note: string) => void
  onGenerateSchedule: () => void
  onResetSchedule: () => void
}

export function Calendar({
  users,
  schedule,
  notes,
  currentDate,
  settings = DEFAULT_WEIGHTS,
  onDateChange,
  onAssignUser,
  onUpdateNote,
  onGenerateSchedule,
  onResetSchedule,
}: CalendarProps) {
  const calendarDays = getCalendarDays(currentDate)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedNote, setSelectedNote] = useState('')
  const [userSelectOpen, setUserSelectOpen] = useState(false)
  const [selectedDateForUser, setSelectedDateForUser] = useState('')

  const openNoteEditor = (dateString: string, note: string) => {
    setSelectedDate(dateString)
    setSelectedNote(note)
    setEditorOpen(true)
  }

  const openUserSelect = (dateString: string) => {
    setSelectedDateForUser(dateString)
    setUserSelectOpen(true)
  }

  const handleUserSelect = (userId: string | null) => {
    onAssignUser(selectedDateForUser, userId)
    setUserSelectOpen(false)
  }

  const handleNoteSave = (content: string) => {
    onUpdateNote(selectedDate, content)
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
        <div>
          <h2 className="text-2xl font-bold text-foreground glow-text">
            {format(currentDate, 'MMMM yyyy', { locale: tr })}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Nöbet çizelgesini görüntüleyin ve düzenleyin
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Generate Schedule Button */}
          <button
            onClick={onGenerateSchedule}
            disabled={users.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink text-white rounded-lg hover:shadow-[0_0_20px_rgba(58,134,255,0.6)] transition-all font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            title="Otomatik Yerleştir"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Wand2 className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10 hidden lg:inline">Otomatik Yerleştir</span>
            <Zap className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform hidden lg:inline" />
          </button>
          
          {/* Reset Button */}
          <button
            onClick={() => {
              if (confirm('Tüm schedule\'ı sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
                onResetSchedule()
              }
            }}
            disabled={Object.keys(schedule).length === 0}
            className="px-3 py-2 bg-gradient-to-r from-cyber-pink/20 to-destructive/20 border-2 border-cyber-pink/50 text-cyber-pink rounded-lg hover:shadow-[0_0_15px_rgba(255,0,110,0.4)] transition-all font-bold text-sm inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Schedule'ı Sıfırla"
          >
            <RotateCcw className="w-4 h-4 group-hover:rotate-[-360deg] transition-transform duration-500" />
          </button>

          <div className="w-px h-6 bg-border mx-1"></div>

          {/* Month Navigation */}
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-muted rounded-lg transition-all hover:shadow-[0_0_15px_rgba(58,134,255,0.3)]"
            title="Önceki ay"
          >
            <ChevronLeft className="w-5 h-5 text-cyber-blue" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-muted rounded-lg transition-all hover:shadow-[0_0_15px_rgba(58,134,255,0.3)]"
            title="Sonraki ay"
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
            const assignedUserId = schedule[dateString]
            const assignedUser = assignedUserId ? getUserById(assignedUserId) : null
            const dayNote = notes[dateString] || ''
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isCurrentDay = isToday(date)
            const dayWeight = getDayWeight(date, settings)
            const isWeekendDay = dayWeight > settings.weekdayWeight && !isPublicHoliday(date)
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
                      {dayNote && (
                        <StickyNote className="w-4 h-4 text-cyber-yellow" />
                      )}
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
                      {/* User Assignment Card - Click to select */}
                      <button
                        onClick={() => openUserSelect(dateString)}
                        disabled={users.length === 0}
                        className={`group w-full px-3 py-3 rounded-lg border-2 transition-all font-bold inline-flex items-center justify-center gap-2 relative overflow-hidden ${
                          assignedUser
                            ? 'text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                            : 'bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 text-muted-foreground hover:from-cyber-blue/10 hover:to-cyber-purple/10 hover:border-cyber-blue/40 hover:text-foreground hover:shadow-[0_0_15px_rgba(58,134,255,0.3)]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        type="button"
                        title="Kullanıcı seç"
                        style={assignedUser?.color ? {
                          background: `linear-gradient(135deg, ${assignedUser.color}dd, ${assignedUser.color}99)`,
                          borderColor: `${assignedUser.color}cc`
                        } : undefined}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {assignedUser ? (
                          <>
                            <span className="text-sm relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{assignedUser.name}</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                            <span className="text-xs relative z-10">Kullanıcı Seç</span>
                          </>
                        )}
                      </button>

                      {/* Note Button */}
                      <button
                        onClick={() => openNoteEditor(dateString, dayNote)}
                        className={`group w-full px-3 py-2.5 rounded-lg border-2 transition-all font-bold inline-flex items-center justify-center gap-2 relative overflow-hidden ${
                          dayNote
                            ? 'bg-gradient-to-r from-cyber-yellow/20 to-amber-500/20 border-cyber-yellow/60 text-cyber-yellow hover:border-cyber-yellow hover:shadow-[0_0_15px_rgba(255,190,11,0.4)]'
                            : 'bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 text-muted-foreground hover:from-cyber-cyan/20 hover:to-cyber-blue/20 hover:border-cyber-cyan/60 hover:text-cyber-cyan hover:shadow-[0_0_15px_rgba(6,255,240,0.3)]'
                        }`}
                        type="button"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer"></div>
                        {dayNote ? (
                          <>
                            <StickyNote className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                            <span className="text-xs relative z-10">📝</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="text-xs relative z-10">📄</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rich Text Editor Modal */}
      <RichTextEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        value={selectedNote}
        onSave={handleNoteSave}
        date={selectedDate}
      />

      {/* User Selection Dialog */}
      <Dialog open={userSelectOpen} onOpenChange={setUserSelectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <UserPlus className="w-6 h-6 text-cyber-blue" />
              <span className="glow-text">Kullanıcı Seç</span>
            </DialogTitle>
            <DialogDescription>
              {selectedDateForUser && format(new Date(selectedDateForUser), 'd MMMM yyyy', { locale: tr })} için nöbetçi kullanıcı seçin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Henüz kullanıcı eklenmemiş</p>
              </div>
            ) : (
              <>
                {schedule[selectedDateForUser] && (
                  <button
                    onClick={() => handleUserSelect(null)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-destructive/20 to-destructive/10 border-2 border-destructive/50 text-destructive rounded-lg hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all font-bold inline-flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Kullanıcıyı Kaldır</span>
                  </button>
                )}
                
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user.id)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all font-bold inline-flex items-center justify-center gap-2 ${
                      schedule[selectedDateForUser] === user.id
                        ? 'bg-gradient-to-r from-cyber-blue/30 to-cyber-purple/30 border-cyber-blue text-cyber-blue shadow-[0_0_20px_rgba(58,134,255,0.4)]'
                        : 'bg-gradient-to-r from-muted/50 to-muted/30 border-border hover:from-cyber-blue/20 hover:to-cyber-purple/20 hover:border-cyber-blue/50 hover:shadow-[0_0_15px_rgba(58,134,255,0.3)]'
                    }`}
                  >
                    <span>{user.name}</span>
                    {schedule[selectedDateForUser] === user.id && (
                      <span className="text-xs bg-cyber-cyan/30 text-cyber-cyan px-2 py-1 rounded-full">Seçili</span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground bg-card/50 p-4 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyber-cyan rounded ring-2 ring-cyber-cyan/50"></div>
          <span className="font-medium">Bugün</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-cyber-pink/30 to-cyber-purple/30 rounded border-2 border-cyber-pink/50"></div>
          <span>🎉 Resmi Tatil <span className="text-cyber-pink font-mono font-bold">({settings.holidayWeight.toFixed(1)}x)</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyber-purple/20 rounded border border-cyber-purple/50"></div>
          <span>Hafta Sonu <span className="text-cyber-purple font-mono font-bold">({settings.weekendWeight.toFixed(1)}x)</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-card rounded border border-cyber-blue/50"></div>
          <span>Hafta İçi <span className="text-cyber-blue font-mono font-bold">({settings.weekdayWeight.toFixed(1)}x)</span></span>
        </div>
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-cyber-yellow" />
          <span>Not Var</span>
        </div>
      </div>
    </div>
  )
}
