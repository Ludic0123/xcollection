'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Spot } from '@/types'

type CoverMode = 'default' | 'exterior' | 'food'

const MODE_LABELS: { value: CoverMode; label: string }[] = [
  { value: 'default', label: 'デフォルト' },
  { value: 'exterior', label: '店構え' },
  { value: 'food', label: '料理' },
]

function coverFor(spot: Spot, mode: CoverMode): string | null {
  if (mode === 'exterior') return spot.cover_image_exterior ?? spot.cover_image_url
  if (mode === 'food') return spot.cover_image_food ?? spot.cover_image_url
  return spot.cover_image_url ?? spot.cover_image_exterior ?? spot.cover_image_food
}

export default function SpotsList({
  spots,
  ratingsBySpot,
  authed,
}: {
  spots: Spot[]
  ratingsBySpot: Record<string, { avg: number; count: number }>
  authed: boolean
}) {
  const [mode, setMode] = useState<CoverMode>('default')

  return (
    <div>
      {/* 表示画像の切り替え */}
      <div className="flex gap-2 mb-4">
        {MODE_LABELS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={`text-[10px] tracking-luxe px-3 py-1.5 border hairline transition-colors ${
              mode === m.value
                ? 'bg-black text-white border-black'
                : 'bg-white text-neutral-500 hover:border-black'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <ul className="divide-y hairline">
        {spots.map((spot) => {
          const r = ratingsBySpot[spot.id]
          const cover = coverFor(spot, mode)
          const lv = spot.price_range_dinner ?? spot.price_range_lunch ?? spot.price_range
          return (
            <li key={spot.id}>
              <Link
                href={`/spots/${spot.id}`}
                className="flex items-start gap-4 md:gap-5 py-4 hover:bg-neutral-50 -mx-2 md:-mx-4 px-2 md:px-4 transition-colors"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-neutral-100 overflow-hidden">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={spot.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif italic text-neutral-300 text-xl">
                        {spot.name.slice(0, 1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-luxe text-neutral-400">
                    {[spot.prefecture, spot.city].filter(Boolean).join(' · ') || '—'}
                  </p>
                  <h3 className="font-serif text-base md:text-lg mt-1 leading-snug truncate">
                    {spot.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 flex-wrap">
                    {authed && r && <span>★ {r.avg.toFixed(1)}</span>}
                    {lv ? (
                      <span className="text-neutral-400">
                        {lv <= 5 ? '¥'.repeat(lv) : '¥¥¥¥¥+'}
                      </span>
                    ) : null}
                    {spot.genre && <span className="text-neutral-400">{spot.genre}</span>}
                    {spot.want_to_visit && (
                      <span className="text-[9px] tracking-luxe bg-neutral-100 px-1.5 py-0.5">
                        WISHLIST
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
