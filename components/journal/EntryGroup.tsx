'use client'

import { EntryCard } from './EntryCard'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { Database } from '@/types/database'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

interface EntryGroupProps {
  monthYear: string
  entries: JournalEntry[]
  onEdit: (entry: JournalEntry) => void
  onDelete: (id: string) => void
  onView: (entry: JournalEntry) => void
}

export function EntryGroup({ monthYear, entries, onEdit, onDelete, onView }: EntryGroupProps) {
  // Parse the monthYear string (format: "2024-01")
  const [year, month] = monthYear.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  const formattedMonthYear = format(date, 'MMMM yyyy')
  
  return (
    <div className="space-y-4">
      {/* Month/Year Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-sage-200/50">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-sage-600" />
          <h2 className="text-xl font-semibold text-charcoal-800">
            {formattedMonthYear}
          </h2>
        </div>
        <Badge variant="secondary" className="bg-sage-100 text-sage-700 border-sage-200">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </Badge>
      </div>

      {/* Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    </div>
  )
}