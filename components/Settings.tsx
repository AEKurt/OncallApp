'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'

export interface WeightSettings {
  weekdayWeight: number
  weekendWeight: number
  holidayWeight: number
}

interface SettingsProps {
  settings: WeightSettings
  onSettingsChange: (settings: WeightSettings) => void
}

export function Settings({ settings, onSettingsChange }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [open, setOpen] = useState(false)

  const handleSave = () => {
    onSettingsChange(localSettings)
    setOpen(false)
  }

  const handleReset = () => {
    const defaultSettings = { weekdayWeight: 1.0, weekendWeight: 1.5, holidayWeight: 2.0 }
    setLocalSettings(defaultSettings)
    onSettingsChange(defaultSettings)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(58,134,255,0.6)] transition-all duration-300 group z-50 animate-glow-pulse"
          title="Ayarlar"
        >
          <SettingsIcon className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <SettingsIcon className="w-6 h-6 text-cyber-blue" />
            <span className="glow-text">Ağırlık Ayarları</span>
          </DialogTitle>
          <DialogDescription>
            Hafta içi ve hafta sonu günlerinin ağırlıklarını özelleştirin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Weekday Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Hafta İçi Ağırlığı
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-cyber-blue">
                  {localSettings.weekdayWeight.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">x</span>
              </div>
            </div>
            <Slider
              value={[localSettings.weekdayWeight]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, weekdayWeight: value })
              }
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Pazartesi - Cuma günleri için ağırlık çarpanı
            </p>
          </div>

          {/* Weekend Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Hafta Sonu Ağırlığı
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-cyber-purple">
                  {localSettings.weekendWeight.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">x</span>
              </div>
            </div>
            <Slider
              value={[localSettings.weekendWeight]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, weekendWeight: value })
              }
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Cumartesi - Pazar günleri için ağırlık çarpanı
            </p>
          </div>

          {/* Holiday Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Resmi Tatil Ağırlığı
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-cyber-pink">
                  {localSettings.holidayWeight.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">x</span>
              </div>
            </div>
            <Slider
              value={[localSettings.holidayWeight]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, holidayWeight: value })
              }
              min={0.5}
              max={5}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Resmi tatil günleri için ağırlık çarpanı (23 Nisan, 29 Ekim, vb.)
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">💡 İpucu:</strong> Resmi tatil 
              günlerini en yüksek ağırlıkla ayarlayarak, bu günlerin daha değerli
              sayılmasını sağlayabilirsiniz.
            </p>
          </div>

          {/* Comparison */}
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
            <div className="text-center flex-1">
              <div className="text-xs text-muted-foreground mb-1">Hafta İçi</div>
              <div className="text-lg font-bold text-cyber-blue">
                {localSettings.weekdayWeight.toFixed(1)}x
              </div>
            </div>
            <div className="text-muted-foreground">vs</div>
            <div className="text-center flex-1">
              <div className="text-xs text-muted-foreground mb-1">Hafta Sonu</div>
              <div className="text-lg font-bold text-cyber-purple">
                {localSettings.weekendWeight.toFixed(1)}x
              </div>
            </div>
            <div className="text-muted-foreground">vs</div>
            <div className="text-center flex-1">
              <div className="text-xs text-muted-foreground mb-1">Resmi Tatil</div>
              <div className="text-lg font-bold text-cyber-pink">
                {localSettings.holidayWeight.toFixed(1)}x
              </div>
            </div>
          </div>
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

