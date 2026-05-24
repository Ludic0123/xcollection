import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import type { Sake } from '@/types'

export default async function SakeListPage() {
  const supabase = await createClient()
  const authed = await isAuthed()

  const { data } = await supabase
    .from('sakes')
    .select('*')
    .order('created_at', { ascending: false })
  const list = (data ?? []) as Sake[]

  return (
    <div className="bg-white min-h-screen">
      <div className="px-8 md:px-16 pt-14 pb-10 border-b hairline">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] tracking-luxe text-neutral-400">SAKE</p>
          {authed && (
            <Link
              href="/sake/new"
              className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
            >
              + ADD NEW
            </Link>
          )}
        </div>
        <h1 className="font-serif text-5xl md:text-7xl mt-4 italic font-light">Sake.</h1>
        <p className="text-sm text-neutral-500 mt-3">{list.length} bottles</p>
      </div>

      <div className="px-8 md:px-16 py-12">
        {list.length === 0 ? (
          <div className="py-24 text-center text-sm text-neutral-400">
            まだ登録がありません。
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
            {list.map((s) => (
              <Link key={s.id} href={`/sake/${s.id}`} className="block group">
                <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
                  {s.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.cover_image_url}
                      alt={s.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif italic text-neutral-300 text-4xl">
                        {s.name.slice(0, 1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-[10px] tracking-luxe text-neutral-400">
                    {s.region ?? 'JAPAN'}
                    {s.sake_type && ` · ${s.sake_type}`}
                  </p>
                  <h3 className="font-serif text-xl mt-1 leading-snug">{s.name}</h3>
                  {s.brewery && (
                    <p className="text-xs text-neutral-500 mt-1">{s.brewery}</p>
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
