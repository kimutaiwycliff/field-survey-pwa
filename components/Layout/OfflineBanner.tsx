'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'

export function OfflineBanner() {
  const isOnline   = useOnlineStatus()
  const { queueCount, syncing } = useOfflineQueue()

  if (isOnline && queueCount === 0) return null

  const bg    = !isOnline ? 'var(--warning)'  : syncing ? 'var(--info)' : 'var(--success)'
  const label = !isOnline
    ? `OFFLINE${queueCount > 0 ? ` · ${queueCount} QUEUED` : ''}`
    : syncing
    ? `SYNCING ${queueCount} ITEM${queueCount !== 1 ? 'S' : ''}…`
    : `BACK ONLINE · SYNCING ${queueCount}`

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-1.5 px-4"
      style={{ background: bg, color: '#000' }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-black opacity-60 animate-pulse" />
      <span className="font-display font-bold text-xs tracking-widest">{label}</span>
    </div>
  )
}
