import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EVENT_TYPE_LABELS, type AppEvent } from '@/types'

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
  const events = (data ?? []) as AppEvent[]

  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400">CONTENTS</p>
          <h1 className="font-serif text-4xl italic font-light mt-1">Events.</h1>
        </div>
        <Link
          href="/invitation/new"
          className="text-[11px] tracking-luxe bg-black text-white px-4 py-2 hover:bg-neutral-800"
        >
          + NEW EVENT
        </Link>
      </div>
      <div className="bg-white border hairline overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b hairline">
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">タイトル</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">タイプ</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">日程</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">ステータス</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b hairline">
                <td className="py-2 px-3">
                  <Link href={`/invitation/${e.id}`} className="hover:underline">
                    {e.title}
                  </Link>
                </td>
                <td className="py-2 px-3 text-xs text-neutral-500">
                  {EVENT_TYPE_LABELS[e.event_type]}
                </td>
                <td className="py-2 px-3 text-xs text-neutral-500">{e.event_date ?? '-'}</td>
                <td className="py-2 px-3 text-xs uppercase tracking-luxe text-neutral-500">
                  {e.status}
                </td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
