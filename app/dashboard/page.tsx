import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Layout/Navbar'
import { OfflineBanner } from '@/components/Layout/OfflineBanner'
import { MapWrapper } from '@/components/Map/MapWrapper'
import { Observation, OBSERVATION_TYPES } from '@/lib/utils/observation-types'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('observations')
    .select('*')
    .order('created_at', { ascending: false })

  const observations = (data ?? []) as Observation[]
  const contributors = new Set(observations.map(o => o.user_id)).size

  // Type breakdown
  const typeCounts = Object.fromEntries(
    Object.keys(OBSERVATION_TYPES).map(k => [k, observations.filter(o => o.type === k).length])
  )

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-base)' }}>
      <OfflineBanner />

      <header
        className="shrink-0 px-4 py-3"
        style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Title row */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-7 h-7 rounded flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
              <circle cx="5" cy="6" r="2.5"/><circle cx="11" cy="6" r="2.5"/>
              <path d="M1 13c0-2 1.5-3.5 4-3.5M15 13c0-2-1.5-3.5-4-3.5M6 9.5c1 0 2.5.5 2.5 1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-base uppercase tracking-wider leading-none"
                style={{ color: 'var(--text-primary)' }}>Team Dashboard</h1>
            <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Live field overview</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/api/export?format=csv"
              className="font-display font-bold text-xs uppercase tracking-wider px-2.5 py-1.5 rounded transition-colors"
              style={{ background: 'var(--bg-elevated)', color: 'var(--accent)', border: '1px solid var(--border-mid)' }}
            >
              CSV
            </Link>
            <Link
              href="/api/export?format=geojson"
              className="font-display font-bold text-xs uppercase tracking-wider px-2.5 py-1.5 rounded transition-colors"
              style={{ background: 'var(--bg-elevated)', color: 'var(--info)', border: '1px solid var(--border-mid)' }}
            >
              GeoJSON
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex gap-3 overflow-x-auto pb-0.5">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md shrink-0"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <span className="font-mono font-bold text-sm" style={{ color: 'var(--accent)' }}>{observations.length}</span>
            <span className="label-caps">Total</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md shrink-0"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <span className="font-mono font-bold text-sm" style={{ color: 'var(--info)' }}>{contributors}</span>
            <span className="label-caps">Contributors</span>
          </div>
          {Object.entries(typeCounts)
            .filter(([, count]) => count > 0)
            .map(([key, count]) => {
              const cfg = OBSERVATION_TYPES[key as keyof typeof OBSERVATION_TYPES]
              return (
                <div
                  key={key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md shrink-0"
                  style={{ background: cfg.color + '14', border: `1px solid ${cfg.color}33` }}
                >
                  <span className="text-xs">{cfg.icon}</span>
                  <span className="font-mono font-bold text-sm" style={{ color: cfg.color }}>{count}</span>
                  <span className="label-caps" style={{ color: cfg.color, opacity: 0.8 }}>{cfg.label}</span>
                </div>
              )
          })}
        </div>
      </header>

      <div className="flex-1 overflow-hidden pb-14">
        <MapWrapper initialObservations={observations} enableRealtime enableFilters />
      </div>

      <Navbar />
    </div>
  )
}
