export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMember } from '@/lib/auth'
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_OPTIONS,
  type AppEvent,
} from '@/types'

type SearchParams = Promise<{ type?: string }>

export default async function InvitationPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const member = await getCurrentMember()
  if (!member) {
    redirect('/login?redirect=/invitation')
  }

  const params = await searchParams
  const supabase = await createClient()

  let q = supabase
    .from('events')
    .select('*, spot:spots(id, name, city), sake:sakes(id, name, brewery)')
    .order('event_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (params.type) q = q.eq('event_type', params.type)

  const { data: eventsData } = await q
  const events = (eventsData ?? []) as AppEvent[]

  // 参加人数集計
  const eventIds = events.map((e) => e.id)
  const counts: Record<string, number> = {}
  if (eventIds.length > 0) {
    const { data: parts } = await supabase
      .from('event_participants')
      .select('event_id')
      .in('event_id', eventIds)
    if (parts) {
      for (const p of parts as { event_id: string }[]) {
        counts[p.event_id] = (counts[p.event_id] ?? 0) + 1
      }
    }
  }

  return (
    <div className="bg-white min-h-[calc(100vh-6rem)]">
      {/* HERO */}
      <section className="px-8 md:px-16 pt-16 pb-12 border-b hairline">
        <p className="text-[10px] tracking-luxe text-neutral-400">MEMBERS ONLY</p>
        <h1 className="font-serif text-5xl md:text-7xl italic font-light mt-3">Invitation.</h1>
        <p className="text-sm text-neutral-600 mt-6 max-w-xl">
          会員限定。グルメ会・日本酒会・日本酒配布の募集と参加。
        </p>
      </section>

      {/* EVENTS */}
      <section className="px-8 md:px-16 py-12">
        <div className="flex items-center justify-end mb-6">
          <Link
            href="/invitation/new"
            className="text-[11px] tracking-luxe bg-black text-white px-4 py-2.5 hover:bg-neutral-800"
          >
            + CREATE
          </Link>
        </div>

        {/* Type filter tabs */}
        <div className="flex flex-wrap gap-5 mb-8 pb-4 border-b hairline">
          <FilterTab href="/invitation" active={!params.type} label="ALL" />
          {EVENT_TYPE_OPTIONS.map((opt) => (
            <FilterTab
              key={opt.value}
              href={`/invitation?type=${opt.value}`}
              active={params.type === opt.value}
              label={opt.label}
            />
          ))}
        </div>

        {events.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-400">まだ募集はありません。</p>
        ) : (
          <ul className="divide-y hairline">
            {events.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/invitation/${e.id}`}
                  className="flex items-start gap-5 py-6 hover:bg-neutral-50 -mx-4 px-4 transition-colors"
                >
                  <div className="w-28 h-28 shrink-0 bg-neutral-100 overflow-hidden">
                    {e.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.cover_image_url}
                        alt={e.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif italic text-neutral-300 text-4xl">
                        {e.title.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] tracking-luxe text-neutral-400">
                      {EVENT_TYPE_LABELS[e.event_type]}
                      {e.event_date && ` · ${e.event_date}${e.event_time ? ' ' + e.event_time.slice(0, 5) : ''}`}
                    </p>
                    <h3 className="font-serif text-2xl mt-1">{e.title}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-neutral-500">
                      {e.location_text && <span>📍 {e.location_text}</span>}
                      {e.spot && <span>📍 {e.spot.name}</span>}
                      {e.sake && <span>🍶 {e.sake.name}</span>}
                      {e.budget_yen != null && <span>¥{e.budget_yen.toLocaleString()}</span>}
                      {e.max_participants != null && (
                        <span>
                          {counts[e.id] ?? 0} / {e.max_participants}名
                        </span>
                      )}
                      {e.status !== 'open' && (
                        <span className="text-red-500 uppercase tracking-luxe">
                          {e.status}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function FilterTab({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={`text-xs tracking-luxe pb-1 ${
        active ? 'text-black border-b-2 border-black' : 'text-neutral-400 hover:text-black'
      }`}
    >
      {label}
    </Link>
  )
}
