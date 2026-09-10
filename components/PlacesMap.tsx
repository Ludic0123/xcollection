import { TEST_CONTENT_PATTERN } from '@/lib/content-visibility'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMember } from '@/lib/auth'
import GoogleMap from '@/components/GoogleMap'
import type { Spot, Hotel } from '@/types'

export default async function PlacesMap({ embedded = false }: { embedded?: boolean }) {
  const supabase = await createClient()
  const member = await getCurrentMember()
  const [{ data: spotData }, { data: hotelData }] = await Promise.all([
    supabase
      .from('spots')
      .select('id, name, lat, lng, category, city').not('name', 'like', TEST_CONTENT_PATTERN)
      .not('lat', 'is', null)
      .not('lng', 'is', null),
    supabase
      .from('hotels')
      .select('id, name, lat, lng, brand, prefecture').not('name', 'like', TEST_CONTENT_PATTERN)
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
      <div className="px-8 md:px-14 py-6 border-b hairline flex flex-wrap gap-4 items-start justify-between">
        <div>
          <p className="text-xs tracking-luxe text-neutral-600">MAP</p>
          {embedded ? (
            <h2 className="font-serif text-3xl italic font-light mt-1">All places.</h2>
          ) : (
            <h1 className="font-serif text-3xl italic font-light mt-1">All places.</h1>
          )}
        </div>
        <div className="space-y-2 sm:text-right">
          {embedded && <Link href="/map" className="ui-action text-xs tracking-luxe text-neutral-500 hover:text-black">VIEW ALL →</Link>}
          <p className="text-xs text-neutral-500">
            スポット {spots.length}件 · ホテル {hotels.length}件
          </p>
        </div>
      </div>
      <div className="px-8 md:px-14 py-4 text-sm text-neutral-600 leading-relaxed">
        <p>位置情報が登録されたスポット・ホテルを表示しています。</p>
        {markers.length === 0 && <p className="mt-1">地図に表示できる場所はまだありません。</p>}
        {member?.isAdmin && markers.length === 0 && (
          <div className="mt-3">
            <p>管理画面で場所の緯度・経度を登録すると、ここに表示されます。</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link href="/admin/spots" className="ui-action text-xs border hairline hover:text-black">スポットを管理</Link>
              <Link href="/admin/hotels" className="ui-action text-xs border hairline hover:text-black">ホテルを管理</Link>
            </div>
          </div>
        )}
      </div>
      <GoogleMap markers={markers} className={embedded ? "w-full h-[50vh] min-h-[320px] max-h-[600px]" : undefined} />
    </div>
  )
}
