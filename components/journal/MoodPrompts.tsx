'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Lightbulb, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { processMonitor } from '@/lib/processMonitor'

type WritingPrompt = Database['public']['Tables']['writing_prompts']['Row']

interface MoodPromptsProps {
  selectedMood?: string
  onUsePrompt: (prompt: string) => void
  className?: string
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
  general: '💭',
}

const categoryColors: Record<string, string> = {
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

export function MoodPrompts({ selectedMood, onUsePrompt, className }: MoodPromptsProps) {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([])
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchPrompts = async (mood?: string) => {
    console.log('🎭 [MoodPrompts] Fetching prompts for mood:', mood || 'general')
    setLoading(true)
    processMonitor.logMemoryUsage('Before Fetch Mood Prompts')

    try {
      let query = supabase.from('writing_prompts').select('*')
      
      if (mood) {
        // Get prompts for the specific mood + general prompts
        query = query.in('category', [mood, 'general'])
        console.log('🎭 [MoodPrompts] Fetching prompts for categories:', [mood, 'general'])
      } else {
        // Get only general prompts if no mood selected
        query = query.eq('category', 'general')
        console.log('🎭 [MoodPrompts] Fetching general prompts only')
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('🚨 [MoodPrompts] Error fetching mood prompts:', error)
        throw error
      }

      if (data && data.length > 0) {
        setPrompts(data)
        // Select a random prompt
        const randomIndex = Math.floor(Math.random() * data.length)
        const selectedPrompt = data[randomIndex]
        setCurrentPrompt(selectedPrompt)
        
        console.log('✅ [MoodPrompts] Prompts fetched and random prompt selected:', {
          totalPrompts: data.length,
          selectedPromptId: selectedPrompt.id,
          selectedCategory: selectedPrompt.category,
          promptPreview: selectedPrompt.prompt.substring(0, 50) + '...'
        })
      } else {
        console.warn('⚠️ [MoodPrompts] No prompts found for mood:', mood)
        setPrompts([])
        setCurrentPrompt(null)
      }

      processMonitor.logMemoryUsage('After Fetch Mood Prompts')
    } catch (error) {
      console.error('🚨 [MoodPrompts] Error fetching mood prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNewPrompt = () => {
    if (prompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * prompts.length)
      const newPrompt = prompts[randomIndex]
      setCurrentPrompt(newPrompt)
      
      console.log('🔄 [MoodPrompts] New prompt selected:', {
        promptId: newPrompt.id,
        category: newPrompt.category,
        promptPreview: newPrompt.prompt.substring(0, 50) + '...'
      })
      processMonitor.logMemoryUsage('New Mood Prompt Selected')
    }
  }

  const handleUsePrompt = () => {
    if (currentPrompt) {
      console.log('✨ [MoodPrompts] Using mood prompt:', {
        promptId: currentPrompt.id,
        category: currentPrompt.category,
        promptPreview: currentPrompt.prompt.substring(0, 50) + '...'
      })
      processMonitor.logMemoryUsage('Use Mood Prompt')
      onUsePrompt(currentPrompt.prompt)
    }
  }

  useEffect(() => {
    console.log('🎭 [MoodPrompts] Mood changed, fetching new prompts for:', selectedMood)
    fetchPrompts(selectedMood)
  }, [selectedMood])

  if (loading) {
    return (
      <Card className={`bg-gradient-to-r from-sage-50 to-mistblue-50 border-0 shadow-md ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-sage-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-sage-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentPrompt) {
    return null
  }

  return (
    <Card className={`bg-gradient-to-r from-sage-50 to-mistblue-50 border-0 shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-200 rounded-xl flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-sage-700" />
            </div>
            <CardTitle className="text-lg font-semibold text-charcoal-800">
              Soul Inspiration
            </CardTitle>
          </div>
          <Badge 
            variant="secondary" 
            className={`${categoryColors[currentPrompt.category] || categoryColors.general} border px-3 py-1`}
          >
            <span className="text-base mr-1">{moodEmojis[currentPrompt.category] || '💭'}</span>
            <span className="capitalize font-medium">{currentPrompt.category}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-5">
          <div className="bg-white/95 rounded-lg p-6 border-2 border-sage-300 shadow-sm">
            <p className="text-black leading-relaxed font-bold text-xl text-center">
              "{currentPrompt.prompt}"
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleUsePrompt}
              className="flex-1 h-11 bg-mistblue-200 hover:bg-darkersage-300 transition-all duration-200 text-charcoal-900 font-medium"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Express Your Soul
            </Button>
            <Button
              variant="outline"
              onClick={getNewPrompt}
              disabled={loading}
              className="sm:w-auto h-11 hover:bg-sage-50 border-sage-200 text-charcoal-700 font-medium"
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