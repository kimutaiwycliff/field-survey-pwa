'use client'

interface Props {
  value: number
  onChange: (value: number) => void
  error?: string
}

export function SeverityRating({ value, onChange, error }: Props) {
  return (
    <div>
      <label className="block text-slate-300 text-sm font-medium mb-2">
        Severity Rating <span className="text-slate-500">({value}/5)</span>
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="text-3xl transition-transform hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <span className={star <= value ? 'text-yellow-400' : 'text-slate-600'}>★</span>
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
