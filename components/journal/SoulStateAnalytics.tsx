'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Heart, TrendingUp, BarChart3 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
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

export function SoulStateAnalytics({ entries, monthYear, open, onClose }: SoulStateAnalyticsProps) {
  // Parse the monthYear string (format: "2024-01")
  const [year, month] = monthYear.split('-')
  const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1)
  const formattedMonthYear = format(monthStart, 'MMMM yyyy')

  // Calculate overall month statistics
  const totalMonthEntries = entries.length
  const overallMoodCounts: Record<string, number> = {}
  
  entries.forEach(entry => {
    const mood = entry.mood || 'general'
    overallMoodCounts[mood] = (overallMoodCounts[mood] || 0) + 1
  })

  const sortedMoods = Object.entries(overallMoodCounts)
    .sort(([, a], [, b]) => b - a)

  // Calculate mood distribution by day of month
  const dailyMoodData: Record<number, Record<string, number>> = {}
  entries.forEach(entry => {
    const entryDate = parseISO(entry.created_at)
    const dayOfMonth = entryDate.getDate()
    const mood = entry.mood || 'general'
    
    if (!dailyMoodData[dayOfMonth]) {
      dailyMoodData[dayOfMonth] = {}
    }
    dailyMoodData[dayOfMonth][mood] = (dailyMoodData[dayOfMonth][mood] || 0) + 1
  })

  // Get the most active days
  const activeDays = Object.entries(dailyMoodData)
    .map(([day, moods]) => ({
      day: parseInt(day),
      totalEntries: Object.values(moods).reduce((sum, count) => sum + count, 0),
      dominantMood: Object.entries(moods).sort(([, a], [, b]) => b - a)[0]?.[0] || 'general'
    }))
    .sort((a, b) => b.totalEntries - a.totalEntries)
    .slice(0, 5)

  // Calculate mood trends
  const positiveMoods = ['happy', 'excited', 'peaceful', 'grateful', 'energetic']
  const challengingMoods = ['sad', 'anxious', 'overwhelmed', 'angry', 'lonely', 'burnt_out']
  const neutralMoods = ['reflective', 'general', 'numb', 'insecure']

  const positiveCount = positiveMoods.reduce((sum, mood) => sum + (overallMoodCounts[mood] || 0), 0)
  const challengingCount = challengingMoods.reduce((sum, mood) => sum + (overallMoodCounts[mood] || 0), 0)
  const neutralCount = neutralMoods.reduce((sum, mood) => sum + (overallMoodCounts[mood] || 0), 0)

  const getInsights = () => {
    const insights = []
    
    if (totalMonthEntries === 0) {
      insights.push("This month is waiting for your soul's expression - start your first entry!")
      return insights
    }

    insights.push(`You expressed yourself through ${totalMonthEntries} journal ${totalMonthEntries === 1 ? 'entry' : 'entries'} this month`)
    
    if (sortedMoods.length > 0) {
      const topMood = sortedMoods[0]
      insights.push(`Your most frequent emotional state was ${moodLabels[topMood[0]] || topMood[0]} (${topMood[1]} ${topMood[1] === 1 ? 'time' : 'times'})`)
    }

    if (positiveCount > challengingCount) {
      insights.push(`Your soul radiated positivity this month with ${Math.round((positiveCount / totalMonthEntries) * 100)}% positive emotional states`)
    } else if (challengingCount > positiveCount) {
      insights.push(`You navigated through some challenges this month - remember that growth often comes through difficult times`)
    } else {
      insights.push(`You experienced a balanced emotional journey this month`)
    }

    if (sortedMoods.length > 3) {
      insights.push(`You experienced ${sortedMoods.length} different emotional states, showing the richness and depth of your inner journey`)
    }

    if (activeDays.length > 0) {
      const mostActiveDay = activeDays[0]
      insights.push(`Your most expressive day was the ${mostActiveDay.day}${getOrdinalSuffix(mostActiveDay.day)} with ${mostActiveDay.totalEntries} ${mostActiveDay.totalEntries === 1 ? 'entry' : 'entries'}`)
    }

    insights.push("Each entry is a sacred step in your path of self-discovery and growth")
    
    return insights
  }

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          Soul State Analytics for {formattedMonthYear}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Monthly analytics showing mood distribution, emotional balance, and insights for {formattedMonthYear} with {totalMonthEntries} journal entries
        </DialogDescription>
        
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

          {/* Mood Distribution Overview */}
          <div className="bg-gradient-to-r from-sage-50 to-mistblue-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-sage-600" />
              <h3 className="text-lg font-semibold text-charcoal-800">Mood Distribution</h3>
            </div>
            
            {sortedMoods.length > 0 ? (
              <div className="space-y-4">
                {/* Top Moods Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sortedMoods.slice(0, 6).map(([mood, count], index) => (
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

                {/* Emotional Balance */}
                <div className="bg-white rounded-lg p-4 border border-sage-200">
                  <h4 className="font-medium text-charcoal-800 mb-3">Emotional Balance</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-600">{positiveCount}</div>
                      <div className="text-sm text-charcoal-600">Positive</div>
                      <div className="text-xs text-mutedgray-500">
                        {totalMonthEntries > 0 ? Math.round((positiveCount / totalMonthEntries) * 100) : 0}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-orange-600">{challengingCount}</div>
                      <div className="text-sm text-charcoal-600">Challenging</div>
                      <div className="text-xs text-mutedgray-500">
                        {totalMonthEntries > 0 ? Math.round((challengingCount / totalMonthEntries) * 100) : 0}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-600">{neutralCount}</div>
                      <div className="text-sm text-charcoal-600">Reflective</div>
                      <div className="text-xs text-mutedgray-500">
                        {totalMonthEntries > 0 ? Math.round((neutralCount / totalMonthEntries) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-mutedgray-500 text-center py-4">No mood data available for this month</p>
            )}
          </div>

          {/* Most Active Days */}
          {activeDays.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-sage-600" />
                <h3 className="text-lg font-semibold text-charcoal-800">Most Expressive Days</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeDays.map((dayData, index) => (
                  <div key={dayData.day} className="bg-white rounded-lg border border-sage-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-charcoal-800">
                        {format(new Date(parseInt(year), parseInt(month) - 1, dayData.day), 'MMM d')}
                      </div>
                      {index === 0 && (
                        <Badge variant="secondary" className="bg-mistblue-100 text-mistblue-800 text-xs">
                          Most active
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-mutedgray-600">
                        {dayData.totalEntries} {dayData.totalEntries === 1 ? 'entry' : 'entries'}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-charcoal-600">Dominant mood:</span>
                        <Badge 
                          variant="secondary" 
                          className={`${moodColors[dayData.dominantMood] || moodColors.general} border text-xs`}
                        >
                          {moodEmojis[dayData.dominantMood] || '😐'} {moodLabels[dayData.dominantMood] || dayData.dominantMood}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Soul Insights */}
          <div className="bg-blushrose-50 rounded-lg p-6 border border-blushrose-200">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-3">Soul Insights</h3>
            <div className="space-y-2 text-sm text-charcoal-700">
              {getInsights().map((insight, index) => (
                <p key={index}>• {insight}</p>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}