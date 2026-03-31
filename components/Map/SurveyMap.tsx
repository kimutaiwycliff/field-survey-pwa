'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import { ObservationMarker } from './ObservationMarker'
import { Observation, ObservationType, OBSERVATION_TYPES } from '@/lib/utils/observation-types'
import { useRealtime } from '@/hooks/useRealtime'
import { useTheme } from '@/components/Layout/ThemeProvider'

/* ── Basemap catalogue ──────────────────────────────────────────────────── */
export type BasemapKey = 'osm' | 'dark' | 'satellite' | 'topo' | 'voyager'

const BASEMAPS: Record<BasemapKey, { name: string; url: string; attribution: string }> = {
  osm:       { name: 'Street',    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                                     attribution: '© OpenStreetMap' },
  dark:      { name: 'Dark',      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',                                          attribution: '© CartoDB' },
  satellite: { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',           attribution: '© Esri' },
  topo:      { name: 'Topo',      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',                                                       attribution: '© OpenTopoMap' },
  voyager:   { name: 'Voyager',   url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',                               attribution: '© CartoDB' },
}

/* ── Auto-zoom to user location ─────────────────────────────────────────── */
function UserLocationZoom() {
  const map  = useMap()
  const done = useRef(false)

  useEffect(() => {
    if (done.current || !navigator.geolocation) return

    const tryZoom = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (done.current) return
          done.current = true
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { animate: true, duration: 1.5 })
        },
        null,
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      )
    }

    if (!navigator.permissions) { tryZoom(); return }
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') tryZoom()
    })
  }, [map])

  return null
}

/* ── Locate-me button (re-centres map on current position) ──────────────── */
function LocateMeButton() {
  const map = useMap()
  const [locating, setLocating] = useState(false)

  function locate() {
    if (!navigator.geolocation || locating) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { animate: true, duration: 1 })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <button
      onClick={locate}
      title="Go to my location"
      className="absolute bottom-4 right-4 z-[1000] flex items-center justify-center w-10 h-10 rounded-lg shadow-lg transition-all active:scale-95"
      style={{
        background:  'var(--bg-surface)',
        border:      '1px solid var(--border-mid)',
        color:       locating ? 'var(--accent)' : 'var(--text-secondary)',
        boxShadow:   'var(--shadow-sm)',
      }}
    >
      {locating ? (
        <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      ) : (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
          <circle cx="10" cy="10" r="3"/>
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2" strokeLinecap="round"/>
          <circle cx="10" cy="10" r="7" strokeDasharray="3 2"/>
        </svg>
      )}
    </button>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
interface Props {
  initialObservations: Observation[]
  enableRealtime?: boolean
  enableFilters?: boolean
}

export default function SurveyMap({ initialObservations, enableRealtime = false, enableFilters = false }: Props) {
  const { theme } = useTheme()

  const [observations, setObservations] = useState<Observation[]>(initialObservations)
  const [basemap,      setBasemap]      = useState<BasemapKey>(() => theme === 'dark' ? 'dark' : 'osm')
  const [showBasemaps, setShowBasemaps] = useState(false)
  const [filterType,   setFilterType]   = useState<ObservationType | 'all'>('all')
  const [filterSev,    setFilterSev]    = useState(0)

  // Track if user has manually chosen a basemap
  const userPicked = useRef(false)

  // Sync default basemap to theme only if user hasn't manually chosen
  useEffect(() => {
    if (!userPicked.current) {
      setBasemap(theme === 'dark' ? 'dark' : 'osm')
    }
  }, [theme])

  const handleInsert = useCallback((obs: Observation) => {
    setObservations(prev => [obs, ...prev])
  }, [])

  useRealtime(enableRealtime ? handleInsert : () => {})

  const filtered = observations.filter(o => {
    if (filterType !== 'all' && o.type !== filterType) return false
    if (filterSev   > 0      && o.severity !== filterSev) return false
    return true
  })

  const bm = BASEMAPS[basemap]

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      {enableFilters && (
        <div
          className="flex items-center gap-2 px-3 py-2 overflow-x-auto shrink-0"
          style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}
        >
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as ObservationType | 'all')}
            className="text-xs rounded-md px-2 py-1 min-h-[34px] outline-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-mid)' }}
          >
            <option value="all">All Types</option>
            {Object.entries(OBSERVATION_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>

          <select
            value={filterSev}
            onChange={e => setFilterSev(Number(e.target.value))}
            className="text-xs rounded-md px-2 py-1 min-h-[34px] outline-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-mid)' }}
          >
            <option value={0}>Any Severity</option>
            {[1,2,3,4,5].map(s => <option key={s} value={s}>{'★'.repeat(s)} ({s})</option>)}
          </select>

          <span
            className="ml-auto font-mono text-xs whitespace-nowrap shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            {filtered.length} pts
          </span>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[0, 20]}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer key={basemap} url={bm.url} attribution={bm.attribution} />
          <UserLocationZoom />
          <LocateMeButton />

          <MarkerClusterGroup chunkedLoading>
            {filtered.map(obs => <ObservationMarker key={obs.id} observation={obs} />)}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Basemap selector toggle */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <button
            onClick={() => setShowBasemaps(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-md transition-all"
            style={{
              background: showBasemaps ? 'var(--accent)' : 'var(--bg-surface)',
              color:      showBasemaps ? '#000' : 'var(--text-primary)',
              border:     '1px solid var(--border-mid)',
              boxShadow:  'var(--shadow-sm)',
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={1.5}>
              <path d="M1 3l4-1.5 5 1.5 5-1.5V13l-5 1.5-5-1.5-4 1.5V3z" strokeLinejoin="round"/>
              <path d="M6 1.5v12M11 3v10"/>
            </svg>
            {BASEMAPS[basemap].name}
          </button>

          {showBasemaps && (
            <div
              className="absolute bottom-10 left-0 rounded-lg overflow-hidden shadow-xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', minWidth: '120px', boxShadow: 'var(--shadow)' }}
            >
              {(Object.keys(BASEMAPS) as BasemapKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => { userPicked.current = true; setBasemap(key); setShowBasemaps(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                  style={{
                    background: basemap === key ? 'var(--accent-dim)' : 'transparent',
                    color:      basemap === key ? 'var(--accent)' : 'var(--text-primary)',
                    borderLeft: basemap === key ? '2px solid var(--accent)' : '2px solid transparent',
                    fontWeight: basemap === key ? 600 : 400,
                  }}
                >
                  {BASEMAPS[key].name}
                  {basemap === key && <span className="ml-auto text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
