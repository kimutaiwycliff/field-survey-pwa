'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onDismiss?: () => void
}

export function Toast({ message, type = 'info', duration = 3500, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDismiss?.() }, duration)
    return () => clearTimeout(t)
  }, [duration, onDismiss])

  if (!visible) return null

  const vars = {
    success: { bg: 'var(--success)',     fg: '#000' },
    error:   { bg: 'var(--danger)',      fg: '#fff' },
    info:    { bg: 'var(--bg-elevated)', fg: 'var(--text-primary)' },
  }[type]

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-xl max-w-xs w-auto text-center"
      style={{ background: vars.bg, color: vars.fg, border: type === 'info' ? '1px solid var(--border-mid)' : 'none', boxShadow: 'var(--shadow)' }}
    >
      {message}
    </div>
  )
}
