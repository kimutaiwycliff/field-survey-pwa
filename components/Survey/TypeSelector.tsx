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
      <label className="block text-slate-300 text-sm font-medium mb-2">Observation Type</label>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(OBSERVATION_TYPES).map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key as ObservationType)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors min-h-[72px] ${
              value === key
                ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'
            }`}
          >
            <span className="text-2xl">{config.icon}</span>
            <span className="text-xs font-medium text-center leading-tight">{config.label}</span>
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
