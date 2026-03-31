'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const { queueCount, syncing } = useOfflineQueue()

  if (isOnline && queueCount === 0) return null

  if (isOnline && syncing) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-sm text-center py-2 px-4 font-medium">
        🔄 Syncing {queueCount} submission{queueCount !== 1 ? 's' : ''}...
      </div>
    )
  }

  if (isOnline && queueCount > 0) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-700 text-white text-sm text-center py-2 px-4 font-medium">
        ✅ Back online — syncing {queueCount} queued item{queueCount !== 1 ? 's' : ''}
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-sm text-center py-2 px-4 font-medium">
      📡 Offline{queueCount > 0 ? ` — ${queueCount} submission${queueCount !== 1 ? 's' : ''} queued` : ''}
    </div>
  )
}
