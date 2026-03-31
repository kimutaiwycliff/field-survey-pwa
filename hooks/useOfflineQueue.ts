'use client'

import { useState, useEffect, useCallback } from 'react'
import { getQueueCount } from '@/lib/offline/queue'
import { syncQueue } from '@/lib/offline/sync'
import { useOnlineStatus } from './useOnlineStatus'

export function useOfflineQueue() {
  const isOnline = useOnlineStatus()
  const [queueCount, setQueueCount] = useState(0)
  const [syncing, setSyncing] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const count = await getQueueCount()
      setQueueCount(count)
    } catch {
      // IndexedDB not available (SSR)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!isOnline || queueCount === 0) return

    let cancelled = false
    ;(async () => {
      setSyncing(true)
      await syncQueue()
      if (!cancelled) {
        await refresh()
        setSyncing(false)
      }
    })()

    return () => { cancelled = true }
  }, [isOnline, queueCount, refresh])

  return { queueCount, syncing, refresh }
}
