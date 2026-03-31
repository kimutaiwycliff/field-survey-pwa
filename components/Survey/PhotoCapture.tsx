'use client'

import { useRef, useState } from 'react'

interface Props {
  onCapture: (file: File | null) => void
}

export function PhotoCapture({ onCapture }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (file) {
      setFileName(file.name)
      const url = URL.createObjectURL(file)
      setPreview(url)
      onCapture(file)
    } else {
      setPreview(null)
      setFileName(null)
      onCapture(null)
    }
  }

  function handleRemove() {
    setPreview(null)
    setFileName(null)
    onCapture(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="block text-slate-300 text-sm font-medium mb-2">
        Photo <span className="text-slate-500">(optional)</span>
      </label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-slate-700"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-700"
          >
            ✕
          </button>
          <p className="text-slate-500 text-xs mt-1 truncate">{fileName}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full min-h-[100px] border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm">Take photo or choose file</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
