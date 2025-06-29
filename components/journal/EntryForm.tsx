'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Loader2, Save, Upload } from 'lucide-react'
import { Database } from '@/types/database'

const entrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  mood: z.string().optional(),
  is_private: z.boolean().default(true),
})

type EntryFormData = z.infer<typeof entrySchema>
type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

interface EntryFormProps {
  entry?: JournalEntry | null
  onSuccess?: () => void
  onCancel?: () => void
}

const moods = [
  { value: 'happy', label: '😊 Happy', color: 'text-amber-600' },
  { value: 'sad', label: '😢 Sad', color: 'text-blue-600' },
  { value: 'excited', label: '🎉 Excited', color: 'text-purple-600' },
  { value: 'peaceful', label: '😌 Peaceful', color: 'text-green-600' },
  { value: 'anxious', label: '😰 Anxious', color: 'text-orange-600' },
  { value: 'grateful', label: '🙏 Grateful', color: 'text-pink-600' },
  { value: 'reflective', label: '🤔 Reflective', color: 'text-indigo-600' },
  { value: 'energetic', label: '⚡ Energetic', color: 'text-red-600' },
]

export function EntryForm({ entry, onSuccess, onCancel }: EntryFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(entry?.image_url || '')
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: entry?.title || '',
      content: entry?.content || '',
      mood: entry?.mood || '',
      is_private: entry?.is_private ?? true,
    },
  })

  const watchedMood = watch('mood')
  const watchedIsPrivate = watch('is_private')

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('journal-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('journal-images')
        .getPublicUrl(filePath)

      setImageUrl(data.publicUrl)
      toast.success('Image uploaded successfully!')
    } catch (error) {
      toast.error('Error uploading image')
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: EntryFormData) => {
    if (!user) return

    setLoading(true)
    try {
      const entryData = {
        ...data,
        user_id: user.id,
        image_url: imageUrl || null,
        updated_at: new Date().toISOString(),
      }

      let error
      if (entry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', entry.id)
        error = updateError
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('journal_entries')
          .insert([entryData])
        error = insertError
      }

      if (error) {
        throw error
      }

      toast.success(entry ? 'Entry updated successfully!' : 'Entry created successfully!')
      onSuccess?.()
    } catch (error) {
      toast.error('Error saving entry')
      console.error('Error saving entry:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-charcoal-900">
          {entry ? 'Edit Entry' : 'New Journal Entry'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium text-charcoal-700">
              Title
            </Label>
            <Input
              id="title"
              placeholder="What's on your mind today?"
              {...register('title')}
              className="h-12 text-lg border-sage-200 focus:border-sage-400"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-base font-medium text-charcoal-700">Mood</Label>
              <Select value={watchedMood} onValueChange={(value) => setValue('mood', value)}>
                <SelectTrigger className="h-12 border-sage-200 focus:border-sage-400">
                  <SelectValue placeholder="How are you feeling?" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value}>
                      <span className={mood.color}>{mood.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium text-charcoal-700">Privacy</Label>
              <div className="flex items-center space-x-3 h-12">
                <Switch
                  checked={watchedIsPrivate}
                  onCheckedChange={(checked) => setValue('is_private', checked)}
                />
                <span className="text-sm text-mutedgray-500">
                  {watchedIsPrivate ? 'Private entry' : 'Public entry'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium text-charcoal-700">Image</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-sage-100 hover:bg-sage-200 rounded-lg transition-colors text-charcoal-700"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Label>
              </div>
              {imageUrl && (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Entry image"
                    className="w-full max-w-sm h-48 object-cover rounded-lg shadow-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setImageUrl('')}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium text-charcoal-700">
              Content
            </Label>
            <Textarea
              id="content"
              placeholder="Write your thoughts here..."
              {...register('content')}
              className="min-h-[300px] resize-y text-base leading-relaxed border-sage-200 focus:border-sage-400"
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="submit"
              className="flex-1 h-12 bg-mistblue-200 hover:bg-darkersage-300 transition-all duration-200 text-charcoal-900"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {entry ? 'Update Entry' : 'Save Entry'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 border-sage-200 text-charcoal-700 hover:bg-sage-50"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}