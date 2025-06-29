'use client'

import { useState } from 'react'
import { EntryCard } from './EntryCard'
import { SoulStateAnalytics } from './SoulStateAnalytics'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Download, Heart } from 'lucide-react'
import { format } from 'date-fns'
import { generateMultipleEntriesPDF } from '@/lib/pdfGenerator'
import { toast } from 'sonner'
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
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [showSoulState, setShowSoulState] = useState(false)

  // Parse the monthYear string (format: "2024-01")
  const [year, month] = monthYear.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  const formattedMonthYear = format(date, 'MMMM yyyy')
  
  const handleGenerateMonthPDF = async () => {
    setGeneratingPDF(true)
    try {
      await generateMultipleEntriesPDF(entries, `SoulScript Journal Entries - ${formattedMonthYear}`)
      toast.success('PDF generated successfully!')
    } catch (error) {
      toast.error('Failed to generate PDF')
      console.error('PDF generation error:', error)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleShowSoulState = () => {
    console.log('💖 [EntryGroup] Opening Soul State Analytics for:', formattedMonthYear)
    setShowSoulState(true)
  }

  return (
    <div className="space-y-4">
      {/* Month/Year Header */}
      <div className="flex items-center justify-between pb-2 border-b border-sage-200/50">
        <div className="flex items-center gap-3">
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
        
        <div className="flex items-center gap-2">
          {/* Soul State Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowSoulState}
            className="border-blushrose-200 text-blushrose-700 hover:bg-blushrose-50"
          >
            <Heart className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Soul State</span>
            <span className="sm:hidden">Soul</span>
          </Button>
          
          {/* Month PDF Button */}
          {entries.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateMonthPDF}
              disabled={generatingPDF}
              className="border-mistblue-200 text-mistblue-700 hover:bg-mistblue-50"
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{generatingPDF ? 'Generating...' : 'Month PDF'}</span>
              <span className="sm:hidden">{generatingPDF ? '...' : 'PDF'}</span>
            </Button>
          )}
        </div>
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

      {/* Soul State Analytics Modal */}
      <SoulStateAnalytics
        entries={entries}
        monthYear={monthYear}
        open={showSoulState}
        onClose={() => setShowSoulState(false)}
      />
    </div>
  )
}