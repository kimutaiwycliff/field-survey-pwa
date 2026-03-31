'use client'

const LABELS = ['', 'Low', 'Minor', 'Moderate', 'High', 'Critical']

interface Props {
  value: number
  onChange: (v: number) => void
  error?: string
}

export function SeverityRating({ value, onChange, error }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label-caps">Severity</span>
        {value > 0 && (
          <span
            className="font-display font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
          >
            {LABELS[value]}
          </span>
        )}
      </div>
      <div
        className="flex items-center gap-1 p-3 rounded-lg"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-mid)' }}
      >
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="flex-1 flex items-center justify-center text-2xl transition-transform hover:scale-110 active:scale-95 min-h-[44px]"
          >
            <span style={{ color: star <= value ? '#f59e0b' : 'var(--border-mid)', filter: star <= value ? 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' : 'none' }}>
              ★
            </span>
          </button>
        ))}
      </div>
      {error && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}
