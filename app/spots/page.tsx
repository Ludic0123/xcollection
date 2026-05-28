export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import { CATEGORY_LABELS, type Spot } from '@/types'
import SpotsList from '@/components/SpotsList'

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
      <div className="px-4 md:px-16 pt-4 pb-3 md:pt-12 md:pb-8 border-b hairline">
        <div className="flex items-baseline justify-between">
          <p className="text-[9px] tracking-luxe text-neutral-400">
            {(params.category ?? 'all').toUpperCase()}
          </p>
          {authed && (
            <Link
              href="/spots/new"
              className="text-[9px] tracking-luxe text-neutral-500 hover:text-black"
            >
              + ADD NEW
            </Link>
          )}
        </div>
        <h1 className="font-serif text-3xl md:text-6xl mt-1 md:mt-3 italic font-light">{title}.</h1>
        <p className="text-[10px] md:text-sm text-neutral-500 mt-1 md:mt-2">
          {list.length} item{list.length !== 1 ? 's' : ''}
        </p>
      </div>

      <form className="px-4 md:px-16 py-2.5 md:py-5 border-b hairline flex flex-wrap gap-3 md:gap-4 items-end">
        <div>
          <p className="text-[9px] tracking-luxe text-neutral-400 mb-0.5">SEARCH</p>
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="店名"
            className="border-b hairline bg-transparent px-1 py-0.5 text-xs md:text-sm w-32 md:w-48 focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <p className="text-[9px] tracking-luxe text-neutral-400 mb-0.5">CATEGORY</p>
          <select
            name="category"
            defaultValue={params.category ?? ''}
            className="border-b hairline bg-transparent px-1 py-0.5 text-xs md:text-sm focus:outline-none focus:border-black"
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
          <p className="text-[9px] tracking-luxe text-neutral-400 mb-0.5">CITY</p>
          <select
            name="city"
            defaultValue={params.city ?? ''}
            className="border-b hairline bg-transparent px-1 py-0.5 text-xs md:text-sm focus:outline-none focus:border-black"
          >
            <option value="">ALL</option>
            {cityList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button className="text-[9px] tracking-luxe border-b border-black px-1 py-0.5 hover:opacity-50">
          FILTER
        </button>
        <Link
          href="/spots"
          className="text-[9px] tracking-luxe text-neutral-400 hover:text-black"
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
          <SpotsList spots={list} ratingsBySpot={ratingsBySpot} authed={authed} />
        )}
      </div>
    </div>
  )
}
