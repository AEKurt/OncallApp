'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/Calendar'
import { UserManagement } from '@/components/UserManagement'
import { Statistics } from '@/components/Statistics'
import { DataManagement } from '@/components/DataManagement'
import { Settings, WeightSettings as WeightSettingsType } from '@/components/Settings'
import { generateSchedule, DEFAULT_WEIGHTS } from '@/lib/scheduler'
import { User, Schedule, DayNotes } from '@/types'
import { Users, Calendar as CalendarIcon, Zap } from 'lucide-react'

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [schedule, setSchedule] = useState<Schedule>({})
  const [notes, setNotes] = useState<DayNotes>({})
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'calendar' | 'users'>('calendar')
  const [weightSettings, setWeightSettings] = useState<WeightSettingsType>(DEFAULT_WEIGHTS)

  // Load users from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('oncall-users')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
  }, [])

  // Save users to localStorage
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('oncall-users', JSON.stringify(users))
    }
  }, [users])

  // Load schedule from localStorage
  useEffect(() => {
    const savedSchedule = localStorage.getItem('oncall-schedule')
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule))
    }
  }, [])

  // Save schedule to localStorage
  useEffect(() => {
    if (Object.keys(schedule).length > 0) {
      localStorage.setItem('oncall-schedule', JSON.stringify(schedule))
    }
  }, [schedule])

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('oncall-notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  // Save notes to localStorage
  useEffect(() => {
    if (Object.keys(notes).length > 0) {
      localStorage.setItem('oncall-notes', JSON.stringify(notes))
    }
  }, [notes])

  // Load weight settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('oncall-weight-settings')
    if (savedSettings) {
      setWeightSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save weight settings to localStorage
  useEffect(() => {
    localStorage.setItem('oncall-weight-settings', JSON.stringify(weightSettings))
  }, [weightSettings])

  const addUser = (name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      totalWeight: 0,
    }
    setUsers([...users, newUser])
  }

  const removeUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id))
    // Remove user from schedule
    const newSchedule = { ...schedule }
    Object.keys(newSchedule).forEach(date => {
      if (newSchedule[date] === id) {
        delete newSchedule[date]
      }
    })
    setSchedule(newSchedule)
  }

  const clearAllUsers = () => {
    setUsers([])
    setSchedule({})
    setNotes({})
    localStorage.removeItem('oncall-users')
    localStorage.removeItem('oncall-schedule')
    localStorage.removeItem('oncall-notes')
  }

  const importUsers = (importedUsers: User[]) => {
    setUsers(importedUsers)
    setSchedule({}) // Clear schedule when importing new users
    setNotes({}) // Clear notes when importing new users
  }

  const importAll = (data: { users: User[], schedule: Schedule, notes?: DayNotes }) => {
    setUsers(data.users)
    setSchedule(data.schedule)
    setNotes(data.notes || {})
  }

  const handleGenerateSchedule = () => {
    if (users.length === 0) {
      alert('Lütfen önce kullanıcı ekleyin!')
      return
    }
    const newSchedule = generateSchedule(users, currentDate, weightSettings)
    setSchedule(newSchedule)
  }

  const handleResetSchedule = () => {
    setSchedule({})
    setNotes({})
    localStorage.removeItem('oncall-schedule')
    localStorage.removeItem('oncall-notes')
  }

  const handleAssignUser = (date: string, userId: string | null) => {
    const newSchedule = { ...schedule }
    if (userId === null) {
      delete newSchedule[date]
    } else {
      newSchedule[date] = userId
    }
    setSchedule(newSchedule)
  }

  const handleUpdateNote = (date: string, note: string) => {
    const newNotes = { ...notes }
    if (note.trim() === '') {
      delete newNotes[date]
    } else {
      newNotes[date] = note
    }
    setNotes(newNotes)
  }

  const handleSettingsChange = (settings: WeightSettingsType) => {
    setWeightSettings(settings)
  }

  return (
    <main className="min-h-screen bg-background cyber-grid-bg">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img 
                src="/logo.svg" 
                alt="PICUS Logo" 
                className="h-12 md:h-16 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 glow-text flex items-center justify-center gap-4">
              <Zap className="w-12 h-12 text-cyber-cyan animate-pulse" />
              <span className="bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
                ON-CALL SCHEDULE
              </span>
              <Zap className="w-12 h-12 text-cyber-cyan animate-pulse" />
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              Adil yük dağılımı ile nöbet çizelgesi yönetimi
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cyber-blue/10 border border-cyber-blue/30 rounded-full text-sm text-cyber-blue">
              <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
              <span>Cyber Mode Active</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl border-2 border-border bg-card p-1.5 shadow-[0_0_30px_rgba(58,134,255,0.2)]">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`inline-flex items-center px-8 py-3 rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white shadow-[0_0_20px_rgba(58,134,255,0.5)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              Takvim
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`inline-flex items-center px-8 py-3 rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-cyber-purple to-cyber-pink text-white shadow-[0_0_20px_rgba(131,56,236,0.5)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Kullanıcılar
              <span className="ml-2 px-2 py-0.5 bg-cyber-cyan/20 text-cyber-cyan rounded-full text-xs font-mono">
                {users.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'calendar' ? (
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-[0_0_50px_rgba(58,134,255,0.3)] p-6 border-2 border-border">
                <Calendar
                  users={users}
                  schedule={schedule}
                  notes={notes}
                  currentDate={currentDate}
                  settings={weightSettings}
                  onDateChange={setCurrentDate}
                  onAssignUser={handleAssignUser}
                  onUpdateNote={handleUpdateNote}
                  onGenerateSchedule={handleGenerateSchedule}
                  onResetSchedule={handleResetSchedule}
                />
              </div>
            ) : (
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-[0_0_50px_rgba(131,56,236,0.3)] p-6 border-2 border-border">
                <UserManagement
                  users={users}
                  onAddUser={addUser}
                  onRemoveUser={removeUser}
                  onClearAll={clearAllUsers}
                  onImportUsers={importUsers}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Statistics & Data Management */}
          <div className="lg:col-span-1 space-y-6">
            <Statistics 
              users={users} 
              schedule={schedule} 
              currentDate={currentDate}
              settings={weightSettings}
            />
            <DataManagement 
              users={users} 
              schedule={schedule} 
              notes={notes}
              onImportAll={importAll} 
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border text-sm text-muted-foreground">
            <span className="text-cyber-blue font-mono">{weightSettings.weekdayWeight.toFixed(1)}x</span>
            <span>Hafta İçi</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-cyber-pink font-mono">{weightSettings.weekendWeight.toFixed(1)}x</span>
            <span>Hafta Sonu</span>
          </div>
        </div>
      </div>

      {/* Settings Button (Floating) */}
      <Settings settings={weightSettings} onSettingsChange={handleSettingsChange} />
    </main>
  )
}
