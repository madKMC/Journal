'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Eye, Lock, Globe, Download } from 'lucide-react'
import { format } from 'date-fns'
import { generateEntryPDF } from '@/lib/pdfGenerator'
import { toast } from 'sonner'
import { Database } from '@/types/database'
import { processMonitor } from '@/lib/processMonitor'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

interface EntryCardProps {
  entry: JournalEntry
  onEdit: (entry: JournalEntry) => void
  onDelete: (id: string) => void
  onView: (entry: JournalEntry) => void
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

export function EntryCard({ entry, onEdit, onDelete, onView }: EntryCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const handleDelete = async () => {
    console.log('🗑️ [EntryCard] Deleting entry:', entry.id)
    setDeleting(true)
    processMonitor.logMemoryUsage('Before Delete Entry Card')
    
    try {
      await onDelete(entry.id)
      console.log('✅ [EntryCard] Entry deleted successfully')
    } catch (error) {
      console.error('🚨 [EntryCard] Error deleting entry:', error)
    } finally {
      setDeleting(false)
      processMonitor.logMemoryUsage('After Delete Entry Card')
    }
  }

  const handleGeneratePDF = async () => {
    console.log('📄 [EntryCard] Generating PDF for entry:', entry.id)
    setGeneratingPDF(true)
    processMonitor.logMemoryUsage('Before PDF Generation Card')
    
    try {
      await generateEntryPDF(entry)
      toast.success('PDF generated successfully!')
      console.log('✅ [EntryCard] PDF generated successfully')
    } catch (error) {
      toast.error('Failed to generate PDF')
      console.error('🚨 [EntryCard] PDF generation error:', error)
    } finally {
      setGeneratingPDF(false)
      processMonitor.logMemoryUsage('After PDF Generation Card')
    }
  }

  const handleEdit = () => {
    console.log('✏️ [EntryCard] Editing entry:', entry.id)
    processMonitor.logMemoryUsage('Edit Entry Card')
    onEdit(entry)
  }

  const handleView = () => {
    console.log('👁️ [EntryCard] Viewing entry:', entry.id)
    processMonitor.logMemoryUsage('View Entry Card')
    onView(entry)
  }

  const truncateContent = (content: string, maxLength: number) => {
    // Check if content contains HTML tags (rich text)
    const isRichText = /<[^>]*>/.test(content)
    
    if (isRichText) {
      // For rich text, we'll truncate the HTML but preserve some basic formatting
      const truncatedHtml = content.length <= maxLength ? content : content.substring(0, maxLength) + '...'
      return truncatedHtml
    } else {
      // For plain text, just truncate normally
      if (content.length <= maxLength) return content
      return content.substring(0, maxLength) + '...'
    }
  }

  const truncatedContent = truncateContent(entry.content, 200)
  const isRichText = /<[^>]*>/.test(entry.content)

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-charcoal-900 mb-2 truncate group-hover:text-sage-600 transition-colors">
              {entry.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <time className="text-sm text-mutedgray-500">
                {format(new Date(entry.created_at), 'MMM d, yyyy')}
              </time>
              {entry.mood && (
                <Badge variant="secondary" className={`${moodColors[entry.mood] || 'bg-gray-100 text-gray-800'} border`}>
                  {moodEmojis[entry.mood] || '😐'} {moodLabels[entry.mood] || entry.mood}
                </Badge>
              )}
              <div className="flex items-center text-xs text-mutedgray-500">
                {entry.is_private ? (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {entry.image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={entry.image_url}
                alt={entry.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
          
          <div className="text-charcoal-600 leading-relaxed">
            {isRichText ? (
              <div 
                className="prose prose-sm max-w-none [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-sage-300 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-mutedgray-600 [&_p]:mb-2 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: truncatedContent }}
              />
            ) : (
              <p>{truncatedContent}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleView}
              className="text-sage-600 hover:text-sage-700 hover:bg-sage-50"
            >
              <Eye className="h-4 w-4 mr-1" />
              Read More
            </Button>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGeneratePDF}
                disabled={generatingPDF}
                className="text-mutedgray-600 hover:text-mistblue-600 hover:bg-mistblue-50"
                title="Download as PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="text-mutedgray-600 hover:text-sage-600 hover:bg-sage-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-mutedgray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this journal entry? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}