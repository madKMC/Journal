'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Heart, TrendingUp } from 'lucide-react'
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, parseISO } from 'date-fns'
import { Database } from '@/types/database'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

interface SoulStateAnalyticsProps {
  entries: JournalEntry[]
  monthYear: string
  open: boolean
  onClose: () => void
}

const moodEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  excited: '🎉',
  peaceful: '😌',
  anxious: '😰',
  grateful: '🙏',
  reflective: '🤔',
  energetic: '⚡',
  overwhelmed: '😵',
  insecure: '😔',
  angry: '😠',
  numb: '😶',
  burnt_out: '😴',
  lonely: '😞',
  general: '😐',
}

const moodColors: Record<string, string> = {
  happy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  sad: 'bg-blue-100 text-blue-800 border-blue-200',
  excited: 'bg-purple-100 text-purple-800 border-purple-200',
  peaceful: 'bg-sage-100 text-sage-800 border-sage-200',
  anxious: 'bg-orange-100 text-orange-800 border-orange-200',
  grateful: 'bg-blushrose-100 text-blushrose-800 border-blushrose-200',
  reflective: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  energetic: 'bg-red-100 text-red-800 border-red-200',
  overwhelmed: 'bg-red-200 text-red-900 border-red-300',
  insecure: 'bg-gray-100 text-gray-800 border-gray-200',
  angry: 'bg-red-200 text-red-900 border-red-300',
  numb: 'bg-gray-200 text-gray-700 border-gray-300',
  burnt_out: 'bg-gray-200 text-gray-800 border-gray-300',
  lonely: 'bg-blue-200 text-blue-900 border-blue-300',
  general: 'bg-gray-100 text-gray-800 border-gray-200',
}

const moodLabels: Record<string, string> = {
  happy: 'Happy',
  sad: 'Sad',
  excited: 'Excited',
  peaceful: 'Peaceful',
  anxious: 'Anxious',
  grateful: 'Grateful',
  reflective: 'Reflective',
  energetic: 'Energetic',
  overwhelmed: 'Overwhelmed',
  insecure: 'Insecure',
  angry: 'Angry',
  numb: 'Numb',
  burnt_out: 'Burnt Out',
  lonely: 'Lonely',
  general: 'General',
}

interface WeeklyMoodData {
  weekStart: Date
  weekEnd: Date
  weekLabel: string
  moodCounts: Record<string, number>
  totalEntries: number
  dominantMood: string | null
}

