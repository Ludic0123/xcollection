import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import GoogleMap from '@/components/GoogleMap'
import type { Spot, Hotel } from '@/types'

export default async function PlacesMap({ embedded = false }: { embedded?: boolean }) {
  const supabase = await createClient()
  const [{ data: spotData }, { data: hotelData }] = await Promise.all([
    supabase
      .from('spots')
      .select('id, name, lat, lng, category, city')
      .not('lat', 'is', null)
      .not('lng', 'is', null),
    supabase
      .from('hotels')
      .select('id, name, lat, lng, brand, prefecture')
      .not('lat', 'is', null)
      .not('lng', 'is', null),
  ])

  const spots = (spotData ?? []) as Pick<Spot, 'id' | 'name' | 'lat' | 'lng' | 'category' | 'city'>[]
  const hotels = (hotelData ?? []) as Pick<Hotel, 'id' | 'name' | 'lat' | 'lng' | 'brand' | 'prefecture'>[]

  // 統一フォーマットに変換
  const markers = [
    ...spots.map((s) => ({
      id: s.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      kind: 'spot' as const,
      sub: s.city ?? '',
    })),
    ...hotels.map((h) => ({
      id: h.id,
      name: h.name,
      lat: h.lat,
      lng: h.lng,
      kind: 'hotel' as const,
      sub: [h.brand, h.prefecture].filter(Boolean).join(' · '),
    })),
  ]

  return (
    <div className="bg-white">
      <div className="px-8 md:px-14 py-6 border-b hairline flex items-baseline justify-between">
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400">MAP</p>
          {embedded ? (
            <h2 className="font-serif text-3xl italic font-light mt-1">All places.</h2>
          ) : (
            <h1 className="font-serif text-3xl italic font-light mt-1">All places.</h1>
          )}
        </div>
        <div className="text-right space-y-2">
          {embedded && <Link href="/map" className="text-[10px] tracking-luxe text-neutral-500 hover:text-black">VIEW ALL →</Link>}
          <p className="text-xs text-neutral-500">
            スポット {spots.length}件 · ホテル {hotels.length}件
          </p>
        </div>
      </div>
      <GoogleMap markers={markers} className={embedded ? "w-full h-[50vh] min-h-[320px] max-h-[600px]" : undefined} />
    </div>
  )
}
