import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toCSV, toGeoJSON } from '@/lib/utils/export'
import { Observation } from '@/lib/utils/observation-types'

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get('format') ?? 'csv'
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('observations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const observations = (data ?? []) as Observation[]

  if (format === 'geojson') {
    const geojson = toGeoJSON(observations)
    return new NextResponse(JSON.stringify(geojson, null, 2), {
      headers: {
        'Content-Type': 'application/geo+json',
        'Content-Disposition': `attachment; filename="observations-${Date.now()}.geojson"`,
      },
    })
  }

  const csv = toCSV(observations)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="observations-${Date.now()}.csv"`,
    },
  })
}
