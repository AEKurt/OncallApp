'use client'

import { useState, useRef } from 'react'
import { User } from '@/types'
import { UserPlus, Trash2, User as UserIcon, Download, Upload, Trash, Sparkles } from 'lucide-react'

interface UserManagementProps {
  users: User[]
  onAddUser: (name: string) => void
  onRemoveUser: (id: string) => void
  onClearAll: () => void
  onImportUsers: (users: User[]) => void
  onSyncTeamMembers?: () => void
  teamMembersCount?: number
}

export function UserManagement({ users, onAddUser, onRemoveUser, onClearAll, onImportUsers, onSyncTeamMembers, teamMembersCount }: UserManagementProps) {
  const [newUserName, setNewUserName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newUserName.trim()) {
      onAddUser(newUserName.trim())
      setNewUserName('')
    }
  }

  const handleExport = () => {
    const data = {
      users,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oncall-users-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        
        if (data.users && Array.isArray(data.users)) {
          if (confirm(`${data.users.length} kullanıcı içe aktarılacak. Mevcut kullanıcılar silinecek. Devam edilsin mi?`)) {
            onImportUsers(data.users)
          }
        } else {
          alert('Geçersiz dosya formatı!')
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

  const handleClearAll = () => {
    if (confirm(`Tüm kullanıcıları silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      onClearAll()
    }
  }

  const colors = ['from-cyber-blue to-cyber-purple', 'from-cyber-purple to-cyber-pink', 'from-cyber-cyan to-cyber-blue', 'from-cyber-pink to-cyber-purple']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2 glow-text">Kullanıcılar</h2>
        <p className="text-muted-foreground text-sm">
          On-call nöbeti tutacak kişileri yönetin
        </p>
      </div>

      {/* Add User Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="İsim giriniz..."
          className="flex-1 px-4 py-3 border-2 border-border bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white rounded-lg hover:shadow-[0_0_20px_rgba(58,134,255,0.5)] transition-all font-bold inline-flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Ekle
        </button>
      </form>

      {/* Sync Team Members Button */}
      {onSyncTeamMembers && teamMembersCount && teamMembersCount > 0 && (
        <button
          onClick={onSyncTeamMembers}
          className="w-full px-4 py-3 bg-gradient-to-r from-cyber-purple to-cyber-pink border-2 border-cyber-purple/50 text-white rounded-lg hover:shadow-[0_0_20px_rgba(131,56,236,0.5)] transition-all font-bold inline-flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Sync Team Members ({teamMembersCount})
        </button>
      )}

      {/* Import/Export/Clear Buttons */}
      {users.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-3 bg-cyber-green/20 border-2 border-cyber-green/50 text-cyber-green rounded-lg hover:bg-cyber-green/30 hover:shadow-[0_0_15px_rgba(6,255,0,0.3)] transition-all font-medium inline-flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-3 bg-cyber-cyan/20 border-2 border-cyber-cyan/50 text-cyber-cyan rounded-lg hover:bg-cyber-cyan/30 hover:shadow-[0_0_15px_rgba(6,255,240,0.3)] transition-all font-medium inline-flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          
          <button
            onClick={handleClearAll}
            className="px-4 py-3 bg-cyber-pink/20 border-2 border-cyber-pink/50 text-cyber-pink rounded-lg hover:bg-cyber-pink/30 hover:shadow-[0_0_15px_rgba(255,0,110,0.3)] transition-all font-medium inline-flex items-center justify-center gap-2"
          >
            <Trash className="w-4 h-4" />
            Tümünü Sil
          </button>
        </div>
      )}

      {/* User List */}
      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <UserIcon className="w-20 h-20 mx-auto mb-4 opacity-20" />
            <p className="text-lg mb-1">Henüz kullanıcı eklenmedi</p>
            <p className="text-sm">Yukarıdaki formu kullanarak kullanıcı ekleyin</p>
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className="group flex items-center justify-between p-4 bg-card/50 rounded-lg hover:bg-card transition-all border-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              style={{
                borderColor: user.color || '#3b82f6'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg relative"
                  style={{
                    background: `linear-gradient(135deg, ${user.color || '#3b82f6'}, ${user.color || '#3b82f6'}dd)`
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-cyber-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{user.name}</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: user.color || '#3b82f6' }}
                    ></div>
                    <p className="text-xs text-muted-foreground">Renk: {user.color || '#3b82f6'}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`${user.name} kullanıcısını silmek istediğinize emin misiniz?`)) {
                    onRemoveUser(user.id)
                  }
                }}
                className="p-3 text-cyber-pink hover:bg-cyber-pink/20 rounded-lg transition-all border-2 border-transparent hover:border-cyber-pink/50"
                title="Kullanıcıyı sil"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {users.length > 0 && (
        <div className="mt-6 p-4 bg-cyber-blue/10 rounded-lg border-2 border-cyber-blue/30">
          <p className="text-sm text-foreground">
            <span className="text-2xl mr-2">💡</span>
            <strong className="text-cyber-blue">Toplam {users.length} kullanıcı</strong> bulunuyor. 
            Schedule oluşturduğunuzda her kullanıcı adil bir şekilde yük alacaktır.
          </p>
        </div>
      )}
    </div>
  )
}
