export const dynamic = 'force-dynamic'

import { TEST_CONTENT_PATTERN } from '@/lib/content-visibility'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import type { Sake } from '@/types'

export default async function SakeListPage() {
  const supabase = await createClient()
  const authed = await isAuthed()

  const { data } = await supabase
    .from('sakes')
    .select('*').not('name', 'like', TEST_CONTENT_PATTERN)
    .order('created_at', { ascending: false })
  const list = (data ?? []) as Sake[]

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 md:px-16 pt-4 pb-3 md:pt-12 md:pb-8 border-b hairline">
        <div className="flex items-baseline justify-between">
          <p className="text-xs tracking-luxe text-neutral-600">SAKE</p>
          {authed && (
            <Link
              href="/sake/new"
              className="ui-action text-xs tracking-luxe text-neutral-500 hover:text-black"
            >
              + ADD NEW
            </Link>
          )}
        </div>
        <h1 className="font-serif text-3xl md:text-6xl mt-1 md:mt-3 italic font-light">Sake.</h1>
        <p className="text-xs md:text-sm text-neutral-500 mt-1 md:mt-2">{list.length} bottles</p>
      </div>

      <div className="px-4 md:px-16 py-6">
        {list.length === 0 ? (
          <div className="py-24 text-center text-sm text-neutral-600">
            まだ登録がありません。
          </div>
        ) : (
          <ul className="divide-y hairline">
            {list.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sake/${s.id}`}
                  className="flex items-start gap-4 md:gap-5 py-4 hover:bg-neutral-50 -mx-2 md:-mx-4 px-2 md:px-4 transition-colors"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-neutral-100 overflow-hidden">
                    {s.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.cover_image_url}
                        alt={s.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-serif italic text-neutral-300 text-xl">
                          {s.name.slice(0, 1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs tracking-luxe text-neutral-600">
                      {s.region ?? 'JAPAN'}
                      {s.sake_type && ` · ${s.sake_type}`}
                    </p>
                    <h3 className="font-serif text-base md:text-lg mt-1 leading-snug break-words">
                      {s.name}
                    </h3>
                    {s.model && <p className="text-sm text-neutral-700 mt-1 leading-relaxed break-words">{s.model}</p>}
                    {s.brewery && (
                      <p className="text-xs text-neutral-500 mt-1 break-words">{s.brewery}</p>
                    )}
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
