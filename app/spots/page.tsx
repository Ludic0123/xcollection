export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import { CATEGORY_LABELS, type Category, type Spot } from '@/types'

type SearchParams = Promise<{ category?: string; city?: string; q?: string }>

export default async function SpotsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const supabase = await createClient()
  const authed = await isAuthed()

  let query = supabase.from('spots').select('*').order('created_at', { ascending: false })
  if (params.category) query = query.eq('category', params.category)
  if (params.city) query = query.eq('city', params.city)
  if (params.q) query = query.ilike('name', `%${params.q}%`)

  const { data: spots } = await query
  const list = (spots ?? []) as Spot[]

  const ids = list.map((s) => s.id)
  const ratingsBySpot: Record<string, { avg: number; count: number }> = {}
  if (ids.length > 0) {
    const { data: visits } = await supabase
      .from('visits')
      .select('spot_id, rating')
      .in('spot_id', ids)
    if (visits) {
      const map: Record<string, number[]> = {}
      for (const v of visits) {
        if (v.rating == null) continue
        ;(map[v.spot_id as string] ||= []).push(v.rating as number)
      }
      for (const sid of Object.keys(map)) {
        const arr = map[sid]
        ratingsBySpot[sid] = {
          avg: arr.reduce((a, b) => a + b, 0) / arr.length,
          count: arr.length,
        }
      }
    }
  }

  const cityList = Array.from(new Set(list.map((s) => s.city).filter(Boolean))) as string[]
  const title =
    params.category === 'hotel' ? 'Stays' : params.category === 'cafe' ? 'Cafés' : 'Tastes'

  return (
    <div className="bg-white min-h-screen">
      <div className="px-8 md:px-16 pt-14 pb-10 border-b hairline">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] tracking-luxe text-neutral-400">
            {(params.category ?? 'all').toUpperCase()}
          </p>
          {authed && (
            <Link
              href="/spots/new"
              className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
            >
              + ADD NEW
            </Link>
          )}
        </div>
        <h1 className="font-serif text-5xl md:text-7xl mt-4 italic font-light">{title}.</h1>
        <p className="text-sm text-neutral-500 mt-3">
          {list.length} item{list.length !== 1 ? 's' : ''}
        </p>
      </div>

      <form className="px-8 md:px-16 py-6 border-b hairline flex flex-wrap gap-4 items-end text-sm">
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400 mb-1">SEARCH</p>
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="店名・ホテル名"
            className="border-b hairline bg-transparent px-1 py-1 text-sm w-48 focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400 mb-1">CATEGORY</p>
          <select
            name="category"
            defaultValue={params.category ?? ''}
            className="border-b hairline bg-transparent px-1 py-1 text-sm focus:outline-none focus:border-black"
          >
            <option value="">ALL</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400 mb-1">CITY</p>
          <select
            name="city"
            defaultValue={params.city ?? ''}
            className="border-b hairline bg-transparent px-1 py-1 text-sm focus:outline-none focus:border-black"
          >
            <option value="">ALL</option>
            {cityList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button className="text-[10px] tracking-luxe border-b border-black px-1 py-1 hover:opacity-50">
          FILTER
        </button>
        <Link
          href="/spots"
          className="text-[10px] tracking-luxe text-neutral-400 hover:text-black"
        >
          RESET
        </Link>
      </form>

      <div className="px-4 md:px-16 py-6">
        {list.length === 0 ? (
          <div className="py-24 text-center text-sm text-neutral-400">
            まだ登録がありません。
          </div>
        ) : (
          <ul className="divide-y hairline">
            {list.map((spot) => {
              const r = ratingsBySpot[spot.id]
              return (
                <li key={spot.id}>
                  <Link
                    href={`/spots/${spot.id}`}
                    className="flex items-start gap-4 md:gap-5 py-4 hover:bg-neutral-50 -mx-2 md:-mx-4 px-2 md:px-4 transition-colors"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-neutral-100 overflow-hidden">
                      {spot.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={spot.cover_image_url}
                          alt={spot.name}
                          className="w-full h-full object-cover"
                        />
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
                        {CATEGORY_LABELS[spot.category as Category]}
                        {spot.prefecture && ` · ${spot.prefecture}`}
                        {spot.city && ` · ${spot.city}`}
                      </p>
                      <h3 className="font-serif text-lg md:text-xl mt-1 leading-snug truncate">
                        {spot.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 flex-wrap">
                        {authed && r && <span>★ {r.avg.toFixed(1)}</span>}
                        {spot.price_range && (
                          <span className="text-neutral-400">{'¥'.repeat(spot.price_range)}</span>
                        )}
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
        )}
      </div>
    </div>
  )
}
