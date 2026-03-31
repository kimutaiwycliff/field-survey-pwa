import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Layout/Navbar'
import { OfflineBanner } from '@/components/Layout/OfflineBanner'
import { Observation, OBSERVATION_TYPES } from '@/lib/utils/observation-types'
import Link from 'next/link'
import Image from 'next/image'

export default async function MySurveysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('observations')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const observations = (data ?? []) as Observation[]

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <OfflineBanner />

      <header
        className="flex items-center gap-3 px-4 py-3 shrink-0 sticky top-0 z-10"
        style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-7 h-7 rounded flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
            <path d="M8 1a4 4 0 0 1 4 4c0 3.5-4 8-4 8S4 8.5 4 5a4 4 0 0 1 4-4z"/>
            <circle cx="8" cy="5" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-base uppercase tracking-wider leading-none"
              style={{ color: 'var(--text-primary)' }}>My Observations</h1>
          <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {observations.length} submission{observations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/survey"
          className="btn btn-primary font-display font-bold text-xs uppercase tracking-wider px-4"
          style={{ minHeight: '34px' }}
        >
          + New
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {observations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}
                   style={{ color: 'var(--text-muted)' }}>
                <path d="M12 2a7 7 0 0 1 7 7c0 5.5-7 13-7 13S5 14.5 5 9a7 7 0 0 1 7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </div>
            <h3 className="font-display font-bold text-lg uppercase tracking-wider mb-1"
                style={{ color: 'var(--text-primary)' }}>No observations yet</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              Head into the field and submit your first report
            </p>
            <Link href="/survey" className="btn btn-primary font-display font-bold text-sm uppercase tracking-widest">
              Start Surveying →
            </Link>
          </div>
        ) : (
          <ul>
            {observations.map((obs, i) => {
              const cfg = OBSERVATION_TYPES[obs.type] ?? OBSERVATION_TYPES.other
              const date = new Date(obs.created_at).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric',
              })
              return (
                <li
                  key={obs.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--bg-raised)',
                  }}
                >
                  {/* Thumbnail */}
                  {obs.photo_url ? (
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid var(--border-mid)' }}>
                      <Image src={obs.photo_url} alt="" width={56} height={56} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center text-xl"
                      style={{ background: cfg.color + '18', border: `1.5px solid ${cfg.color}44` }}
                    >
                      {cfg.icon}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span
                        className="badge"
                        style={{ background: cfg.color + '18', color: cfg.color, border: `1px solid ${cfg.color}44` }}
                      >
                        {cfg.label}
                      </span>
                      {!obs.synced && (
                        <span className="badge" style={{ background: 'var(--warning)', color: '#000' }}>Pending</span>
                      )}
                    </div>

                    <p className="text-sm leading-snug truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>
                      {obs.description ?? <span style={{ color: 'var(--text-muted)' }}>No description</span>}
                    </p>

                    <div className="flex items-center gap-3 mt-1">
                      {obs.severity && (
                        <span className="text-xs">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} style={{ color: i < obs.severity! ? '#f59e0b' : 'var(--border-mid)' }}>★</span>
                          ))}
                        </span>
                      )}
                      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{date}</span>
                    </div>

                    <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {obs.lat.toFixed(4)}, {obs.lng.toFixed(4)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      <Navbar />
    </div>
  )
}
