'use client'

import { useState } from 'react'
import { User, Schedule, DayNotes } from '@/types'
import { format, isSameMonth, isToday } from 'date-fns'
import { tr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Wand2, Zap, RotateCcw, StickyNote, Plus } from 'lucide-react'
import { getCalendarDays, getDayWeight, WeightSettings, DEFAULT_WEIGHTS, isPublicHoliday, getHolidayName } from '@/lib/scheduler'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  const openNoteEditor = (dateString: string, note: string) => {
    setSelectedDate(dateString)
    setSelectedNote(note)
    setEditorOpen(true)
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground glow-text">
            {format(currentDate, 'MMMM yyyy', { locale: tr })}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Nöbet çizelgesini görüntüleyin ve düzenleyin
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onGenerateSchedule}
          disabled={users.length === 0}
          className="flex-1 py-4 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink text-white rounded-lg hover:shadow-[0_0_30px_rgba(58,134,255,0.6)] transition-all font-bold text-lg inline-flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Wand2 className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
          <span className="relative z-10">Otomatik Schedule Oluştur</span>
          <Zap className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={() => {
            if (confirm('Tüm schedule\'ı sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
              onResetSchedule()
            }
          }}
          disabled={Object.keys(schedule).length === 0}
          className="px-6 py-4 bg-gradient-to-r from-cyber-pink/20 to-destructive/20 border-2 border-cyber-pink/50 text-cyber-pink rounded-lg hover:shadow-[0_0_20px_rgba(255,0,110,0.5)] transition-all font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Schedule'ı Sıfırla"
        >
          <RotateCcw className="w-5 h-5 group-hover:rotate-[-360deg] transition-transform duration-500" />
          <span className="hidden md:inline">Sıfırla</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="border-2 border-border rounded-xl overflow-hidden shadow-[0_0_30px_rgba(58,134,255,0.2)]">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-card border-b-2 border-border">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`py-4 text-center text-sm font-bold uppercase tracking-wider ${
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
                className={`min-h-[140px] p-3 border-r border-b border-border/50 ${
                  !isCurrentMonth ? 'bg-muted/30' : isHoliday ? 'bg-gradient-to-br from-cyber-pink/10 to-cyber-purple/10' : 'bg-card'
                } ${
                  isCurrentDay
                    ? 'ring-2 ring-cyber-cyan ring-inset shadow-[inset_0_0_20px_rgba(6,255,240,0.3)]'
                    : ''
                } transition-all hover:bg-muted/50`}
                title={holidayName || undefined}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-sm font-bold ${
                        !isCurrentMonth
                          ? 'text-muted-foreground'
                          : isHoliday
                          ? 'text-cyber-pink'
                          : isWeekendDay
                          ? 'text-cyber-purple'
                          : 'text-cyber-blue'
                      } ${isCurrentDay ? 'text-cyber-cyan text-lg' : ''}`}
                    >
                      {format(date, 'd')}
                    </span>
                    <div className="flex items-center gap-1">
                      {dayNote && (
                        <StickyNote className="w-3 h-3 text-cyber-yellow" />
                      )}
                      {isHoliday && (
                        <span className="text-xs bg-cyber-pink/30 text-cyber-pink px-2 py-0.5 rounded-full border border-cyber-pink/50 font-mono font-bold">
                          🎉 {dayWeight}x
                        </span>
                      )}
                      {isWeekendDay && (
                        <span className="text-xs bg-cyber-purple/20 text-cyber-purple px-2 py-0.5 rounded-full border border-cyber-purple/30 font-mono">
                          {dayWeight}x
                        </span>
                      )}
                    </div>
                  </div>

                  {isCurrentMonth && (
                    <div className="flex-1 flex flex-col gap-2">
                      <Select
                        value={assignedUserId || undefined}
                        onValueChange={(value) =>
                          onAssignUser(dateString, value === 'unassigned' ? null : value)
                        }
                        disabled={users.length === 0}
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue placeholder="Seçiniz..." />
                        </SelectTrigger>
                        <SelectContent>
                          {assignedUserId && (
                            <SelectItem value="unassigned" className="text-muted-foreground italic">
                              Temizle
                            </SelectItem>
                          )}
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {assignedUser && (
                        <div className="bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 text-foreground rounded-lg p-2 text-xs font-bold text-center border border-cyber-blue/30 hover:border-cyber-purple/50 transition-colors">
                          {assignedUser.name}
                        </div>
                      )}

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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-card/50 p-4 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyber-cyan rounded ring-2 ring-cyber-cyan/50"></div>
          <span>Bugün</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyber-pink/20 rounded border border-cyber-pink"></div>
          <span>Hafta sonu ({settings.weekendWeight.toFixed(1)}x ağırlık)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyber-blue/20 rounded border border-cyber-blue"></div>
          <span>Hafta içi ({settings.weekdayWeight.toFixed(1)}x ağırlık)</span>
        </div>
      </div>
    </div>
  )
}
