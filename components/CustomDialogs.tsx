'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

interface CustomAlertProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

export function CustomAlert({ isOpen, onClose, title, message, type = 'info' }: CustomAlertProps) {
  if (!isOpen) return null

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-500/10 to-emerald-500/10',
          border: 'border-green-500/50',
          text: 'text-green-500',
          icon: <CheckCircle className="w-12 h-12" />
        }
      case 'error':
        return {
          bg: 'from-red-500/10 to-pink-500/10',
          border: 'border-red-500/50',
          text: 'text-red-500',
          icon: <AlertTriangle className="w-12 h-12" />
        }
      case 'warning':
        return {
          bg: 'from-amber-500/10 to-orange-500/10',
          border: 'border-amber-500/50',
          text: 'text-amber-500',
          icon: <AlertTriangle className="w-12 h-12" />
        }
      default:
        return {
          bg: 'from-cyber-blue/10 to-cyber-purple/10',
          border: 'border-cyber-blue/50',
          text: 'text-cyber-blue',
          icon: <Info className="w-12 h-12" />
        }
    }
  }

  const colors = getColors()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 ${colors.border} max-w-md w-full mx-4 animate-in zoom-in-95 duration-200`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-all"
        >
          <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </button>

        {/* Content */}
        <div className="p-8">
          <div className={`flex justify-center mb-6 ${colors.text}`}>
            {colors.icon}
          </div>
          
          <h2 className="text-2xl font-black text-center text-foreground mb-4">
            {title}
          </h2>
          
          <p className="text-center text-muted-foreground whitespace-pre-line">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`mt-6 w-full py-3 bg-gradient-to-r ${colors.bg} border-2 ${colors.border} ${colors.text} rounded-lg hover:shadow-lg transition-all font-bold`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

interface CustomConfirmProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function CustomConfirm({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info' 
}: CustomConfirmProps) {
  if (!isOpen) return null

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'from-red-500/10 to-pink-500/10',
          border: 'border-red-500/50',
          text: 'text-red-500',
          icon: <AlertTriangle className="w-12 h-12" />,
          buttonBg: 'from-red-600 to-pink-600',
          buttonHover: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]'
        }
      case 'warning':
        return {
          bg: 'from-amber-500/10 to-orange-500/10',
          border: 'border-amber-500/50',
          text: 'text-amber-500',
          icon: <AlertTriangle className="w-12 h-12" />,
          buttonBg: 'from-amber-600 to-orange-600',
          buttonHover: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]'
        }
      default:
        return {
          bg: 'from-cyber-blue/10 to-cyber-purple/10',
          border: 'border-cyber-blue/50',
          text: 'text-cyber-blue',
          icon: <Info className="w-12 h-12" />,
          buttonBg: 'from-cyber-blue to-cyber-purple',
          buttonHover: 'hover:shadow-[0_0_30px_rgba(58,134,255,0.6)]'
        }
    }
  }

  const colors = getColors()

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 ${colors.border} max-w-md w-full mx-4 animate-in zoom-in-95 duration-200`}>
        {/* Content */}
        <div className="p-8">
          <div className={`flex justify-center mb-6 ${colors.text}`}>
            {colors.icon}
          </div>
          
          <h2 className="text-2xl font-black text-center text-foreground mb-4">
            {title}
          </h2>
          
          <p className="text-center text-muted-foreground whitespace-pre-line">
            {message}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="py-3 bg-muted/50 hover:bg-muted border-2 border-border text-foreground rounded-lg transition-all font-bold"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`py-3 bg-gradient-to-r ${colors.buttonBg} text-white rounded-lg ${colors.buttonHover} transition-all font-bold`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CustomPromptProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (value: string) => void
  title: string
  message: string
  placeholder?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function CustomPrompt({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  placeholder = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info' 
}: CustomPromptProps) {
  const [value, setValue] = useState('')

  if (!isOpen) return null

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'from-red-500/10 to-pink-500/10',
          border: 'border-red-500/50',
          text: 'text-red-500',
          icon: <AlertTriangle className="w-12 h-12" />,
          buttonBg: 'from-red-600 to-pink-600',
          buttonHover: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]'
        }
      case 'warning':
        return {
          bg: 'from-amber-500/10 to-orange-500/10',
          border: 'border-amber-500/50',
          text: 'text-amber-500',
          icon: <AlertTriangle className="w-12 h-12" />,
          buttonBg: 'from-amber-600 to-orange-600',
          buttonHover: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]'
        }
      default:
        return {
          bg: 'from-cyber-blue/10 to-cyber-purple/10',
          border: 'border-cyber-blue/50',
          text: 'text-cyber-blue',
          icon: <Info className="w-12 h-12" />,
          buttonBg: 'from-cyber-blue to-cyber-purple',
          buttonHover: 'hover:shadow-[0_0_30px_rgba(58,134,255,0.6)]'
        }
    }
  }

  const colors = getColors()

  const handleConfirm = () => {
    onConfirm(value)
    onClose()
    setValue('')
  }

  const handleClose = () => {
    onClose()
    setValue('')
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 ${colors.border} max-w-md w-full mx-4 animate-in zoom-in-95 duration-200`}>
        {/* Content */}
        <div className="p-8">
          <div className={`flex justify-center mb-6 ${colors.text}`}>
            {colors.icon}
          </div>
          
          <h2 className="text-2xl font-black text-center text-foreground mb-4">
            {title}
          </h2>
          
          <p className="text-center text-muted-foreground whitespace-pre-line mb-6">
            {message}
          </p>

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
            autoFocus
          />

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleClose}
              className="py-3 bg-muted/50 hover:bg-muted border-2 border-border text-foreground rounded-lg transition-all font-bold"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!value.trim()}
              className={`py-3 bg-gradient-to-r ${colors.buttonBg} text-white rounded-lg ${colors.buttonHover} transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for easy usage
export function useCustomDialog() {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'danger' | 'warning' | 'info'
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  })

  const [promptState, setPromptState] = useState<{
    isOpen: boolean
    title: string
    message: string
    placeholder: string
    type: 'danger' | 'warning' | 'info'
    onConfirm: (value: string) => void
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    type: 'info',
    onConfirm: () => {}
  })

  const showAlert = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setAlertState({ isOpen: true, title, message, type })
  }

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'info',
    confirmText?: string,
    cancelText?: string
  ) => {
    setConfirmState({ isOpen: true, title, message, type, onConfirm, confirmText, cancelText })
  }

  const showPrompt = (
    title: string,
    message: string,
    onConfirm: (value: string) => void,
    placeholder: string = '',
    type: 'danger' | 'warning' | 'info' = 'info',
    confirmText?: string,
    cancelText?: string
  ) => {
    setPromptState({ isOpen: true, title, message, placeholder, type, onConfirm, confirmText, cancelText })
  }

  const AlertDialog = () => (
    <CustomAlert
      isOpen={alertState.isOpen}
      onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      title={alertState.title}
      message={alertState.message}
      type={alertState.type}
    />
  )

  const ConfirmDialog = () => (
    <CustomConfirm
      isOpen={confirmState.isOpen}
      onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      onConfirm={confirmState.onConfirm}
      title={confirmState.title}
      message={confirmState.message}
      type={confirmState.type}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
    />
  )

  const PromptDialog = () => (
    <CustomPrompt
      isOpen={promptState.isOpen}
      onClose={() => setPromptState(prev => ({ ...prev, isOpen: false }))}
      onConfirm={promptState.onConfirm}
      title={promptState.title}
      message={promptState.message}
      placeholder={promptState.placeholder}
      type={promptState.type}
      confirmText={promptState.confirmText}
      cancelText={promptState.cancelText}
    />
  )

  return {
    showAlert,
    showConfirm,
    showPrompt,
    AlertDialog,
    ConfirmDialog,
    PromptDialog
  }
}



