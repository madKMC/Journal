'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, PenTool } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { processMonitor } from '@/lib/processMonitor'

type WritingPrompt = Database['public']['Tables']['writing_prompts']['Row']

interface WritingPromptProps {
  onUsePrompt: (prompt: string) => void
}

const categoryColors: Record<string, string> = {
  gratitude: 'bg-sage-100 text-sage-800',
  emotions: 'bg-blue-100 text-blue-800',
  reflection: 'bg-purple-100 text-purple-800',
  places: 'bg-teal-100 text-teal-800',
  growth: 'bg-orange-100 text-orange-800',
  dreams: 'bg-blushrose-100 text-blushrose-800',
  learning: 'bg-indigo-100 text-indigo-800',
  people: 'bg-amber-100 text-amber-800',
  future: 'bg-cyan-100 text-cyan-800',
  kindness: 'bg-blushrose-200 text-blushrose-900',
  passion: 'bg-red-100 text-red-800',
  influence: 'bg-violet-100 text-violet-800',
  family: 'bg-yellow-100 text-yellow-800',
  goals: 'bg-lime-100 text-lime-800',
  courage: 'bg-green-100 text-green-800',
  general: 'bg-mutedgray-100 text-mutedgray-800',
  // Good mood categories
  happy: 'bg-yellow-100 text-yellow-800',
  excited: 'bg-purple-100 text-purple-800',
  peaceful: 'bg-sage-100 text-sage-800',
  grateful: 'bg-blushrose-100 text-blushrose-800',
  energetic: 'bg-red-100 text-red-800',
}

export function WritingPrompt({ onUsePrompt }: WritingPromptProps) {
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchRandomPrompt = async () => {
    console.log('💡 [WritingPrompt] Fetching random prompt...')
    setLoading(true)
    processMonitor.logMemoryUsage('Before Fetch Prompt')

    try {
      // Only fetch prompts from "good mood" categories and general
      const goodMoodCategories = ['happy', 'excited', 'peaceful', 'grateful', 'energetic', 'general']
      
      const { data, error } = await supabase
        .from('writing_prompts')
        .select('*')
        .in('category', goodMoodCategories)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('🚨 [WritingPrompt] Error fetching prompts:', error)
        throw error
      }

      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length)
        const selectedPrompt = data[randomIndex]
        setPrompt(selectedPrompt)
        
        console.log('✅ [WritingPrompt] Random prompt selected:', {
          id: selectedPrompt.id,
          category: selectedPrompt.category,
          promptPreview: selectedPrompt.prompt.substring(0, 50) + '...'
        })
      } else {
        console.warn('⚠️ [WritingPrompt] No prompts found in database')
      }

      processMonitor.logMemoryUsage('After Fetch Prompt')
    } catch (error) {
      console.error('🚨 [WritingPrompt] Error fetching writing prompt:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('💡 [WritingPrompt] Component mounted, fetching initial prompt')
    fetchRandomPrompt()
  }, [])

  const handleUsePrompt = () => {
    if (prompt) {
      console.log('✨ [WritingPrompt] Using prompt:', {
        id: prompt.id,
        category: prompt.category,
        promptPreview: prompt.prompt.substring(0, 50) + '...'
      })
      processMonitor.logMemoryUsage('Use Writing Prompt')
      onUsePrompt(prompt.prompt)
    }
  }

  const handleRefreshPrompt = () => {
    console.log('🔄 [WritingPrompt] Refreshing prompt')
    fetchRandomPrompt()
  }

  if (!prompt) {
    return (
      <Card className="w-full bg-gradient-to-r from-sage-50 to-mistblue-50 border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-sage-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-sage-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-gradient-to-r from-sage-50 to-mistblue-50 border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-charcoal-800">
            Soul Inspiration
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={`${categoryColors[prompt.category] || categoryColors.general} border-0`}
          >
            {prompt.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-charcoal-700 text-lg leading-relaxed font-medium">
            {prompt.prompt}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleUsePrompt}
              className="flex-1 bg-mistblue-200 hover:bg-darkersage-300 transition-all duration-200 text-charcoal-900"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Express Your Soul
            </Button>
            <Button
              variant="outline"
              onClick={handleRefreshPrompt}
              disabled={loading}
              className="sm:w-auto hover:bg-sage-50 border-sage-200 text-charcoal-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              New Inspiration
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}