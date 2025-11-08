'use client'

import { useState } from 'react'
import { User, ExtendedSchedule, MonthSettings } from '@/types'
import { calculateUserWeights } from '@/lib/scheduler'
import { BarChart3, TrendingUp, Users as UsersIcon, Award } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface StatisticsProps {
  users: User[]
  schedule: ExtendedSchedule
  currentDate: Date
  settings?: MonthSettings
}

export function Statistics({ users, schedule, currentDate, settings = { weekdayWeight: 1.0, weekendWeight: 1.5, holidayWeight: 2.0 } }: StatisticsProps) {
  const [open, setOpen] = useState(false)
  const userWeights = calculateUserWeights(users, schedule, currentDate, settings)

  const totalWeight = Object.values(userWeights).reduce((sum, w) => sum + w.total, 0)
  const avgWeight = users.length > 0 ? totalWeight / users.length : 0
  const maxWeight = Math.max(...Object.values(userWeights).map(w => w.total), 0)

  const sortedUsers = [...users].sort(
    (a, b) => (userWeights[b.id]?.total || 0) - (userWeights[a.id]?.total || 0)
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed right-6 p-4 bg-gradient-to-r from-cyber-cyan to-cyber-blue rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(6,255,240,0.6)] transition-all duration-300 group z-50 animate-glow-pulse"
          style={{ bottom: '10.5rem' }}
          title="İstatistikler ve Yük Dağılımı"
        >
          <BarChart3 className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="w-6 h-6 text-cyber-cyan" />
            <span className="glow-text">İstatistikler ve Yük Dağılımı</span>
          </DialogTitle>
          <DialogDescription>
            Kullanıcı istatistikleri ve nöbet yükü dağılımını görüntüleyin
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Left: Statistics Cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card rounded-xl shadow-[0_0_30px_rgba(58,134,255,0.2)] p-6 border-2 border-border">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyber-blue" />
                <span className="glow-text">İstatistikler</span>
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-cyber-blue/10 to-cyber-blue/5 rounded-lg border border-cyber-blue/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-cyber-blue font-bold uppercase tracking-wider">
                      Toplam Kullanıcı
                    </div>
                    <UsersIcon className="w-4 h-4 text-cyber-blue/50" />
                  </div>
                  <div className="text-3xl font-bold text-cyber-blue">{users.length}</div>
                </div>

                <div className="p-4 bg-gradient-to-r from-cyber-purple/10 to-cyber-purple/5 rounded-lg border border-cyber-purple/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-cyber-purple font-bold uppercase tracking-wider">
                      Ortalama Yük
                    </div>
                    <TrendingUp className="w-4 h-4 text-cyber-purple/50" />
                  </div>
                  <div className="text-3xl font-bold text-cyber-purple">
                    {avgWeight.toFixed(1)}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-cyber-cyan/10 to-cyber-cyan/5 rounded-lg border border-cyber-cyan/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-cyber-cyan font-bold uppercase tracking-wider">
                      Toplam Ağırlık
                    </div>
                    <Award className="w-4 h-4 text-cyber-cyan/50" />
                  </div>
                  <div className="text-3xl font-bold text-cyber-cyan">
                    {totalWeight.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: User Load Distribution */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-[0_0_30px_rgba(131,56,236,0.2)] p-6 border-2 border-border h-full">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyber-purple" />
                <span className="glow-text">Yük Dağılımı</span>
              </h3>

              {users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <UsersIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Kullanıcı eklendiğinde gösterilecek</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedUsers.map((user, index) => {
                    const weight = userWeights[user.id] || { primary: 0, secondary: 0, total: 0 }
                    const percentage =
                      maxWeight > 0 ? (weight.total / maxWeight) * 100 : 0

                    return (
                      <div key={user.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {index === 0 && weight.total > 0 && (
                              <Award className="w-4 h-4 text-cyber-yellow" />
                            )}
                            <div 
                              className="w-3 h-3 rounded-full border border-white/30"
                              style={{ backgroundColor: user.color || '#3b82f6' }}
                            ></div>
                            <span className="font-bold text-foreground">
                              {user.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-muted-foreground">
                              <span className="text-cyber-blue font-semibold">Ana: {weight.primary.toFixed(1)}</span>
                              {weight.secondary > 0 && (
                                <span className="ml-2 text-amber-500 font-semibold">
                                  Yedek: {weight.secondary.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <span className="text-lg font-mono font-bold text-cyber-cyan">
                              {weight.total.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden border border-border">
                          <div
                            className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                            style={{ 
                              width: `${percentage}%`,
                              background: `linear-gradient(90deg, ${user.color || '#3b82f6'}dd, ${user.color || '#3b82f6'})`
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                        {weight > 0 && (
                          <div className="text-xs text-muted-foreground pl-1">
                            {avgWeight > 0 && (
                              <span>
                                {weight > avgWeight + 0.5 ? (
                                  <span className="text-cyber-pink font-medium">
                                    ▲ Ortalamanın %{((weight / avgWeight - 1) * 100).toFixed(0)} üstünde
                                  </span>
                                ) : weight < avgWeight - 0.5 ? (
                                  <span className="text-cyber-green font-medium">
                                    ▼ Ortalamanın %{((1 - weight / avgWeight) * 100).toFixed(0)} altında
                                  </span>
                                ) : (
                                  <span className="text-cyber-cyan font-medium">✓ Ortalama seviyede</span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Fair Distribution Info */}
              {users.length > 0 && (
                <div className="bg-gradient-to-br from-cyber-blue/10 via-cyber-purple/10 to-cyber-pink/10 rounded-xl p-6 border-2 border-cyber-blue/30 mt-6">
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <span>Adil Dağılım</span>
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Algoritma, her kullanıcının eşit ağırlıkta yük almasını sağlar.
                    Hafta içi günleri <strong className="text-cyber-blue">{settings.weekdayWeight.toFixed(1)}x</strong>,
                    hafta sonu günleri <strong className="text-cyber-purple">{settings.weekendWeight.toFixed(1)}x</strong>,
                    resmi tatil günleri <strong className="text-cyber-pink">{settings.holidayWeight.toFixed(1)}x</strong> ağırlığa sahiptir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
