'use client'

import { useState } from 'react'
import { EnvironmentInfo as EnvInfo } from '@/types'
import { 
  Database, 
  Server, 
  Key, 
  BookOpen, 
  Phone, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Info,
  Tag,
  X
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface EnvironmentInfoProps {
  environmentInfo: { [id: string]: EnvInfo }
  currentUser: {
    uid: string
    displayName: string
  }
  onAdd: (info: Omit<EnvInfo, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, info: Partial<EnvInfo>) => void
  onDelete: (id: string) => void
}

const CATEGORIES = [
  { value: 'server' as const, label: 'Server', icon: Server, color: 'text-blue-500' },
  { value: 'database' as const, label: 'Database', icon: Database, color: 'text-green-500' },
  { value: 'api' as const, label: 'API', icon: AlertCircle, color: 'text-purple-500' },
  { value: 'credential' as const, label: 'Credential', icon: Key, color: 'text-red-500' },
  { value: 'runbook' as const, label: 'Runbook', icon: BookOpen, color: 'text-amber-500' },
  { value: 'contact' as const, label: 'Contact', icon: Phone, color: 'text-cyan-500' },
  { value: 'other' as const, label: 'Other', icon: Info, color: 'text-gray-500' },
]

const PRIORITIES = [
  { value: 'critical' as const, label: 'Critical', color: 'bg-red-500' },
  { value: 'high' as const, label: 'High', color: 'bg-orange-500' },
  { value: 'medium' as const, label: 'Medium', color: 'bg-yellow-500' },
  { value: 'low' as const, label: 'Low', color: 'bg-green-500' },
]

export function EnvironmentInfo({ environmentInfo, currentUser, onAdd, onUpdate, onDelete }: EnvironmentInfoProps) {
  const [open, setOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedInfo, setSelectedInfo] = useState<EnvInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'server' as EnvInfo['category'],
    description: '',
    content: '',
    tags: '',
    priority: 'medium' as EnvInfo['priority'],
    isSecret: false,
  })

  const infoList = Object.values(environmentInfo)
  
  // Filter and search
  const filteredInfo = infoList.filter(info => {
    const matchesSearch = info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         info.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         info.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || info.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Sort by priority
  const sortedInfo = [...filteredInfo].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const handleAdd = () => {
    onAdd({
      title: formData.title,
      category: formData.category,
      description: formData.description,
      content: formData.content,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      priority: formData.priority,
      isSecret: formData.isSecret,
      createdBy: currentUser.uid,
      createdByName: currentUser.displayName,
    })
    setFormData({
      title: '',
      category: 'server',
      description: '',
      content: '',
      tags: '',
      priority: 'medium',
      isSecret: false,
    })
    setEditDialogOpen(false)
  }

  const handleEdit = () => {
    if (!selectedInfo) return
    onUpdate(selectedInfo.id, {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      content: formData.content,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      priority: formData.priority,
      isSecret: formData.isSecret,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.uid,
      updatedByName: currentUser.displayName,
    })
    setEditDialogOpen(false)
    setSelectedInfo(null)
  }

  const openEditDialog = (info?: EnvInfo) => {
    if (info) {
      setSelectedInfo(info)
      setFormData({
        title: info.title,
        category: info.category,
        description: info.description || '',
        content: info.content,
        tags: info.tags.join(', '),
        priority: info.priority,
        isSecret: info.isSecret || false,
      })
    } else {
      setSelectedInfo(null)
      setFormData({
        title: '',
        category: 'server',
        description: '',
        content: '',
        tags: '',
        priority: 'medium',
        isSecret: false,
      })
    }
    setEditDialogOpen(true)
  }

  const viewInfo = (info: EnvInfo) => {
    setSelectedInfo(info)
    setViewDialogOpen(true)
  }

  const toggleSecret = (id: string) => {
    setRevealedSecrets(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1]
  }

  const getPriorityInfo = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[2]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed right-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all duration-300 group z-50 animate-glow-pulse"
          style={{ bottom: '21.5rem' }}
          title="Environment Info"
        >
          <Database className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-500" />
            On-Call Environment Info
          </DialogTitle>
          <DialogDescription>
            Quick access to servers, databases, credentials, runbooks, and contacts
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-border bg-card/30">
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => openEditDialog()}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Info
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All ({infoList.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = infoList.filter(i => i.category === cat.value).length
              const Icon = cat.icon
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Info List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {sortedInfo.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Database className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No environment info found</p>
              <p className="text-sm mt-1">Add information to help your on-call team</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedInfo.map(info => {
                const categoryInfo = getCategoryInfo(info.category)
                const priorityInfo = getPriorityInfo(info.priority)
                const CategoryIcon = categoryInfo.icon
                const isRevealed = revealedSecrets.has(info.id)

                return (
                  <div
                    key={info.id}
                    className="group relative bg-card border-2 border-border rounded-lg p-4 hover:border-emerald-500/50 transition-all cursor-pointer"
                    onClick={() => viewInfo(info)}
                  >
                    {/* Priority Badge */}
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${priorityInfo.color}`} />

                    {/* Category Icon */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-muted ${categoryInfo.color}`}>
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{info.title}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{info.category}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {info.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {info.description}
                      </p>
                    )}

                    {/* Tags */}
                    {info.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {info.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                        {info.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                            +{info.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Secret Indicator */}
                    {info.isSecret && (
                      <div className="flex items-center gap-1 text-xs text-amber-500 mb-2">
                        <Key className="w-3 h-3" />
                        <span>Secret</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(info)
                        }}
                        className="flex-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Delete this info?')) {
                            onDelete(info.id)
                          }
                        }}
                        className="flex-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded text-xs flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>

      {/* View Dialog */}
      {selectedInfo && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {(() => {
                  const CategoryIcon = getCategoryInfo(selectedInfo.category).icon
                  return <CategoryIcon className={`w-6 h-6 ${getCategoryInfo(selectedInfo.category).color}`} />
                })()}
                <span>{selectedInfo.title}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getPriorityInfo(selectedInfo.priority).color}`}>
                  {selectedInfo.priority}
                </span>
              </DialogTitle>
              {selectedInfo.description && (
                <DialogDescription>{selectedInfo.description}</DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-4">
              {/* Tags */}
              {selectedInfo.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {selectedInfo.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-muted text-foreground rounded text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="p-4 bg-muted/30 rounded-lg relative">
                {selectedInfo.isSecret && !revealedSecrets.has(selectedInfo.id) ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Key className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">This content is marked as secret</p>
                    <button
                      onClick={() => toggleSecret(selectedInfo.id)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Reveal Content
                    </button>
                  </div>
                ) : (
                  <>
                    {selectedInfo.isSecret && (
                      <button
                        onClick={() => toggleSecret(selectedInfo.id)}
                        className="absolute top-2 right-2 p-2 bg-amber-500/20 hover:bg-amber-500/30 rounded text-amber-500"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedInfo.content}
                      </ReactMarkdown>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedInfo.content, selectedInfo.id)}
                      className="absolute top-2 right-2 p-2 bg-muted hover:bg-muted/80 rounded"
                    >
                      {copiedId === selectedInfo.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Created by {selectedInfo.createdByName} on {new Date(selectedInfo.createdAt).toLocaleString()}</div>
                {selectedInfo.updatedBy && (
                  <div>Updated by {selectedInfo.updatedByName} on {new Date(selectedInfo.updatedAt).toLocaleString()}</div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedInfo ? 'Edit' : 'Add'} Environment Info</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Production Database URL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as EnvInfo['category'] })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as EnvInfo['priority'] })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Short description"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="production, aws, critical"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Content * (Supports Markdown)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                rows={8}
                placeholder="URL, credentials, commands, runbook steps, etc."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSecret"
                checked={formData.isSecret}
                onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                className="w-4 h-4 rounded border-border text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="isSecret" className="text-sm text-foreground cursor-pointer">
                Mark as secret (requires click to reveal)
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setEditDialogOpen(false)}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={selectedInfo ? handleEdit : handleAdd}
                disabled={!formData.title || !formData.content}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedInfo ? 'Update' : 'Add'} Info
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