export function SoulStateAnalytics({ entries, monthYear, open, onClose }: SoulStateAnalyticsProps) {
  // Parse the monthYear string (format: "2024-01")
  const [year, month] = monthYear.split('-')
  const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1)
  const monthEnd = new Date(parseInt(year), parseInt(month), 0)
  const formattedMonthYear = format(monthStart, 'MMMM yyyy')

  // Get all weeks in the month
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 } // Start week on Monday
  )

  // Process weekly mood data
  const weeklyData: WeeklyMoodData[] = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    // Filter entries for this week
    const weekEntries = entries.filter(entry => {
      const entryDate = parseISO(entry.created_at)
      return entryDate >= weekStart && entryDate <= weekEnd
    })

    // Count moods for this week
    const moodCounts: Record<string, number> = {}
    weekEntries.forEach(entry => {
      const mood = entry.mood || 'general' // Default to general if no mood
      moodCounts[mood] = (moodCounts[mood] || 0) + 1
    })

    // Find dominant mood
    let dominantMood: string | null = null
    let maxCount = 0
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count
        dominantMood = mood
      }
    })

    return {
      weekStart,
      weekEnd,
      weekLabel: `Week ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
      moodCounts,
      totalEntries: weekEntries.length,
      dominantMood
    }
  })

  // Calculate overall month statistics
  const totalMonthEntries = entries.length
  const overallMoodCounts: Record<string, number> = {}
  entries.forEach(entry => {
    const mood = entry.mood || 'general'
    overallMoodCounts[mood] = (overallMoodCounts[mood] || 0) + 1
  })

  const sortedMoods = Object.entries(overallMoodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // Top 5 moods

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          Soul State Analytics for {formattedMonthYear}
        </DialogTitle>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center border-b border-sage-200 pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Heart className="h-6 w-6 text-blushrose-600" />
              <h2 className="text-2xl font-bold text-charcoal-900">Soul State Analytics</h2>
            </div>
            <p className="text-lg text-charcoal-700">{formattedMonthYear}</p>
            <p className="text-sm text-mutedgray-500">
              {totalMonthEntries} {totalMonthEntries === 1 ? 'entry' : 'entries'} • Your emotional journey this month
            </p>
          </div>

          {/* Overall Month Summary */}
          <div className="bg-gradient-to-r from-sage-50 to-mistblue-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-sage-600" />
              <h3 className="text-lg font-semibold text-charcoal-800">Month Overview</h3>
            </div>
            
            {sortedMoods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedMoods.map(([mood, count], index) => (
                  <div key={mood} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{moodEmojis[mood] || '😐'}</span>
                      <span className="font-medium text-charcoal-700">{moodLabels[mood] || mood}</span>
                      {index === 0 && (
                        <Badge variant="secondary" className="bg-blushrose-100 text-blushrose-800 text-xs">
                          Most frequent
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-charcoal-900">{count}</div>
                      <div className="text-xs text-mutedgray-500">
                        {Math.round((count / totalMonthEntries) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-mutedgray-500 text-center py-4">No mood data available for this month</p>
            )}
          </div>

          {/* Weekly Breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-sage-600" />
              <h3 className="text-lg font-semibold text-charcoal-800">Weekly Soul Journey</h3>
            </div>
            
            <div className="space-y-4">
              {weeklyData.map((week, index) => (
                <div key={index} className="bg-white rounded-lg border border-sage-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-charcoal-800">{week.weekLabel}</h4>
                    <div className="text-sm text-mutedgray-500">
                      {week.totalEntries} {week.totalEntries === 1 ? 'entry' : 'entries'}
                    </div>
                  </div>
                  
                  {week.totalEntries > 0 ? (
                    <div className="space-y-3">
                      {/* Dominant Mood */}
                      {week.dominantMood && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-charcoal-600">Dominant mood:</span>
                          <Badge 
                            variant="secondary" 
                            className={`${moodColors[week.dominantMood] || moodColors.general} border`}
                          >
                            {moodEmojis[week.dominantMood] || '😐'} {moodLabels[week.dominantMood] || week.dominantMood}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Mood Distribution */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(week.moodCounts).map(([mood, count]) => (
                          <div key={mood} className="flex items-center gap-1 text-sm">
                            <span>{moodEmojis[mood] || '😐'}</span>
                            <span className="text-charcoal-600">{moodLabels[mood] || mood}</span>
                            <span className="font-medium text-charcoal-800">({count})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-mutedgray-500 text-sm italic">No entries this week</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blushrose-50 rounded-lg p-6 border border-blushrose-200">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-3">Soul Insights</h3>
            <div className="space-y-2 text-sm text-charcoal-700">
              {totalMonthEntries > 0 ? (
                <>
                  <p>• You expressed yourself through {totalMonthEntries} journal {totalMonthEntries === 1 ? 'entry' : 'entries'} this month</p>
                  {sortedMoods.length > 0 && (
                    <p>• Your most frequent emotional state was <strong>{moodLabels[sortedMoods[0][0]] || sortedMoods[0][0]}</strong> ({sortedMoods[0][1]} {sortedMoods[0][1] === 1 ? 'time' : 'times'})</p>
                  )}
                  {sortedMoods.length > 1 && (
                    <p>• You experienced {sortedMoods.length} different emotional states, showing the richness of your inner journey</p>
                  )}
                  <p>• Each entry is a step in your path of self-discovery and growth</p>
                </>
              ) : (
                <p>• This month is waiting for your soul's expression - start your first entry!</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}