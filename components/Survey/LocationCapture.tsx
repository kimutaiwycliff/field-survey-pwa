'use client'

import { useState, useEffect } from 'react'
import { getCurrentPosition } from '@/lib/utils/geolocation'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

type Status = 'prompt' | 'loading' | 'success' | 'denied' | 'unavailable' | 'timeout'

function parseError(e: unknown): { status: Exclude<Status, 'prompt' | 'loading' | 'success'>; msg: string } {
  if (e instanceof GeolocationPositionError) {
    if (e.code === GeolocationPositionError.PERMISSION_DENIED)   return { status: 'denied',      msg: 'Location access blocked.' }
    if (e.code === GeolocationPositionError.POSITION_UNAVAILABLE) return { status: 'unavailable', msg: 'Signal unavailable — move outdoors.' }
    if (e.code === GeolocationPositionError.TIMEOUT)              return { status: 'timeout',     msg: 'Request timed out — check GPS signal.' }
  }
  return { status: 'unavailable', msg: 'Could not get location.' }
}

export function LocationCapture({ onCapture, error: formError }: { onCapture: (lat: number, lng: number) => void; error?: string }) {
  const [status,   setStatus]   = useState<Status>('prompt')
  const [position, setPosition] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const [errMsg,   setErrMsg]   = useState<string | null>(null)

  async function capture() {
    setStatus('loading'); setErrMsg(null)
    try {
      const pos = await getCurrentPosition()
      setPosition(pos); setStatus('success'); onCapture(pos.lat, pos.lng)
    } catch (e) {
      const { status, msg } = parseError(e)
      setStatus(status); setErrMsg(msg)
    }
  }

  useEffect(() => {
    if (!navigator.permissions) { capture(); return }
    navigator.permissions.query({ name: 'geolocation' }).then(r => {
      if      (r.state === 'granted') capture()
      else if (r.state === 'denied')  { setStatus('denied'); setErrMsg('Location access blocked.') }
    })
  }, [])

  return (
    <div>
      <span className="label-caps block mb-2">GPS Location</span>
      <div className="rounded-lg p-4 space-y-3" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-mid)' }}>

        {status === 'prompt' && (
          <>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                  <circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Allow location access</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Your browser will ask for permission — tap <strong style={{ color: 'var(--text-primary)' }}>Allow</strong> to record GPS coordinates.
                </p>
              </div>
            </div>
            <button type="button" onClick={capture} className="btn btn-primary w-full font-display font-bold text-xs uppercase tracking-widest">
              Enable GPS &amp; Capture
            </button>
          </>
        )}

        {status === 'loading' && (
          <div className="flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Acquiring signal…</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tap <strong>Allow</strong> in your browser if prompted</p>
            </div>
          </div>
        )}

        {status === 'success' && position && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
              <div>
                <p className="font-mono text-sm font-medium" style={{ color: 'var(--success)' }}>
                  {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>±{Math.round(position.accuracy)}m accuracy</p>
              </div>
            </div>
            <button type="button" onClick={capture} className="text-xs px-2 py-1 rounded transition-colors" style={{ color: 'var(--accent)', background: 'var(--accent-dim)' }}>
              Recapture
            </button>
          </div>
        )}

        {status === 'denied' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--danger)' }}>🚫</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Location blocked</p>
                <ol className="text-xs mt-1.5 space-y-1 list-decimal list-inside" style={{ color: 'var(--text-secondary)' }}>
                  <li>Tap the <strong style={{ color: 'var(--text-primary)' }}>lock icon</strong> in your address bar</li>
                  <li>Set <strong style={{ color: 'var(--text-primary)' }}>Location</strong> to Allow</li>
                  <li>Reload and return to this form</li>
                </ol>
              </div>
            </div>
            <button type="button" onClick={capture} className="btn btn-ghost w-full text-xs">Try again</button>
          </div>
        )}

        {(status === 'unavailable' || status === 'timeout') && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span>{status === 'timeout' ? '⏱️' : '📡'}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{errMsg}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {status === 'timeout' ? 'Move to an open area with clear sky.' : 'Ensure GPS is enabled on your device.'}
                </p>
              </div>
            </div>
            <button type="button" onClick={capture} className="btn btn-primary w-full text-xs font-display font-bold uppercase tracking-widest">Try again</button>
          </div>
        )}
      </div>
      {formError && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{formError}</p>}
    </div>
  )
}
