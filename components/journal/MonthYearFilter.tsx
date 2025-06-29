'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar, X } from 'lucide-react'
import { format } from 'date-fns'

interface MonthYearFilterProps {
  selectedMonth: string | null
  selectedYear: string | null
  availableMonths: string[]
  availableYears: string[]
  onMonthChange: (month: string | null) => void
  onYearChange: (year: string | null) => void
  onClear: () => void
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function MonthYearFilter({
  selectedMonth,
  selectedYear,
  availableMonths,
  availableYears,
  onMonthChange,
  onYearChange,
  onClear
}: MonthYearFilterProps) {
  const hasActiveFilters = selectedMonth || selectedYear

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-mutedgray-500" />
        <span className="text-sm font-medium text-charcoal-700">Filter by:</span>
      </div>
      
      <Select value={selectedYear || 'all'} onValueChange={(value) => onYearChange(value === 'all' ? null : value)}>
        <SelectTrigger className="w-32 h-10 bg-white/80 backdrop-blur-sm border-sage-200 focus:border-sage-400">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All years</SelectItem>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedMonth || 'all'} onValueChange={(value) => onMonthChange(value === 'all' ? null : value)}>
        <SelectTrigger className="w-36 h-10 bg-white/80 backdrop-blur-sm border-sage-200 focus:border-sage-400">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All months</SelectItem>
          {availableMonths.map((month) => {
            const monthIndex = parseInt(month) - 1
            return (
              <SelectItem key={month} value={month}>
                {monthNames[monthIndex]}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-10 px-3 text-mutedgray-600 hover:text-charcoal-700 hover:bg-sage-50"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}