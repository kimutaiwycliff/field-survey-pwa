'use client'

import { Popup } from 'react-leaflet'
import { Observation, OBSERVATION_TYPES } from '@/lib/utils/observation-types'

export function ObservationPopup({ observation }: { observation: Observation }) {
  const cfg  = OBSERVATION_TYPES[observation.type] ?? OBSERVATION_TYPES.other
  const date = new Date(observation.created_at).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <Popup minWidth={230} maxWidth={280}>
      <div style={{ fontFamily: 'var(--font-dm-sans, system-ui)', color: 'var(--text-primary)' }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
            style={{ background: cfg.color + '22', color: cfg.color, border: `1px solid ${cfg.color}55` }}
          >
            {cfg.icon} {cfg.label}
          </span>
          {!observation.synced && (
            <span className="text-xs" style={{ color: 'var(--warning)' }}>⚠ Pending</span>
          )}
        </div>

        {/* Photo */}
        {observation.photo_url && (
          <img
            src={observation.photo_url}
            alt="Observation"
            className="w-full h-28 object-cover rounded-md mb-2"
            style={{ border: '1px solid var(--border)' }}
          />
        )}

        {/* Description */}
        {observation.description && (
          <p className="text-sm mb-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
            {observation.description}
          </p>
        )}

        {/* Severity */}
        {observation.severity && (
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="text-sm" style={{ color: i < observation.severity! ? '#f59e0b' : 'var(--border-mid)' }}>★</span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div
          className="space-y-0.5 pt-2 text-xs font-mono"
          style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}
        >
          <div>{observation.lat.toFixed(5)}, {observation.lng.toFixed(5)}</div>
          <div>{date}</div>
        </div>
      </div>
    </Popup>
  )
}
