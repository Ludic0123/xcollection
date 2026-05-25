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
      <div className="px-8 md:px-16 pt-14 pb-10 border-b hairline">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] tracking-luxe text-neutral-400">STAYS</p>
          {authed && (
            <Link
              href="/hotels/new"
              className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
            >
              + ADD NEW
            </Link>
          )}
        </div>
        <h1 className="font-serif text-5xl md:text-7xl mt-4 italic font-light">Stays.</h1>
        <p className="text-sm text-neutral-500 mt-3">{list.length} hotels</p>
      </div>

      <form className="px-8 md:px-16 py-6 border-b hairline flex flex-wrap gap-4 items-end text-sm">
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400 mb-1">SEARCH</p>
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="ホテル名"
            className="border-b hairline bg-transparent px-1 py-1 text-sm w-48 focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400 mb-1">PREFECTURE</p>
          <select
            name="prefecture"
            defaultValue={params.prefecture ?? ''}
            className="border-b hairline bg-transparent px-1 py-1 text-sm focus:outline-none focus:border-black"
          >
            <option value="">ALL</option>
            {prefectures.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400 mb-1">BRAND</p>
          <select
            name="brand"
            defaultValue={params.brand ?? ''}
            className="border-b hairline bg-transparent px-1 py-1 text-sm focus:outline-none focus:border-black"
          >
            <option value="">ALL</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <button className="text-[10px] tracking-luxe border-b border-black px-1 py-1 hover:opacity-50">
          FILTER
        </button>
        <Link href="/hotels" className="text-[10px] tracking-luxe text-neutral-400 hover:text-black">
          RESET
        </Link>
      </form>

      <div className="px-8 md:px-16 py-12">
        {list.length === 0 ? (
          <div className="py-24 text-center text-sm text-neutral-400">まだ登録がありません。</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {list.map((h) => (
              <Link key={h.id} href={`/hotels/${h.id}`} className="block group">
                <div className="aspect-[4/5] bg-neutral-100 overflow-hidden relative">
                  {h.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={h.cover_image_url}
                      alt={h.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif italic text-neutral-300 text-3xl">
                      {h.name.slice(0, 1)}
                    </div>
                  )}
                  {h.want_to_visit && (
                    <span className="absolute top-3 left-3 bg-white text-[10px] tracking-luxe px-2 py-1">
                      WISHLIST
                    </span>
                  )}
                </div>
                <div className="mt-5">
                  <p className="text-[10px] tracking-luxe text-neutral-400">
                    {h.prefecture ?? 'JAPAN'}
                    {h.brand && ` · ${h.brand}`}
                  </p>
                  <h3 className="font-serif text-2xl mt-2 leading-tight">{h.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
