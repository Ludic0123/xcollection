export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import type { Chef } from '@/types'

export default async function ChefsListPage() {
  const supabase = await createClient()
  const authed = await isAuthed()

  const { data } = await supabase
    .from('chefs')
    .select('*')
    .order('created_at', { ascending: false })
  const list = (data ?? []) as Chef[]

  return (
    <div className="bg-white min-h-screen">
      <div className="px-8 md:px-16 pt-14 pb-10 border-b hairline">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] tracking-luxe text-neutral-400">CHEFS</p>
          {authed && (
            <Link
              href="/chefs/new"
              className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
            >
              + ADD NEW
            </Link>
          )}
        </div>
        <h1 className="font-serif text-5xl md:text-7xl mt-4 italic font-light">Chefs.</h1>
        <p className="text-sm text-neutral-500 mt-3">{list.length} 名</p>
      </div>

      <div className="px-8 md:px-16 py-12">
        {list.length === 0 ? (
          <div className="py-24 text-center text-sm text-neutral-400">
            まだ登録がありません。
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-14">
            {list.map((c) => (
              <Link key={c.id} href={`/chefs/${c.id}`} className="block group">
                <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
                  {c.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.cover_image_url}
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif italic text-neutral-300 text-5xl">
                        {c.name.slice(0, 1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-[10px] tracking-luxe text-neutral-400">
                    {c.specialty ?? 'CHEF'}
                    {c.hometown && ` · ${c.hometown}`}
                  </p>
                  <h3 className="font-serif text-xl mt-1 leading-snug">{c.name}</h3>
                  {c.name_kana && (
                    <p className="text-[10px] tracking-luxe text-neutral-400 mt-1">
                      {c.name_kana}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
