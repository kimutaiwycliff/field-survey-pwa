'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { addToQueue } from '@/lib/offline/queue'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { TypeSelector } from './TypeSelector'
import { SeverityRating } from './SeverityRating'
import { LocationCapture } from './LocationCapture'
import { PhotoCapture } from './PhotoCapture'
import { Toast } from '@/components/shared/Toast'
import { ObservationType } from '@/lib/utils/observation-types'

const schema = z.object({
  type: z.enum(['pothole', 'tree', 'waste', 'flooding', 'other'] as const),
  description: z.string().min(5, 'At least 5 characters').max(500),
  severity: z.number().min(1, 'Select a severity').max(5),
  lat: z.number({ message: 'GPS location required' }),
  lng: z.number({ message: 'GPS location required' }),
})

type FormValues = z.infer<typeof schema>

export function SurveyForm() {
  const router = useRouter()
  const isOnline = useOnlineStatus()
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'other', severity: 3 },
  })

  async function onSubmit(data: FormValues) {
    setSubmitting(true)

    if (!isOnline) {
      // Save to offline queue
      let photoBlob: ArrayBuffer | undefined
      let photoMimeType: string | undefined
      let photoFileName: string | undefined

      if (photo) {
        photoBlob = await photo.arrayBuffer()
        photoMimeType = photo.type
        photoFileName = photo.name
      }

      await addToQueue({
        type: data.type,
        description: data.description,
        severity: data.severity,
        lat: data.lat,
        lng: data.lng,
        photoBlob,
        photoMimeType,
        photoFileName,
        createdAt: new Date().toISOString(),
      })

      setToast({ message: '💾 Saved offline — will sync when connected', type: 'info' })
      setSubmitting(false)
      return
    }

    try {
      const supabase = createClient()

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      let photo_url: string | null = null

      if (photo) {
        const path = `${Date.now()}-${photo.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('survey-photos')
          .upload(path, photo)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('survey-photos')
          .getPublicUrl(uploadData.path)
        photo_url = urlData.publicUrl
      }

      const { error } = await supabase.from('observations').insert({
        user_id: user.id,
        type: data.type,
        description: data.description,
        severity: data.severity,
        lat: data.lat,
        lng: data.lng,
        photo_url,
        synced: true,
      })

      if (error) throw error

      setToast({ message: '✅ Observation submitted!', type: 'success' })
      setTimeout(() => router.push('/my-surveys'), 1500)
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : 'Submission failed',
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-32">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <TypeSelector
              value={field.value as ObservationType}
              onChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Describe what you observed..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        <Controller
          name="severity"
          control={control}
          render={({ field }) => (
            <SeverityRating
              value={field.value}
              onChange={field.onChange}
              error={errors.severity?.message}
            />
          )}
        />

        <LocationCapture
          onCapture={(lat, lng) => {
            setValue('lat', lat)
            setValue('lng', lng)
          }}
          error={errors.lat?.message ?? errors.lng?.message}
        />

        <PhotoCapture onCapture={setPhoto} />

        <div className="fixed bottom-[56px] left-0 right-0 p-4 bg-slate-900/95 backdrop-blur border-t border-slate-700">
          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[52px] bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-base transition-colors shadow-lg"
          >
            {submitting
              ? 'Submitting...'
              : isOnline
              ? '📤 Submit Observation'
              : '💾 Save Offline'}
          </button>
        </div>
      </form>
    </>
  )
}
