'use client'

import { useState, useEffect } from 'react'
import { getCurrentPosition } from '@/lib/utils/geolocation'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface Props {
  onCapture: (lat: number, lng: number) => void
  error?: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function LocationCapture({ onCapture, error: formError }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [position, setPosition] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)

  async function capture() {
    setStatus('loading')
    setGeoError(null)
    try {
      const pos = await getCurrentPosition()
      setPosition(pos)
      setStatus('success')
      onCapture(pos.lat, pos.lng)
    } catch (e) {
      setGeoError(e instanceof Error ? e.message : 'Could not get location')
      setStatus('error')
    }
  }

  useEffect(() => {
    capture()
  }, [])

  return (
    <div>
      <label className="block text-slate-300 text-sm font-medium mb-2">GPS Location</label>
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <LoadingSpinner size="sm" />
            <span>Capturing GPS coordinates...</span>
          </div>
        )}

        {status === 'success' && position && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">📍 Location captured</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </p>
              <p className="text-slate-500 text-xs">±{Math.round(position.accuracy)}m accuracy</p>
            </div>
            <button
              type="button"
              onClick={capture}
              className="text-blue-400 text-xs hover:underline min-h-[44px] px-2"
            >
              Recapture
            </button>
          </div>
        )}

        {(status === 'error' || status === 'idle') && (
          <div>
            {geoError && <p className="text-red-400 text-xs mb-2">{geoError}</p>}
            <button
              type="button"
              onClick={capture}
              className="text-blue-400 text-sm hover:underline"
            >
              📍 Capture GPS Location
            </button>
          </div>
        )}
      </div>
      {formError && <p className="text-red-400 text-xs mt-1">{formError}</p>}
    </div>
  )
}
