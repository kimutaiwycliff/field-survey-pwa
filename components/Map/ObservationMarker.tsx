'use client'

import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { OBSERVATION_TYPES, Observation } from '@/lib/utils/observation-types'
import { ObservationPopup } from './ObservationPopup'

function createColoredIcon(color: string, icon: string) {
  return L.divIcon({
    html: `<div style="
      background-color:${color};
      width:32px;height:32px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:14px;display:block;text-align:center;line-height:28px;">${icon}</span></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  })
}

interface Props {
  observation: Observation
}

export function ObservationMarker({ observation }: Props) {
  const typeConfig = OBSERVATION_TYPES[observation.type] ?? OBSERVATION_TYPES.other
  const icon = createColoredIcon(typeConfig.color, typeConfig.icon)

  return (
    <Marker position={[observation.lat, observation.lng]} icon={icon}>
      <ObservationPopup observation={observation} />
    </Marker>
  )
}
