'use client'

import { useRef, useState } from 'react'
import { User, Schedule, DayNotes } from '@/types'
import { Download, Upload, Database, Shield } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface DataManagementProps {
  users: User[]
  schedule: Schedule
  notes: DayNotes
  onImportAll: (data: { users: User[], schedule: Schedule, notes: DayNotes }) => void
}

export function DataManagement({ users, schedule, notes, onImportAll }: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  const handleExportAll = () => {
    const data = {
      users,
      schedule,
      notes,
      exportDate: new Date().toISOString(),
      version: '1.0',
      metadata: {
        totalUsers: users.length,
        totalScheduledDays: Object.keys(schedule).length,
        totalNotes: Object.keys(notes).length,
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oncall-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const handleImportAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        
        if (data.users && data.schedule) {
          const message = `
Dosya Bilgileri:
• ${data.users.length} kullanıcı
• ${Object.keys(data.schedule).length} planlanmış gün
• ${Object.keys(data.notes || {}).length} not
• Export tarihi: ${new Date(data.exportDate).toLocaleDateString('tr-TR')}

Tüm mevcut veriler silinip yerine bu veriler yüklenecek. Devam edilsin mi?
          `.trim()
          
          if (confirm(message)) {
            onImportAll({
              users: data.users,
              schedule: data.schedule,
              notes: data.notes || {}
            })
            setOpen(false)
          }
        } else {
          alert('Geçersiz dosya formatı! Lütfen tam yedek dosyası seçin.')
        }
      } catch (error) {
        alert('Dosya okunamadı! Lütfen geçerli bir JSON dosyası seçin.')
      }
    }
    reader.readAsText(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-6 left-6 p-4 bg-gradient-to-r from-cyber-purple to-cyber-pink rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(131,56,236,0.6)] transition-all duration-300 group z-50 animate-glow-pulse"
          title="Veri Yönetimi"
        >
          <Database className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Database className="w-6 h-6 text-cyber-purple" />
            <span className="glow-text">Veri Yönetimi</span>
          </DialogTitle>
          <DialogDescription>
            Tüm kullanıcıları ve schedule'ı yedekleyin veya geri yükleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <button
            onClick={handleExportAll}
            disabled={users.length === 0}
            className="w-full px-4 py-4 bg-gradient-to-r from-cyber-green/20 to-cyber-cyan/20 border-2 border-cyber-green/50 text-cyber-green rounded-lg hover:shadow-[0_0_25px_rgba(6,255,0,0.4)] transition-all font-bold inline-flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Tam Yedek Al (JSON)</span>
            <Shield className="w-4 h-4 opacity-50" />
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-4 bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 border-2 border-cyber-blue/50 text-cyber-blue rounded-lg hover:shadow-[0_0_25px_rgba(58,134,255,0.4)] transition-all font-bold inline-flex items-center justify-center gap-3 group"
          >
            <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Yedeği Geri Yükle</span>
            <Shield className="w-4 h-4 opacity-50" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportAll}
            className="hidden"
          />

          <div className="p-4 bg-muted/50 border border-border rounded-lg mt-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-lg mr-1">💡</span>
              <strong className="text-foreground">İpucu:</strong> Düzenli yedek almayı unutmayın! 
              Tam yedek kullanıcıları, schedule'ı ve notları içerir.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
