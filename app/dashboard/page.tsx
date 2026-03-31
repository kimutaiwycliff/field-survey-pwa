import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Layout/Navbar'
import { OfflineBanner } from '@/components/Layout/OfflineBanner'
import { Observation } from '@/lib/utils/observation-types'
import { MapWrapper } from '@/components/Map/MapWrapper'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('observations')
    .select('*')
    .order('created_at', { ascending: false })

  const observations = (data ?? []) as Observation[]

  const uniqueSubmitters = new Set(observations.map((o) => o.user_id)).size

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <OfflineBanner />
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">👥</span>
          <h1 className="text-white font-semibold">Team Dashboard</h1>
        </div>
        <div className="flex gap-4 text-xs text-slate-400">
          <span>📍 {observations.length} total</span>
          <span>👤 {uniqueSubmitters} contributors</span>
          <Link
            href="/api/export?format=csv"
            className="text-blue-400 hover:underline ml-auto"
          >
            ⬇️ Export CSV
          </Link>
          <Link
            href="/api/export?format=geojson"
            className="text-blue-400 hover:underline"
          >
            ⬇️ GeoJSON
          </Link>
        </div>
      </header>
      <div className="flex-1 overflow-hidden pb-14">
        <MapWrapper
          initialObservations={observations}
          enableRealtime
          enableFilters
        />
      </div>
      <Navbar />
    </div>
  )
}
