'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { EntryForm } from '@/components/journal/EntryForm'
import { EntryGroup } from '@/components/journal/EntryGroup'
import { EntryView } from '@/components/journal/EntryView'
import { WritingPrompt } from '@/components/journal/WritingPrompt'
import { MonthYearFilter } from '@/components/journal/MonthYearFilter'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Search, Filter, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { Database } from '@/types/database'
import { processMonitor } from '@/lib/processMonitor'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

interface GroupedEntries {
  [monthYear: string]: JournalEntry[]
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [moodFilter, setMoodFilter] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [promptText, setPromptText] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    // Initialize process monitoring when dashboard loads
    processMonitor.startMemoryMonitoring(30000) // Monitor every 30 seconds
    processMonitor.setMemoryThreshold(400) // 400MB threshold
    
    if (user) {
      fetchEntries()
    }
  }, [user])

  const fetchEntries = async () => {
    if (!user) return

    try {
      console.log('📊 [Dashboard] Fetching entries for user:', user.id)
      processMonitor.logMemoryUsage('Before Fetch Entries')

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setEntries(data || [])
      console.log('✅ [Dashboard] Fetched', data?.length || 0, 'entries')
      processMonitor.logMemoryUsage('After Fetch Entries')
    } catch (error) {
      console.error('🚨 [Dashboard] Error fetching entries:', error)
      toast.error('Error loading entries')
    } finally {
      setLoading(false)
    }
  }

  // Group and filter entries
  const { groupedEntries, availableMonths, availableYears, filteredEntryCount } = useMemo(() => {
    let filtered = entries

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply mood filter
    if (moodFilter !== 'all') {
      filtered = filtered.filter(entry => entry.mood === moodFilter)
    }

    // Apply month/year filters
    if (selectedYear || selectedMonth) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.created_at)
        const entryYear = entryDate.getFullYear().toString()
        const entryMonth = (entryDate.getMonth() + 1).toString().padStart(2, '0')
        
        if (selectedYear && entryYear !== selectedYear) return false
        if (selectedMonth && entryMonth !== selectedMonth) return false
        
        return true
      })
    }

    // Group entries by month/year
    const grouped: GroupedEntries = {}
    const months = new Set<string>()
    const years = new Set<string>()

    // Get all available months and years from all entries (not just filtered)
    entries.forEach(entry => {
      const date = new Date(entry.created_at)
      const year = date.getFullYear().toString()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      
      years.add(year)
      months.add(month)
    })

    // Group filtered entries
    filtered.forEach(entry => {
      const date = new Date(entry.created_at)
      const monthYear = format(date, 'yyyy-MM')
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = []
      }
      grouped[monthYear].push(entry)
    })

    // Sort groups by date (latest first)
    const sortedGroupKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
    const sortedGrouped: GroupedEntries = {}
    sortedGroupKeys.forEach(key => {
      sortedGrouped[key] = grouped[key]
    })

    return {
      groupedEntries: sortedGrouped,
      availableMonths: Array.from(months).sort(),
      availableYears: Array.from(years).sort((a, b) => b.localeCompare(a)),
      filteredEntryCount: filtered.length
    }
  }, [entries, searchTerm, moodFilter, selectedMonth, selectedYear])

  const handleCreateEntry = () => {
    console.log('📝 [Dashboard] Creating new entry')
    processMonitor.logMemoryUsage('Create Entry')
    setEditingEntry(null)
    setShowForm(true)
  }

  const handleEditEntry = (entry: JournalEntry) => {
    console.log('✏️ [Dashboard] Editing entry:', entry.id)
    processMonitor.logMemoryUsage('Edit Entry')
    setEditingEntry(entry)
    setShowForm(true)
    setViewingEntry(null)
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      console.log('🗑️ [Dashboard] Deleting entry:', id)
      processMonitor.logMemoryUsage('Before Delete Entry')

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEntries(entries.filter(entry => entry.id !== id))
      toast.success('Entry deleted successfully')
      
      console.log('✅ [Dashboard] Entry deleted successfully')
      processMonitor.logMemoryUsage('After Delete Entry')
    } catch (error) {
      console.error('🚨 [Dashboard] Error deleting entry:', error)
      toast.error('Error deleting entry')
    }
  }

  const handleFormSuccess = () => {
    console.log('✅ [Dashboard] Form submitted successfully')
    processMonitor.logMemoryUsage('Form Success')
    setShowForm(false)
    setEditingEntry(null)
    setPromptText('')
    fetchEntries()
  }

  const handleUsePrompt = (prompt: string) => {
    console.log('💡 [Dashboard] Using writing prompt')
    processMonitor.logMemoryUsage('Use Prompt')
    setPromptText(prompt)
    setShowForm(true)
    setEditingEntry(null)
  }

  const handleClearDateFilters = () => {
    setSelectedMonth(null)
    setSelectedYear(null)
  }

  const uniqueMoods = Array.from(new Set(entries.map(entry => entry.mood).filter(Boolean)))

  if (showForm) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-sand-100">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <EntryForm
                entry={editingEntry}
                initialPrompt={promptText}
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
      <div className="min-h-screen bg-sand-100">
        <Header onNewEntry={handleCreateEntry} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Writing Prompt Section */}
            <WritingPrompt onUsePrompt={handleUsePrompt} />

            {/* Search and Filter Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mutedgray-400 h-4 w-4" />
                  <Input
                    placeholder="Search your entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 bg-white/80 backdrop-blur-sm border-sage-200 focus:border-sage-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-mutedgray-500" />
                  <Select value={moodFilter} onValueChange={setMoodFilter}>
                    <SelectTrigger className="w-40 h-11 bg-white/80 backdrop-blur-sm border-sage-200 focus:border-sage-400">
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

              {/* Month/Year Filter */}
              <MonthYearFilter
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                availableMonths={availableMonths}
                availableYears={availableYears}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
                onClear={handleClearDateFilters}
              />
            </div>

            {/* Entries Content */}
            {loading ? (
              <div className="space-y-8">
                {[...Array(2)].map((_, groupIndex) => (
                  <div key={groupIndex} className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-sage-200/50">
                      <div className="h-6 bg-sage-200 rounded w-32 animate-pulse"></div>
                      <div className="h-6 bg-sage-200 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white/80 rounded-lg p-6 animate-pulse">
                          <div className="h-4 bg-sage-200 rounded w-3/4 mb-4"></div>
                          <div className="h-4 bg-sage-200 rounded w-1/2 mb-4"></div>
                          <div className="h-20 bg-sage-200 rounded mb-4"></div>
                          <div className="h-8 bg-sage-200 rounded w-1/3"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : Object.keys(groupedEntries).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-sage-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <Plus className="h-12 w-12 text-charcoal-900" />
                </div>
                <h3 className="text-2xl font-semibold text-charcoal-800 mb-4">
                  {searchTerm || moodFilter !== 'all' || selectedMonth || selectedYear
                    ? 'No entries found'
                    : 'Start your journaling journey'
                  }
                </h3>
                <p className="text-mutedgray-500 mb-8 max-w-md mx-auto">
                  {searchTerm || moodFilter !== 'all' || selectedMonth || selectedYear
                    ? 'Try adjusting your search or filters to find more entries.'
                    : 'Create your first entry to begin capturing your thoughts and memories.'
                  }
                </p>
                <Button
                  onClick={handleCreateEntry}
                  className="bg-mistblue-200 hover:bg-darkersage-300 text-charcoal-900"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Results summary */}
                {(searchTerm || moodFilter !== 'all' || selectedMonth || selectedYear) && (
                  <div className="text-center py-4 bg-white/60 rounded-lg border border-sage-200/50">
                    <p className="text-mutedgray-600">
                      Showing <span className="font-semibold text-charcoal-800">{filteredEntryCount}</span> {filteredEntryCount === 1 ? 'entry' : 'entries'}
                      {(selectedMonth || selectedYear) && (
                        <span>
                          {' '}for {selectedMonth && format(new Date(2024, parseInt(selectedMonth) - 1), 'MMMM')} {selectedYear}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Grouped Entries */}
                {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
                  <EntryGroup
                    key={monthYear}
                    monthYear={monthYear}
                    entries={monthEntries}
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