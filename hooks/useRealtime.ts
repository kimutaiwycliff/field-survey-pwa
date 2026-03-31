'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Observation } from '@/lib/utils/observation-types'

export function useRealtime(onInsert: (obs: Observation) => void) {
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('observations-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'observations' },
        (payload) => {
          onInsert(payload.new as Observation)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onInsert])
}
