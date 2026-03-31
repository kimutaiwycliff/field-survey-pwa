'use client'

import { useRef, useState } from 'react'

export function PhotoCapture({ onCapture }: { onCapture: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (file) {
      setFileName(file.name)
      setPreview(URL.createObjectURL(file))
      onCapture(file)
    } else {
      setPreview(null); setFileName(null); onCapture(null)
    }
  }

  function remove() {
    setPreview(null); setFileName(null); onCapture(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label-caps">Photo</span>
        <span className="label-caps" style={{ color: 'var(--text-muted)' }}>Optional</span>
      </div>

      {preview ? (
        <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-mid)' }}>
          <img src={preview} alt="Preview" className="w-full h-44 object-cover" />
          <button
            type="button"
            onClick={remove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--danger)', color: '#fff' }}
          >✕</button>
          <div
            className="px-3 py-1.5 text-xs font-mono truncate"
            style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
          >
            {fileName}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-lg py-8 transition-colors"
          style={{ border: '2px dashed var(--border-mid)', background: 'var(--bg-raised)', color: 'var(--text-muted)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span className="font-display font-semibold text-sm uppercase tracking-wider">Tap to capture photo</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Uses rear camera on mobile</span>
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleChange} className="hidden" />
    </div>
  )
}
