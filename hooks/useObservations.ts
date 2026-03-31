'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Observation } from '@/lib/utils/observation-types'

interface UseObservationsOptions {
  mine?: boolean
  type?: string
  severity?: number
}

export function useObservations(options: UseObservationsOptions = {}) {
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      let query = supabase.from('observations').select('*').order('created_at', { ascending: false })

      if (options.mine) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) query = query.eq('user_id', user.id)
      }
      if (options.type) query = query.eq('type', options.type)
      if (options.severity) query = query.eq('severity', options.severity)

      const { data, error } = await query
      if (error) throw error
      setObservations((data as Observation[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load observations')
    } finally {
      setLoading(false)
    }
  }, [options.mine, options.type, options.severity])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { observations, loading, error, refetch: fetch }
}
