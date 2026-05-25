'use client'

import { useEffect, useRef, useState } from 'react'

export type Marker = {
  id: string
  name: string
  lat: number | null
  lng: number | null
  kind: 'spot' | 'hotel'
  sub: string
}

declare global {
  interface Window {
    google?: typeof google
    __googleMapsCallback?: () => void
    __googleMapsLoading?: boolean
  }
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve()
      return
    }
    if (window.__googleMapsLoading) {
      const check = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(check)
          resolve()
        }
      }, 100)
      return
    }
    window.__googleMapsLoading = true
    const callbackName = '__googleMapsCallback'
    window[callbackName] = () => {
      resolve()
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&v=weekly`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

export default function GoogleMap({ markers }: { markers: Marker[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey) {
      setError(
        'Google Maps APIキーが設定されていません。.env.local に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を追加してください。'
      )
      return
    }

    let cancelled = false

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return

        const first = markers.find((m) => m.lat != null && m.lng != null)
        const center = first
          ? { lat: Number(first.lat), lng: Number(first.lng) }
          : { lat: 35.6812, lng: 139.7671 }

        const map = new window.google.maps.Map(containerRef.current, {
          center,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
            { featureType: 'water', stylers: [{ color: '#d6eaf3' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          ],
        })

        const bounds = new window.google.maps.LatLngBounds()
        const infoWindow = new window.google.maps.InfoWindow()

        markers
          .filter((m) => m.lat != null && m.lng != null)
          .forEach((m) => {
            const position = { lat: Number(m.lat), lng: Number(m.lng) }
            bounds.extend(position)
            const isHotel = m.kind === 'hotel'
            const marker = new window.google!.maps.Marker({
              position,
              map,
              title: m.name,
              icon: isHotel
                ? {
                    path: window.google!.maps.SymbolPath.CIRCLE,
                    scale: 9,
                    fillColor: '#1a1a1a',
                    fillOpacity: 1,
                    strokeColor: '#fff',
                    strokeWeight: 2,
                  }
                : {
                    path: window.google!.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#b87333',
                    fillOpacity: 1,
                    strokeColor: '#fff',
                    strokeWeight: 2,
                  },
            })
            const detailPath = m.kind === 'hotel' ? `/hotels/${m.id}` : `/spots/${m.id}`
            marker.addListener('click', () => {
              infoWindow.setContent(
                `<div style="font-family:serif;padding:4px;">
                  <div style="font-size:11px;letter-spacing:0.2em;color:#888;text-transform:uppercase">${
                    isHotel ? 'HOTEL' : 'SPOT'
                  }${m.sub ? ' · ' + m.sub : ''}</div>
                  <div style="font-size:18px;font-style:italic;margin-top:4px">${m.name}</div>
                  <a href="${detailPath}" style="display:inline-block;margin-top:8px;font-size:10px;letter-spacing:0.2em;text-decoration:underline">VIEW</a>
                </div>`
              )
              infoWindow.open({ anchor: marker, map })
            })
          })

        if (bounds.toJSON().east !== bounds.toJSON().west) {
          map.fitBounds(bounds, 80)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [apiKey, markers])

  if (error) {
    return (
      <div className="w-full h-[70vh] bg-neutral-50 flex items-center justify-center p-6">
        <p className="text-sm text-neutral-500 text-center max-w-md">{error}</p>
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-[calc(100vh-6rem)]" />
}
