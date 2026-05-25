import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Chef } from '@/types'

export default async function AdminChefsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('chefs')
    .select('*')
    .order('created_at', { ascending: false })
  const chefs = (data ?? []) as Chef[]

  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400">CONTENTS</p>
          <h1 className="font-serif text-4xl italic font-light mt-1">Chefs.</h1>
        </div>
        <Link
          href="/chefs/new"
          className="text-[11px] tracking-luxe bg-black text-white px-4 py-2 hover:bg-neutral-800"
        >
          + NEW CHEF
        </Link>
      </div>
      <div className="bg-white border hairline overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b hairline">
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">氏名</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">フリガナ</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">専門</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">作成日</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {chefs.map((c) => (
              <tr key={c.id} className="border-b hairline">
                <td className="py-2 px-3">
                  <Link href={`/chefs/${c.id}`} className="hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="py-2 px-3 text-xs text-neutral-500">{c.name_kana ?? '-'}</td>
                <td className="py-2 px-3 text-xs text-neutral-500">{c.specialty ?? '-'}</td>
                <td className="py-2 px-3 text-xs text-neutral-500">
                  {new Date(c.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="py-2 px-3 text-right">
                  <Link
                    href={`/chefs/${c.id}/edit`}
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
