'use client'

import { useState, useEffect } from 'react'
import { getCurrentPosition } from '@/lib/utils/geolocation'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface Props {
  onCapture: (lat: number, lng: number) => void
  error?: string
}

type Status = 'prompt' | 'loading' | 'success' | 'denied' | 'unavailable' | 'timeout'

function getErrorDetails(e: unknown): { status: Exclude<Status, 'prompt' | 'loading' | 'success'>; message: string } {
  if (e instanceof GeolocationPositionError) {
    switch (e.code) {
      case GeolocationPositionError.PERMISSION_DENIED:
        return { status: 'denied', message: 'Location access was denied.' }
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        return { status: 'unavailable', message: 'Location signal unavailable — try moving outdoors.' }
      case GeolocationPositionError.TIMEOUT:
        return { status: 'timeout', message: 'Location request timed out — check your GPS signal.' }
    }
  }
  return { status: 'unavailable', message: 'Could not get location.' }
}

export function LocationCapture({ onCapture, error: formError }: Props) {
  const [status, setStatus] = useState<Status>('prompt')
  const [position, setPosition] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function capture() {
    setStatus('loading')
    setErrorMsg(null)
    try {
      const pos = await getCurrentPosition()
      setPosition(pos)
      setStatus('success')
      onCapture(pos.lat, pos.lng)
    } catch (e) {
      const { status, message } = getErrorDetails(e)
      setStatus(status)
      setErrorMsg(message)
    }
  }

  // Check existing permission state on mount so we skip the prompt screen
  // if the user has already granted access.
  useEffect(() => {
    if (!navigator.permissions) {
      // Permissions API not available — go straight to capture
      capture()
      return
    }
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        capture()
      } else if (result.state === 'denied') {
        setStatus('denied')
        setErrorMsg('Location access was denied.')
      }
      // 'prompt' state → stay on prompt screen and wait for user tap
    })
  }, [])

  return (
    <div>
      <label className="block text-slate-300 text-sm font-medium mb-2">GPS Location</label>
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">

        {/* ── Prompt: user hasn't tapped yet ── */}
        {status === 'prompt' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">📍</span>
              <div>
                <p className="text-white text-sm font-medium">Allow location access</p>
                <p className="text-slate-400 text-xs mt-1">
                  Tap the button below. Your browser will ask for permission — tap{' '}
                  <span className="text-white font-semibold">"Allow"</span> to record GPS
                  coordinates for this observation.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={capture}
              className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              📍 Enable GPS &amp; Capture Location
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {status === 'loading' && (
          <div className="flex items-center gap-3 text-slate-400 text-sm py-1">
            <LoadingSpinner size="sm" />
            <div>
              <p className="text-white text-sm">Capturing GPS coordinates…</p>
              <p className="text-slate-500 text-xs">If prompted, tap <strong className="text-slate-300">Allow</strong> in your browser</p>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {status === 'success' && position && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">✅ Location captured</p>
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

        {/* ── Permission denied ── */}
        {status === 'denied' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-red-400">
              <span className="text-lg">🚫</span>
              <div>
                <p className="text-sm font-medium">Location access blocked</p>
                <p className="text-xs text-slate-400 mt-1">
                  You previously blocked location for this site. To fix it:
                </p>
                <ol className="text-xs text-slate-400 mt-1.5 space-y-1 list-decimal list-inside">
                  <li>Tap the <strong className="text-slate-300">lock / info icon</strong> in your browser's address bar</li>
                  <li>Find <strong className="text-slate-300">Location</strong> and change it to <strong className="text-slate-300">Allow</strong></li>
                  <li>Reload the page, then come back to this form</li>
                </ol>
              </div>
            </div>
            <button
              type="button"
              onClick={capture}
              className="w-full min-h-[44px] border border-slate-600 hover:border-slate-500 text-slate-300 text-sm rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Unavailable / timeout ── */}
        {(status === 'unavailable' || status === 'timeout') && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-amber-400">
              <span className="text-lg">{status === 'timeout' ? '⏱️' : '📡'}</span>
              <div>
                <p className="text-sm font-medium">{errorMsg}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {status === 'timeout'
                    ? 'Move to an open area with a clear view of the sky and try again.'
                    : 'Make sure GPS is enabled on your device and try again.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={capture}
              className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {formError && <p className="text-red-400 text-xs mt-1">{formError}</p>}
    </div>
  )
}
