'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import { ObservationMarker } from './ObservationMarker'
import { Observation, ObservationType, OBSERVATION_TYPES } from '@/lib/utils/observation-types'
import { useRealtime } from '@/hooks/useRealtime'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface Props {
  initialObservations: Observation[]
  enableRealtime?: boolean
  enableFilters?: boolean
}

export default function SurveyMap({ initialObservations, enableRealtime = false, enableFilters = false }: Props) {
  const [observations, setObservations] = useState<Observation[]>(initialObservations)
  const [filterType, setFilterType] = useState<ObservationType | 'all'>('all')
  const [filterSeverity, setFilterSeverity] = useState<number>(0)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    setMapReady(true)
  }, [])

  const handleInsert = useCallback((obs: Observation) => {
    setObservations((prev) => [obs, ...prev])
  }, [])

  useRealtime(enableRealtime ? handleInsert : () => {})

  const filtered = observations.filter((o) => {
    if (filterType !== 'all' && o.type !== filterType) return false
    if (filterSeverity > 0 && o.severity !== filterSeverity) return false
    return true
  })

  if (!mapReady) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-800">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {enableFilters && (
        <div className="bg-slate-900 border-b border-slate-700 p-2 flex gap-2 overflow-x-auto shrink-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ObservationType | 'all')}
            className="bg-slate-800 text-white text-xs rounded px-2 py-1 border border-slate-600 min-h-[36px]"
          >
            <option value="all">All Types</option>
            {Object.entries(OBSERVATION_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.icon} {val.label}</option>
            ))}
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(Number(e.target.value))}
            className="bg-slate-800 text-white text-xs rounded px-2 py-1 border border-slate-600 min-h-[36px]"
          >
            <option value={0}>Any Severity</option>
            {[1,2,3,4,5].map((s) => (
              <option key={s} value={s}>{'★'.repeat(s)} ({s})</option>
            ))}
          </select>

          <span className="text-slate-400 text-xs self-center whitespace-nowrap ml-auto pr-1">
            {filtered.length} point{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="flex-1 relative">
        <MapContainer
          center={[0, 20]}
          zoom={3}
          className="h-full w-full"
          style={{ height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup chunkedLoading>
            {filtered.map((obs) => (
              <ObservationMarker key={obs.id} observation={obs} />
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  )
}
