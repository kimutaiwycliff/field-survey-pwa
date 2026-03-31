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
  type:        z.enum(['pothole', 'tree', 'waste', 'flooding', 'other'] as const),
  description: z.string().min(5, 'At least 5 characters').max(500),
  severity:    z.number().min(1, 'Select a severity').max(5),
  lat:         z.number({ message: 'GPS location required' }),
  lng:         z.number({ message: 'GPS location required' }),
})
type FormValues = z.infer<typeof schema>

export function SurveyForm() {
  const router   = useRouter()
  const isOnline = useOnlineStatus()
  const [photo,      setPhoto]      = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast,      setToast]      = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'other', severity: 3 },
  })

  async function onSubmit(data: FormValues) {
    setSubmitting(true)

    if (!isOnline) {
      let photoBlob: ArrayBuffer | undefined
      let photoMimeType: string | undefined
      let photoFileName: string | undefined
      if (photo) { photoBlob = await photo.arrayBuffer(); photoMimeType = photo.type; photoFileName = photo.name }
      await addToQueue({ type: data.type, description: data.description, severity: data.severity, lat: data.lat, lng: data.lng, photoBlob, photoMimeType, photoFileName, createdAt: new Date().toISOString() })
      setToast({ message: '💾 Saved offline — will sync on reconnect', type: 'info' })
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
        const { data: up, error: upErr } = await supabase.storage.from('survey-photos').upload(path, photo)
        if (upErr) throw upErr
        photo_url = supabase.storage.from('survey-photos').getPublicUrl(up.path).data.publicUrl
      }

      const { error } = await supabase.from('observations').insert({
        user_id: user.id, type: data.type, description: data.description,
        severity: data.severity, lat: data.lat, lng: data.lng, photo_url, synced: true,
      })
      if (error) throw error

      setToast({ message: '✅ Observation submitted!', type: 'success' })
      setTimeout(() => router.push('/my-surveys'), 1500)
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : 'Submission failed', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-36">
        <Controller name="type" control={control} render={({ field }) => (
          <TypeSelector value={field.value as ObservationType} onChange={field.onChange} error={errors.type?.message} />
        )} />

        <div>
          <span className="label-caps block mb-2">Description</span>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Describe what you observed in the field…"
            className="field-input resize-none"
          />
          {errors.description && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.description.message}</p>}
        </div>

        <Controller name="severity" control={control} render={({ field }) => (
          <SeverityRating value={field.value} onChange={field.onChange} error={errors.severity?.message} />
        )} />

        <LocationCapture
          onCapture={(lat, lng) => { setValue('lat', lat); setValue('lng', lng) }}
          error={errors.lat?.message ?? errors.lng?.message}
        />

        <PhotoCapture onCapture={setPhoto} />
      </form>

      {/* Fixed submit */}
      <div
        className="fixed bottom-14 left-0 right-0 px-4 py-3"
        style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}
      >
        <button
          type="submit"
          form="survey-form"
          disabled={submitting}
          onClick={handleSubmit(onSubmit)}
          className="btn btn-primary w-full font-display font-bold text-sm uppercase tracking-widest"
          style={{ minHeight: '52px', fontSize: '0.85rem' }}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,0.3)', borderTopColor: '#000' }} />
              Submitting…
            </span>
          ) : isOnline ? '↑ Submit Observation' : '↓ Save Offline'}
        </button>
      </div>
    </>
  )
}
