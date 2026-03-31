export const OBSERVATION_TYPES = {
  pothole:  { label: 'Pothole',      color: '#ef4444', icon: '🕳️' },
  tree:     { label: 'Tree Health',  color: '#22c55e', icon: '🌳' },
  waste:    { label: 'Illegal Dump', color: '#f97316', icon: '🗑️' },
  flooding: { label: 'Flooding',     color: '#3b82f6', icon: '💧' },
  other:    { label: 'Other',        color: '#8b5cf6', icon: '📍' },
} as const

export type ObservationType = keyof typeof OBSERVATION_TYPES

export interface Observation {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  lat: number
  lng: number
  type: ObservationType
  description: string | null
  severity: number | null
  photo_url: string | null
  synced: boolean
}
