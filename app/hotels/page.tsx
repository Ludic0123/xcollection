export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import type { Hotel } from '@/types'

type SearchParams = Promise<{ prefecture?: string; brand?: string; q?: string }>

export default async function HotelsListPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const supabase = await createClient()
  const authed = await isAuthed()

  let query = supabase.from('hotels').select('*').order('created_at', { ascending: false })
  if (params.prefecture) query = query.eq('prefecture', params.prefecture)
  if (params.brand) query = query.eq('brand', params.brand)
  if (params.q) query = query.ilike('name', `%${params.q}%`)
  const { data } = await query
  const list = (data ?? []) as Hotel[]

  const prefectures = Array.from(new Set(list.map((h) => h.prefecture).filter(Boolean))) as string[]
  const brands = Array.from(new Set(list.map((h) => h.brand).filter(Boolean))) as string[]

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 md:px-16 pt-4 pb-3 md:pt-12 md:pb-8 border-b hairline">
        <div className="flex items-baseline justify-between">
          <p className="text-[9px] tracking-luxe text-neutral-400">STAYS</p>
          {authed && (
            <Link
              href="/hotels/new"
              className="text-[9px] tracking-luxe text-neutral-500 hover:text-black"
            >
              + ADD NEW
            </Link>
          )}
        </div>
        <h1 className="font-serif text-3xl md:text-6xl mt-1 md:mt-3 italic font-light">Stays.</h1>
        <p className="text-[10px] md:text-sm text-neutral-500 mt-1 md:mt-2">{list.length} hotels</p>
      </div>

      <form className="px-4 md:px-16 py-2.5 md:py-5 border-b hairline flex flex-wrap gap-3 md:gap-4 items-end">
        <div>
          <p className="text-[9px] tracking-luxe text-neutral-400 mb-0.5">SEARCH</p>
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="ホテル名"
            className="border-b hairline bg-transparent px-1 py-0.5 text-xs md:text-sm w-32 md:w-48 focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <p className="text-[9px] tracking-luxe text-neutral-400 mb-0.5">PREFECTURE</p>
          <select
            name="prefecture"
            defaultValue={params.prefecture ?? ''}
            className="border-b hairline bg-transparent px-1 py-0.5 text-xs md:text-sm focus:outline-none focus:border-black"
          >
            <option value="">ALL</option>
            {prefectures.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-[9px] tracking-luxe text-neutral-400 mb-0.5">BRAND</p>
          <select
            name="brand"
            defaultValue={params.brand ?? ''}
            className="border-b hairline bg-transparent px-1 py-0.5 text-xs md:text-sm focus:outline-none focus:border-black"
          >
            <option value="">ALL</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <button className="text-[9px] tracking-luxe border-b border-black px-1 py-0.5 hover:opacity-50">
          FILTER
        </button>
        <Link href="/hotels" className="text-[9px] tracking-luxe text-neutral-400 hover:text-black">
          RESET
        </Link>
      </form>

      <div className="px-4 md:px-16 py-6">
        {list.length === 0 ? (
          <div className="py-24 text-center text-sm text-neutral-400">まだ登録がありません。</div>
        ) : (
          <ul className="divide-y hairline">
            {list.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/hotels/${h.id}`}
                  className="flex items-start gap-4 md:gap-5 py-4 hover:bg-neutral-50 -mx-2 md:-mx-4 px-2 md:px-4 transition-colors"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-neutral-100 overflow-hidden">
                    {h.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={h.cover_image_url}
                        alt={h.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif italic text-neutral-300 text-xl">
                        {h.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] tracking-luxe text-neutral-400">
                      {h.prefecture ?? 'JAPAN'}
                      {h.brand && ` · ${h.brand}`}
                    </p>
                    <h3 className="font-serif text-base md:text-lg mt-1 leading-snug truncate">
                      {h.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 flex-wrap">
                      {h.price_range && (
                        <span className="text-neutral-400">{'¥'.repeat(h.price_range)}</span>
                      )}
                      {h.want_to_visit && (
                        <span className="text-[9px] tracking-luxe bg-neutral-100 px-1.5 py-0.5">
                          WISHLIST
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
