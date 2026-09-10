'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import type { Marker } from './GoogleMap'
import 'leaflet/dist/leaflet.css'

export default function OpenStreetMap({ markers, className }: { markers: Marker[]; className: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let map: LeafletMap | undefined
    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return
      map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([36.2, 138.3], 5)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      const positions: [number, number][] = []
      for (const marker of markers) {
        if (marker.lat == null || marker.lng == null) continue
        const position: [number, number] = [Number(marker.lat), Number(marker.lng)]
        if (!position.every(Number.isFinite)) continue
        positions.push(position)
        const popup = document.createElement('div')
        const name = document.createElement('strong')
        name.textContent = marker.name
        const sub = document.createElement('p')
        sub.textContent = marker.sub
        const link = document.createElement('a')
        link.href = `/${marker.kind === 'hotel' ? 'hotels' : 'spots'}/${encodeURIComponent(marker.id)}`
        link.textContent = '詳細を見る →'
        popup.append(name, sub, link)
        L.circleMarker(position, {
          radius: 8, color: '#fff', weight: 2,
          fillColor: marker.kind === 'hotel' ? '#1a1a1a' : '#b87333', fillOpacity: 1,
        }).addTo(map).bindPopup(popup)
      }
      if (positions.length > 0) map.fitBounds(positions, { padding: [40, 40], maxZoom: 14 })
    }).catch(() => {
      if (!cancelled) setFailed(true)
    })
    return () => { cancelled = true; map?.remove() }
  }, [markers])

  return (
    <div className={`relative isolate ${className}`}>
      <div ref={containerRef} className="h-full w-full" aria-label="お店とホテルの地図" />
      {failed && <p role="alert" className="absolute inset-0 flex items-center justify-center bg-neutral-50 text-sm text-neutral-500">地図を読み込めませんでした。ページを再読み込みしてください。</p>}
    </div>
  )
}
