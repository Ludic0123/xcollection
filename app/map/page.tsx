import { createClient } from '@/lib/supabase/server'
import GoogleMap from '@/components/GoogleMap'
import type { Spot } from '@/types'

export default async function MapPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('spots')
    .select('id, name, lat, lng, category, city')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  const spots = (data ?? []) as Pick<Spot, 'id' | 'name' | 'lat' | 'lng' | 'category' | 'city'>[]

  return (
    <div className="bg-white">
      <div className="px-8 md:px-14 py-6 border-b hairline flex items-baseline justify-between">
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400">MAP</p>
          <h1 className="font-serif text-3xl italic font-light mt-1">All spots.</h1>
        </div>
        <p className="text-xs text-neutral-500">{spots.length} 件をマップに表示</p>
      </div>
      <GoogleMap spots={spots} />
    </div>
  )
}
