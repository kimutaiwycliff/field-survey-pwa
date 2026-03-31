import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Layout/Navbar'
import { OfflineBanner } from '@/components/Layout/OfflineBanner'
import { MapWrapper } from '@/components/Map/MapWrapper'
import { Observation } from '@/lib/utils/observation-types'

export default async function MapPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('observations')
    .select('*')
    .order('created_at', { ascending: false })

  const observations = (data ?? []) as Observation[]

  return (
    <div className="flex flex-col h-screen">
      <OfflineBanner />

      <header
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-7 h-7 rounded flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
            <path d="M1 3l4-1.5 5 1.5 5-1.5V13l-5 1.5-5-1.5-4 1.5V3z" strokeLinejoin="round"/>
            <path d="M6 1.5v12M11 3v10"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display font-bold text-base uppercase tracking-wider leading-none"
              style={{ color: 'var(--text-primary)' }}>Survey Map</h1>
          <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {observations.length} observations
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden pb-14">
        <MapWrapper initialObservations={observations} enableFilters />
      </div>

      <Navbar />
    </div>
  )
}
