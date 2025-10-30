'use client'

import { useState, useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Save, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RichTextEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onSave: (content: string) => void
  date: string
}

export function RichTextEditor({ open, onOpenChange, value, onSave, date }: RichTextEditorProps) {
  const [content, setContent] = useState(value)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setContent(value)
      // Use a timeout to ensure the DOM is ready
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = value || ''
        }
      }, 0)
    }
  }, [open, value])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const handleSave = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      // Clean up empty tags
      const cleaned = html.replace(/<[^\/>][^>]*><\/[^>]+>/g, '').trim()
      onSave(cleaned === '<br>' || cleaned === '' ? '' : html)
    }
    onOpenChange(false)
  }

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Kalın (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'İtalik (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Altı Çizili (Ctrl+U)' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Başlık' },
    { icon: List, command: 'insertUnorderedList', title: 'Madde İşaretli Liste' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numaralı Liste' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span className="glow-text">📝 Not Düzenle</span>
            <span className="text-sm text-muted-foreground font-normal">
              {new Date(date).toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-muted/30 border border-border rounded-lg flex-wrap">
          {toolbarButtons.map((btn, index) => (
            <button
              key={index}
              onClick={() => execCommand(btn.command, btn.value)}
              className="p-2 hover:bg-primary/20 rounded transition-colors border border-transparent hover:border-primary/50"
              title={btn.title}
              type="button"
            >
              <btn.icon className="w-4 h-4 text-foreground" />
            </button>
          ))}
          
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {content.length > 0 ? `${content.length} karakter` : 'Boş'}
            </span>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="min-h-[300px] p-4 bg-card border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground prose prose-invert max-w-none"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
            suppressContentEditableWarning
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <button
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.innerHTML = ''
                setContent('')
              }
            }}
            className="px-4 py-2 bg-destructive/20 text-destructive hover:bg-destructive/30 rounded-lg transition-colors font-medium"
            type="button"
          >
            Temizle
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors font-medium inline-flex items-center justify-center gap-2"
            type="button"
          >
            <X className="w-4 h-4" />
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white rounded-lg hover:shadow-[0_0_20px_rgba(58,134,255,0.5)] transition-all font-bold inline-flex items-center justify-center gap-2"
            type="button"
          >
            <Save className="w-4 h-4" />
            Kaydet
          </button>
        </div>

        {/* Tips */}
        <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">💡 İpucu:</strong> Klavye kısayolları: 
            <kbd className="mx-1 px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+B</kbd> Kalın, 
            <kbd className="mx-1 px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+I</kbd> İtalik, 
            <kbd className="mx-1 px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+U</kbd> Altı Çizili
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

