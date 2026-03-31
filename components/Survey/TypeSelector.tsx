'use client'

import { OBSERVATION_TYPES, ObservationType } from '@/lib/utils/observation-types'

interface Props {
  value: ObservationType
  onChange: (type: ObservationType) => void
  error?: string
}

export function TypeSelector({ value, onChange, error }: Props) {
  return (
    <div>
      <span className="label-caps block mb-2">Observation Type</span>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(OBSERVATION_TYPES).map(([key, cfg]) => {
          const active = value === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key as ObservationType)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all min-h-[72px]"
              style={{
                background:  active ? cfg.color + '18' : 'var(--bg-raised)',
                border:      `1.5px solid ${active ? cfg.color : 'var(--border-mid)'}`,
                color:       active ? cfg.color : 'var(--text-secondary)',
                boxShadow:   active ? `0 0 0 1px ${cfg.color}33` : 'none',
              }}
            >
              <span className="text-2xl leading-none">{cfg.icon}</span>
              <span
                className="font-display font-semibold uppercase text-center leading-tight"
                style={{ fontSize: '0.62rem', letterSpacing: '0.06em' }}
              >
                {cfg.label}
              </span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}
