'use client'

import dynamic from 'next/dynamic'
import { Observation } from '@/lib/utils/observation-types'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

const SurveyMap = dynamic(() => import('./SurveyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-800">
      <LoadingSpinner size="lg" />
    </div>
  ),
})

interface Props {
  initialObservations: Observation[]
  enableRealtime?: boolean
  enableFilters?: boolean
}

export function MapWrapper(props: Props) {
  return <SurveyMap {...props} />
}
