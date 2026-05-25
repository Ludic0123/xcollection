export const dynamic = 'force-dynamic'

﻿import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Hotel } from '@/types'

export default async function AdminHotelsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hotels')
    .select('*')
    .order('created_at', { ascending: false })
  const hotels = (data ?? []) as Hotel[]

  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400">CONTENTS</p>
          <h1 className="font-serif text-4xl italic font-light mt-1">Hotels.</h1>
        </div>
        <Link
          href="/hotels/new"
          className="text-[11px] tracking-luxe bg-black text-white px-4 py-2 hover:bg-neutral-800"
        >
          + NEW HOTEL
        </Link>
      </div>
      <div className="bg-white border hairline overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b hairline">
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">名前</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">ブランド</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">都道府県</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">作成日</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h.id} className="border-b hairline">
                <td className="py-2 px-3">
                  <Link href={`/hotels/${h.id}`} className="hover:underline">
                    {h.name}
                  </Link>
                </td>
                <td className="py-2 px-3 text-xs text-neutral-500">{h.brand ?? '-'}</td>
                <td className="py-2 px-3 text-xs text-neutral-500">{h.prefecture ?? '-'}</td>
                <td className="py-2 px-3 text-xs text-neutral-500">
                  {new Date(h.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="py-2 px-3 text-right">
                  <Link
                    href={`/hotels/${h.id}/edit`}
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
