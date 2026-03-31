import { Observation } from './observation-types'

export function toCSV(observations: Observation[]): string {
  const headers = ['id', 'created_at', 'lat', 'lng', 'type', 'description', 'severity', 'photo_url', 'user_id']
  const rows = observations.map((o) =>
    headers.map((h) => {
      const val = (o as unknown as Record<string, unknown>)[h]
      if (val === null || val === undefined) return ''
      const str = String(val)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export function toGeoJSON(observations: Observation[]) {
  return {
    type: 'FeatureCollection',
    features: observations.map((o) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [o.lng, o.lat],
      },
      properties: {
        id: o.id,
        user_id: o.user_id,
        created_at: o.created_at,
        type: o.type,
        description: o.description,
        severity: o.severity,
        photo_url: o.photo_url,
      },
    })),
  }
}
