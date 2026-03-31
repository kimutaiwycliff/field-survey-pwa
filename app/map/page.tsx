import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Layout/Navbar'
import { OfflineBanner } from '@/components/Layout/OfflineBanner'
import { Observation } from '@/lib/utils/observation-types'
import { MapWrapper } from '@/components/Map/MapWrapper'

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
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center gap-2 shrink-0">
        <span className="text-xl">🗺️</span>
        <h1 className="text-white font-semibold">Survey Map</h1>
        <span className="text-slate-500 text-sm ml-auto">{observations.length} observations</span>
      </header>
      <div className="flex-1 overflow-hidden pb-14">
        <MapWrapper initialObservations={observations} enableFilters />
      </div>
      <Navbar />
    </div>
  )
}
