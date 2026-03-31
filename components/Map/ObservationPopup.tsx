'use client'

import { Popup } from 'react-leaflet'
import { Observation, OBSERVATION_TYPES } from '@/lib/utils/observation-types'

function Stars({ value }: { value: number | null }) {
  if (!value) return <span className="text-slate-400 text-xs">No rating</span>
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < value ? 'text-yellow-400' : 'text-slate-300'}>★</span>
      ))}
    </span>
  )
}

interface Props {
  observation: Observation
}

export function ObservationPopup({ observation }: Props) {
  const typeConfig = OBSERVATION_TYPES[observation.type] ?? OBSERVATION_TYPES.other
  const date = new Date(observation.created_at).toLocaleString()

  return (
    <Popup minWidth={220} maxWidth={280}>
      <div className="text-sm font-sans">
        <div className="font-bold text-base mb-1">
          {typeConfig.icon} {typeConfig.label}
        </div>

        {observation.photo_url && (
          <img
            src={observation.photo_url}
            alt="Observation photo"
            className="w-full h-32 object-cover rounded mb-2"
          />
        )}

        {observation.description && (
          <p className="text-slate-700 mb-1">{observation.description}</p>
        )}

        <div className="mb-1">
          <Stars value={observation.severity} />
        </div>

        <div className="text-xs text-slate-500">
          <div>📍 {observation.lat.toFixed(5)}, {observation.lng.toFixed(5)}</div>
          <div>🕐 {date}</div>
          {!observation.synced && (
            <div className="text-amber-600 font-medium mt-1">⚠️ Pending sync</div>
          )}
        </div>
      </div>
    </Popup>
  )
}
