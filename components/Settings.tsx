'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, Shuffle, Calendar, TrendingUp, Minimize2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import type { MonthSettings, StrategyConfig } from '@/types'

export interface WeightSettings {
  weekdayWeight: number
  weekendWeight: number
  holidayWeight: number
}

interface SettingsProps {
  settings: MonthSettings
  currentMonth?: string // e.g., "November 2025"
  onSettingsChange: (settings: MonthSettings, isMonthSpecific: boolean) => void
}

const STRATEGY_OPTIONS = [
  {
    value: 'balanced' as const,
    label: 'Dengeli Dağılım',
    icon: TrendingUp,
    description: 'Ağırlıklara göre adil dağılım (Varsayılan)',
    color: 'text-cyber-blue'
  },
  {
    value: 'consecutive' as const,
    label: 'Ardışık Günler',
    icon: Calendar,
    description: 'Kişiler belirli süre boyunca nöbet tutar (örn: haftalık)',
    color: 'text-cyber-purple'
  },
  {
    value: 'round-robin' as const,
    label: 'Sıralı Rotasyon',
    icon: Shuffle,
    description: 'Basit sıralı rotasyon, ağırlık dikkate alınmaz',
    color: 'text-cyber-pink'
  },
  {
    value: 'minimize-weekends' as const,
    label: 'Hafta Sonu Minimizasyonu',
    icon: Minimize2,
    description: 'Hafta sonu nöbetlerini adil dağıt',
    color: 'text-green-400'
  }
]

export function Settings({ settings, currentMonth, onSettingsChange }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<MonthSettings>(settings)
  const [saveForThisMonth, setSaveForThisMonth] = useState(false)
  const [open, setOpen] = useState(false)

  const strategy = localSettings.strategyConfig?.strategy || 'balanced'
  const consecutiveDays = localSettings.strategyConfig?.consecutiveDays || 7

  const handleSave = () => {
    onSettingsChange(localSettings, saveForThisMonth)
    setOpen(false)
  }

  const handleReset = () => {
    const defaultSettings: MonthSettings = { 
      weekdayWeight: 1.0, 
      weekendWeight: 1.5, 
      holidayWeight: 2.0,
      strategyConfig: {
        strategy: 'balanced',
        consecutiveDays: 7
      }
    }
    setLocalSettings(defaultSettings)
    onSettingsChange(defaultSettings, saveForThisMonth)
  }

  const handleStrategyChange = (newStrategy: StrategyConfig['strategy']) => {
    setLocalSettings({
      ...localSettings,
      strategyConfig: {
        ...localSettings.strategyConfig,
        strategy: newStrategy,
        consecutiveDays: newStrategy === 'consecutive' ? (consecutiveDays || 7) : undefined
      }
    })
  }

  const handleConsecutiveDaysChange = (days: number) => {
    setLocalSettings({
      ...localSettings,
      strategyConfig: {
        ...localSettings.strategyConfig,
        strategy: strategy,
        consecutiveDays: days
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-24 right-6 p-4 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(58,134,255,0.6)] transition-all duration-300 group z-50 animate-glow-pulse"
          title="Ayarlar"
        >
          <SettingsIcon className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <SettingsIcon className="w-6 h-6 text-cyber-blue" />
            <span className="glow-text">Schedule Ayarları</span>
          </DialogTitle>
          <DialogDescription>
            Nöbet atama stratejisi ve ağırlıkları özelleştirin
            {currentMonth && (
              <div className="mt-2 text-xs">
                <strong className="text-foreground">Aktif Ay:</strong> {currentMonth}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Strategy Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Otomatik Atama Stratejisi
            </label>
            <div className="grid grid-cols-1 gap-2">
              {STRATEGY_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = strategy === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStrategyChange(option.value)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-cyber-blue bg-cyber-blue/10 shadow-[0_0_15px_rgba(58,134,255,0.3)]' 
                        : 'border-border hover:border-cyber-blue/50 bg-card'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-cyber-blue' : option.color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{option.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Consecutive Days Configuration */}
          {strategy === 'consecutive' && (
            <div className="space-y-3 p-4 bg-card border-2 border-cyber-purple/30 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Ardışık Gün Sayısı
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-cyber-purple">
                    {consecutiveDays}
                  </span>
                  <span className="text-xs text-muted-foreground">gün</span>
                </div>
              </div>
              <Slider
                value={[consecutiveDays]}
                onValueChange={([value]) => handleConsecutiveDaysChange(value)}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Her kişi kaç gün üst üste nöbet tutacak? (örn: 7 = haftalık rotasyon)
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Weight Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Gün Ağırlıkları
              {strategy !== 'balanced' && (
                <span className="text-xs text-muted-foreground ml-auto">
                  (Sadece &quot;Dengeli Dağılım&quot; stratejisinde aktif)
                </span>
              )}
            </h3>

            {/* Weekday Weight */}
            <div className="space-y-3 opacity-100">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Hafta İçi Ağırlığı
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-cyber-blue">
                    {(localSettings.weekdayWeight || 1.0).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">x</span>
                </div>
              </div>
              <Slider
                value={[localSettings.weekdayWeight || 1.0]}
                onValueChange={([value]) =>
                  setLocalSettings({ ...localSettings, weekdayWeight: value })
                }
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Weekend Weight */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Hafta Sonu Ağırlığı
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-cyber-purple">
                    {(localSettings.weekendWeight || 1.5).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">x</span>
                </div>
              </div>
              <Slider
                value={[localSettings.weekendWeight || 1.5]}
                onValueChange={([value]) =>
                  setLocalSettings({ ...localSettings, weekendWeight: value })
                }
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Holiday Weight */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Resmi Tatil Ağırlığı
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-cyber-pink">
                    {(localSettings.holidayWeight || 2.0).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">x</span>
                </div>
              </div>
              <Slider
                value={[localSettings.holidayWeight || 2.0]}
                onValueChange={([value]) =>
                  setLocalSettings({ ...localSettings, holidayWeight: value })
                }
                min={0.5}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Month-Specific Setting Option */}
          {currentMonth && (
            <div className="p-4 bg-card border-2 border-cyber-blue/30 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveForThisMonth}
                  onChange={(e) => setSaveForThisMonth(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border text-cyber-blue focus:ring-cyber-blue focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    🗓️ Sadece Bu Ay İçin Kaydet ({currentMonth})
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    İşaretli: Bu ayarlama sadece <strong>{currentMonth}</strong> için geçerli olur.
                    <br />
                    İşaretsiz: Bu ayarlama tüm aylarda varsayılan olarak kullanılır.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors font-medium"
          >
            Varsayılana Dön
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white rounded-lg hover:shadow-[0_0_20px_rgba(58,134,255,0.5)] transition-all font-medium"
          >
            Kaydet
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

