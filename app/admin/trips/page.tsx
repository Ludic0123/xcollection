export const dynamic = 'force-dynamic'

﻿import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { TripPlan } from '@/types'

export default async function AdminTripsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('trip_plans')
    .select('*')
    .order('created_at', { ascending: false })
  const trips = (data ?? []) as TripPlan[]

  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400">CONTENTS</p>
          <h1 className="font-serif text-4xl italic font-light mt-1">Trips.</h1>
        </div>
        <Link
          href="/trips/new"
          className="text-[11px] tracking-luxe bg-black text-white px-4 py-2 hover:bg-neutral-800"
        >
          + NEW TRIP
        </Link>
      </div>
      <div className="bg-white border hairline overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b hairline">
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">タイトル</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">街</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">日程</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">作成日</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id} className="border-b hairline">
                <td className="py-2 px-3">
                  <Link href={`/trips/${t.id}`} className="hover:underline">
                    {t.title}
                  </Link>
                </td>
                <td className="py-2 px-3 text-xs text-neutral-500">{t.city ?? '-'}</td>
                <td className="py-2 px-3 text-xs text-neutral-500">
                  {t.start_date ?? '-'}
                  {t.end_date && ` 〜 ${t.end_date}`}
                </td>
                <td className="py-2 px-3 text-xs text-neutral-500">
                  {new Date(t.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="py-2 px-3 text-right">
                  <Link
                    href={`/trips/${t.id}/edit`}
                    className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
                  >
                    EDIT
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
