'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { EntryForm } from '@/components/journal/EntryForm'
import { EntryCard } from '@/components/journal/EntryCard'
import { EntryView } from '@/components/journal/EntryView'
import { WritingPrompt } from '@/components/journal/WritingPrompt'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Search, Filter, Plus } from 'lucide-react'
import { Database } from '@/types/database'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

export default function DashboardPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [moodFilter, setMoodFilter] = useState<string>('all')
  const [promptText, setPromptText] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchEntries()
    }
  }, [user])

  useEffect(() => {
    filterEntries()
  }, [entries, searchTerm, moodFilter])

  const fetchEntries = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      toast.error('Error loading entries')
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = entries

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (moodFilter !== 'all') {
      filtered = filtered.filter(entry => entry.mood === moodFilter)
    }

    setFilteredEntries(filtered)
  }

  const handleCreateEntry = () => {
    setEditingEntry(null)
    setShowForm(true)
  }

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setShowForm(true)
    setViewingEntry(null)
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEntries(entries.filter(entry => entry.id !== id))
      toast.success('Entry deleted successfully')
    } catch (error) {
      toast.error('Error deleting entry')
      console.error('Error deleting entry:', error)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEntry(null)
    setPromptText('')
    fetchEntries()
  }

  const handleUsePrompt = (prompt: string) => {
    setPromptText(prompt)
    setShowForm(true)
    setEditingEntry(null)
  }

  const uniqueMoods = Array.from(new Set(entries.map(entry => entry.mood).filter(Boolean)))

  if (showForm) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-sand-100 dark:bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <EntryForm
                entry={editingEntry}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false)
                  setEditingEntry(null)
                  setPromptText('')
                }}
              />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-sand-100 dark:bg-background">
        <Header onNewEntry={handleCreateEntry} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Writing Prompt Section */}
            <WritingPrompt onUsePrompt={handleUsePrompt} />

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mutedgray-400 dark:text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search your entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-white/80 dark:bg-card/80 backdrop-blur-sm border-sage-200 dark:border-border focus:border-sage-400 dark:focus:border-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-mutedgray-500 dark:text-muted-foreground" />
                <Select value={moodFilter} onValueChange={setMoodFilter}>
                  <SelectTrigger className="w-40 h-11 bg-white/80 dark:bg-card/80 backdrop-blur-sm border-sage-200 dark:border-border focus:border-sage-400 dark:focus:border-ring">
                    <SelectValue placeholder="Filter by mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All moods</SelectItem>
                    {uniqueMoods.map((mood) => (
                      <SelectItem key={mood} value={mood!}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Entries Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/80 dark:bg-card/80 rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-sage-200 dark:bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-sage-200 dark:bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-sage-200 dark:bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-sage-200 dark:bg-muted rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-sage-200 dark:bg-muted rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <Plus className="h-12 w-12 text-charcoal-900 dark:text-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-charcoal-800 dark:text-foreground mb-4">
                  {searchTerm || moodFilter !== 'all'
                    ? 'No entries found'
                    : 'Start your journaling journey'
                  }
                </h3>
                <p className="text-mutedgray-500 dark:text-muted-foreground mb-8 max-w-md mx-auto">
                  {searchTerm || moodFilter !== 'all'
                    ? 'Try adjusting your search or filter to find more entries.'
                    : 'Create your first entry to begin capturing your thoughts and memories.'
                  }
                </p>
                <Button
                  onClick={handleCreateEntry}
                  className="bg-mistblue-200 hover:bg-darkersage-300 dark:bg-primary dark:hover:bg-primary/90 text-charcoal-900 dark:text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Entry
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                    onView={setViewingEntry}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <EntryView
          entry={viewingEntry}
          open={!!viewingEntry}
          onClose={() => setViewingEntry(null)}
          onEdit={handleEditEntry}
        />
      </div>
    </ProtectedRoute>
  )
}