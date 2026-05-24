import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Sake } from '@/types'

export default async function AdminSakePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sakes')
    .select('*')
    .order('created_at', { ascending: false })
  const sakes = (data ?? []) as Sake[]

  return (
    <div className="px-10 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-luxe text-neutral-400">CONTENTS</p>
          <h1 className="font-serif text-4xl italic font-light mt-1">Sake.</h1>
        </div>
        <Link
          href="/sake/new"
          className="text-[11px] tracking-luxe bg-black text-white px-4 py-2 hover:bg-neutral-800"
        >
          + NEW SAKE
        </Link>
      </div>
      <div className="bg-white border hairline overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b hairline">
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">銘柄</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">蔵元</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">タイプ</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">作成日</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sakes.map((s) => (
              <tr key={s.id} className="border-b hairline">
                <td className="py-2 px-3">
                  <Link href={`/sake/${s.id}`} className="hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className="py-2 px-3 text-xs text-neutral-500">{s.brewery ?? '-'}</td>
                <td className="py-2 px-3 text-xs text-neutral-500">{s.sake_type ?? '-'}</td>
                <td className="py-2 px-3 text-xs text-neutral-500">
                  {new Date(s.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="py-2 px-3 text-right">
                  <Link
                    href={`/sake/${s.id}/edit`}
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
