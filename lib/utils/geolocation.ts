export interface GeoPosition {
  lat: number
  lng: number
  accuracy: number
}

export function getCurrentPosition(options?: PositionOptions): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      reject,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0, ...options }
    )
  })
}
