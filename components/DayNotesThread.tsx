'use client'

import { useState, useRef, useEffect } from 'react'
import { NoteComment } from '@/types'
import { MessageSquare, Send, Edit2, Trash2, X, Check, Code } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DayNotesThreadProps {
  date: string // YYYY-MM-DD
  comments: NoteComment[]
  isOpen: boolean
  isLocked?: boolean
  currentUser: {
    uid: string
    displayName: string
    photoURL?: string
  }
  onClose: () => void
  onAddComment: (text: string) => void
  onEditComment: (commentId: string, newText: string) => void
  onDeleteComment: (commentId: string) => void
}

export function DayNotesThread({
  date,
  comments,
  isOpen,
  isLocked = false,
  currentUser,
  onClose,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: DayNotesThreadProps) {
  const [newCommentText, setNewCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false)
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const newCommentInputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (isOpen) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [comments.length, isOpen])

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && !isLocked) {
      setTimeout(() => newCommentInputRef.current?.focus(), 100)
    }
  }, [isOpen, isLocked])

  const handleAddComment = () => {
    if (newCommentText.trim() && !isLocked) {
      onAddComment(newCommentText.trim())
      setNewCommentText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  const startEdit = (comment: NoteComment) => {
    setEditingCommentId(comment.id)
    setEditText(comment.text)
  }

  const saveEdit = () => {
    if (editingCommentId && editText.trim()) {
      onEditComment(editingCommentId, editText.trim())
      setEditingCommentId(null)
      setEditText('')
    }
  }

  const cancelEdit = () => {
    setEditingCommentId(null)
    setEditText('')
  }

  const handleDelete = (commentId: string) => {
    if (confirm('Delete this comment? This cannot be undone.')) {
      onDeleteComment(commentId)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const parsedDate = new Date(dateString)
      if (isNaN(parsedDate.getTime())) {
        return dateString
      }
      const daysSinceComment = Math.floor((Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceComment < 7) {
        return formatDistanceToNow(parsedDate, { addSuffix: true, locale: tr })
      }
      return format(parsedDate, 'MMM d, HH:mm', { locale: tr })
    } catch {
      return dateString
    }
  }

  // Safely format the date header
  const formattedDate = (() => {
    try {
      if (!date) return 'Select a date'
      const parsedDate = new Date(date + 'T00:00:00')
      if (isNaN(parsedDate.getTime())) return date
      return format(parsedDate, 'd MMMM yyyy, EEEE', { locale: tr })
    } catch {
      return date
    }
  })()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="w-5 h-5 text-cyber-blue" />
            <span className="glow-text">{formattedDate}</span>
          </DialogTitle>
          <DialogDescription>
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            {isLocked && (
              <span className="ml-2 text-amber-500">🔒 Locked - View only</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Comments Thread */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Be the first to add a note!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isOwn = comment.userId === currentUser.uid
              const isEditing = editingCommentId === comment.id

              return (
                <div
                  key={comment.id}
                  className={`group flex gap-3 p-3 rounded-lg transition-colors ${
                    isOwn ? 'bg-cyber-blue/5 hover:bg-cyber-blue/10' : 'hover:bg-muted/50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {comment.userPhotoURL ? (
                      <img
                        src={comment.userPhotoURL}
                        alt={comment.userName}
                        className="w-10 h-10 rounded-full border-2 border-cyber-blue/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-white font-bold text-sm">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {comment.userName}
                      </span>
                      {isOwn && (
                        <span className="text-xs px-1.5 py-0.5 bg-cyber-blue/20 text-cyber-blue rounded">
                          You
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.timestamp)}
                      </span>
                      {comment.editedAt && (
                        <span className="text-xs text-muted-foreground italic">
                          (edited)
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue resize-none font-mono text-sm"
                          rows={3}
                          autoFocus
                          placeholder="Supports Markdown: **bold**, `code`, [link](url)"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-cyber-blue text-white rounded text-xs hover:bg-cyber-blue/80 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-muted text-foreground rounded text-xs hover:bg-muted/80 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Custom link styling
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                className="text-cyber-blue hover:text-cyber-purple underline break-all"
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            ),
                            // Custom code block styling
                            code: ({ node, className, children, ...props }: any) => {
                              const inline = !className || !className.includes('language-')
                              return inline ? (
                                <code
                                  className="px-1.5 py-0.5 bg-muted rounded text-cyber-pink font-mono text-xs"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <code
                                  className={`block px-3 py-2 bg-muted rounded-lg font-mono text-xs overflow-x-auto ${className || ''}`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              )
                            },
                            // Custom pre styling (code blocks)
                            pre: ({ node, ...props }) => (
                              <pre className="bg-muted rounded-lg p-3 overflow-x-auto" {...props} />
                            ),
                            // Prevent paragraph margins in inline content
                            p: ({ node, ...props }) => (
                              <p className="whitespace-pre-wrap break-words mb-2 last:mb-0" {...props} />
                            ),
                          }}
                        >
                          {comment.text}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Actions (only for own comments) */}
                    {isOwn && !isEditing && !isLocked && (
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-xs text-muted-foreground hover:text-cyber-blue flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* New Comment Input */}
        {!isLocked && (
          <div className="px-6 py-4 border-t border-border bg-card/50">
            {/* Markdown Help Toggle */}
            <button
              onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2 transition-colors"
            >
              <Code className="w-3 h-3" />
              {showMarkdownHelp ? 'Hide' : 'Show'} formatting help
            </button>

            {/* Markdown Help Panel */}
            {showMarkdownHelp && (
              <div className="mb-3 p-3 bg-muted/50 rounded-lg text-xs space-y-1 border border-border">
                <div className="font-bold text-foreground mb-2">Markdown Formatting:</div>
                <div><code className="bg-background px-1 rounded">**bold**</code> → <strong>bold</strong></div>
                <div><code className="bg-background px-1 rounded">*italic*</code> → <em>italic</em></div>
                <div><code className="bg-background px-1 rounded">`code`</code> → <code className="bg-background px-1 rounded text-cyber-pink">code</code></div>
                <div><code className="bg-background px-1 rounded">[link](url)</code> → <a className="text-cyber-blue underline">clickable link</a></div>
                <div className="pt-1 border-t border-border mt-2">
                  <div className="font-semibold mb-1">Code block:</div>
                  <code className="bg-background px-1 rounded block">```</code>
                  <code className="bg-background px-1 rounded block">your code here</code>
                  <code className="bg-background px-1 rounded block">```</code>
                </div>
              </div>
            )}

            <div className="flex gap-3 items-end">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-10 h-10 rounded-full border-2 border-cyber-blue/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-white font-bold text-sm">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex-1">
                <textarea
                  ref={newCommentInputRef}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Add a comment... (Supports Markdown: **bold**, `code`, [link](url))"
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-cyber-blue resize-none transition-colors font-mono text-sm"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, 
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-1">Shift+Enter</kbd> for new line
                </p>
              </div>

              {/* Send Button */}
              <button
                onClick={handleAddComment}
                disabled={!newCommentText.trim()}
                className={`p-3 rounded-lg transition-all ${
                  newCommentText.trim()
                    ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white hover:shadow-[0_0_20px_rgba(58,134,255,0.5)]'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

