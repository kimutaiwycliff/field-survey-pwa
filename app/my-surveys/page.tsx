import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Layout/Navbar'
import { OfflineBanner } from '@/components/Layout/OfflineBanner'
import { Observation, OBSERVATION_TYPES } from '@/lib/utils/observation-types'
import Link from 'next/link'
import Image from 'next/image'

function SeverityStars({ value }: { value: number | null }) {
  if (!value) return <span className="text-slate-500 text-xs">No rating</span>
  return (
    <span className="text-xs">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < value ? 'text-yellow-400' : 'text-slate-600'}>★</span>
      ))}
    </span>
  )
}

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
    <div className="flex flex-col min-h-screen bg-slate-900">
      <OfflineBanner />
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center gap-2 sticky top-0 z-10">
        <span className="text-xl">📌</span>
        <h1 className="text-white font-semibold">My Observations</h1>
        <span className="text-slate-500 text-sm ml-auto">{observations.length} total</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {observations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-sm">No observations yet</p>
            <Link href="/survey" className="mt-3 text-blue-400 text-sm hover:underline">
              Submit your first observation →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {observations.map((obs) => {
              const typeConfig = OBSERVATION_TYPES[obs.type] ?? OBSERVATION_TYPES.other
              return (
                <li key={obs.id} className="flex items-start gap-3 p-4 hover:bg-slate-800/50 transition-colors">
                  {obs.photo_url ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                      <Image
                        src={obs.photo_url}
                        alt="Observation photo"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-16 h-16 rounded-lg shrink-0 flex items-center justify-center text-2xl"
                      style={{ backgroundColor: typeConfig.color + '22', border: `2px solid ${typeConfig.color}44` }}
                    >
                      {typeConfig.icon}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: typeConfig.color + '33', color: typeConfig.color }}
                      >
                        {typeConfig.label}
                      </span>
                      {!obs.synced && (
                        <span className="text-xs text-amber-500">⚠️ Pending</span>
                      )}
                    </div>
                    <p className="text-white text-sm truncate">{obs.description ?? 'No description'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <SeverityStars value={obs.severity} />
                      <span className="text-slate-500 text-xs">
                        {new Date(obs.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5">
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
