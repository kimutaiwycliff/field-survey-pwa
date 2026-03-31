import { createClient } from '@/lib/supabase/client'
import { getQueue, clearItem } from './queue'

export async function syncQueue(): Promise<{ synced: number; failed: number }> {
  const supabase = createClient()
  const queue = await getQueue()
  let synced = 0
  let failed = 0

  for (const item of queue) {
    try {
      let photo_url: string | null = null

      if (item.photoBlob && item.photoFileName && item.photoMimeType) {
        const file = new File([item.photoBlob], item.photoFileName, {
          type: item.photoMimeType,
        })
        const path = `${Date.now()}-${item.photoFileName}`
        const { data, error } = await supabase.storage
          .from('survey-photos')
          .upload(path, file)

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('survey-photos')
            .getPublicUrl(data.path)
          photo_url = urlData.publicUrl
        }
      }

      const { error } = await supabase.from('observations').insert({
        type: item.type,
        description: item.description,
        severity: item.severity,
        lat: item.lat,
        lng: item.lng,
        photo_url,
        created_at: item.createdAt,
        synced: true,
      })

      if (error) throw error

      await clearItem(item.id!)
      synced++
    } catch {
      failed++
    }
  }

  return { synced, failed }
}
