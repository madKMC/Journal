'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Lock, Globe, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { Database } from '@/types/database'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

interface EntryViewProps {
  entry: JournalEntry | null
  open: boolean
  onClose: () => void
  onEdit: (entry: JournalEntry) => void
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

export function EntryView({ entry, open, onClose, onEdit }: EntryViewProps) {
  if (!entry) return null

  // Check if content contains HTML tags (rich text)
  const isRichText = /<[^>]*>/.test(entry.content)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-charcoal-900 mb-3">
                {entry.title}
              </DialogTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center text-mutedgray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(entry.created_at), 'MMMM d, yyyy')}
                </div>
                {entry.mood && (
                  <Badge variant="secondary" className={`${moodColors[entry.mood] || 'bg-gray-100 text-gray-800'} border`}>
                    {moodEmojis[entry.mood] || '😐'} {moodLabels[entry.mood] || entry.mood}
                  </Badge>
                )}
                <div className="flex items-center text-sm text-mutedgray-500">
                  {entry.is_private ? (
                    <>
                      <Lock className="h-4 w-4 mr-1" />
                      Private
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-1" />
                      Public
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(entry)}
              className="ml-4 border-sage-200 text-sage-700 hover:bg-sage-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {entry.image_url && (
            <div className="w-full">
              <img
                src={entry.image_url}
                alt={entry.title}
                className="w-full max-h-96 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {isRichText ? (
              <div 
                className="text-charcoal-700 leading-relaxed prose prose-sm max-w-none [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-sage-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-mutedgray-600"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-charcoal-700 leading-relaxed">
                {entry.content}
              </div>
            )}
          </div>

          {entry.updated_at !== entry.created_at && (
            <div className="text-xs text-mutedgray-400 pt-4 border-t">
              Last updated: {format(new Date(entry.updated_at), 'MMMM d, yyyy \'at\' h:mm a')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}