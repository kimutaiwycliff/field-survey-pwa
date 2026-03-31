'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else        { router.push('/map'); router.refresh() }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Brand */}
      <div className="mb-10 text-center">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 2a7 7 0 0 1 7 7c0 5.5-7 13-7 13S5 14.5 5 9a7 7 0 0 1 7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <h1
          className="font-display font-bold text-4xl tracking-wide uppercase"
          style={{ color: 'var(--text-primary)' }}
        >
          Field Survey
        </h1>
        <p className="label-caps mt-1">GIS Field Data Collection</p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-xl p-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-mid)' }}
      >
        <h2
          className="font-display font-semibold text-xl uppercase tracking-wider mb-5"
          style={{ color: 'var(--text-primary)' }}
        >
          Sign In
        </h2>

        {error && (
          <div
            className="flex items-start gap-2 rounded-lg px-3 py-2.5 mb-4 text-sm"
            style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
          >
            <span className="mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-caps block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="field-input"
              placeholder="operator@agency.gov"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label-caps block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="field-input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full font-display font-bold text-sm uppercase tracking-widest mt-2"
          >
            {loading ? 'Authenticating…' : 'Sign In →'}
          </button>
        </form>
      </div>

      <p className="mt-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        No account?{' '}
        <Link href="/signup" style={{ color: 'var(--accent)' }} className="font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
