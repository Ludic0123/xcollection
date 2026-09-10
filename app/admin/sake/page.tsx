export const dynamic = 'force-dynamic'

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
    <div className="px-4 py-6 md:px-10 md:py-10">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div>
          <p className="text-xs tracking-luxe text-neutral-600">CONTENTS</p>
          <h1 className="font-serif text-4xl italic font-light mt-1">Sake.</h1>
        </div>
        <Link
          href="/sake/new"
          className="ui-action text-xs tracking-luxe bg-black text-white px-4 py-2 hover:bg-neutral-800"
        >
          + NEW SAKE
        </Link>
      </div>
      {sakes.length === 0 && <p className="py-12 text-sm text-neutral-600">まだ登録がありません。</p>}
      <ul className="lg:hidden space-y-3">
        {sakes.map((s) => (
          <li key={s.id} className="bg-white border hairline p-4">
            <h2 className="font-serif text-lg leading-snug break-words">{s.name}</h2>
            {s.model && <p className="mt-1 text-sm leading-relaxed break-words">{s.model}</p>}
            <dl className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-3 gap-y-2 mt-4 text-xs leading-relaxed text-neutral-600">
              <dt>蔵元</dt><dd className="break-words">{s.brewery ?? '未登録'}</dd>
              <dt>タイプ</dt><dd className="break-words">{s.sake_type ?? '未登録'}</dd>
              <dt>作成日</dt><dd>{new Date(s.created_at).toLocaleDateString('ja-JP')}</dd>
            </dl>
            <div className="flex justify-end mt-3">
              <Link href={`/sake/${s.id}/edit`} aria-label={`${s.name}を編集`} className="ui-action border hairline text-xs tracking-luxe hover:bg-neutral-50">EDIT</Link>
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden lg:block bg-white border hairline overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b hairline">
              <th className="py-2 px-3 text-left text-xs tracking-luxe text-neutral-500">銘柄</th>
              <th className="py-2 px-3 text-left text-xs tracking-luxe text-neutral-500">蔵元</th>
              <th className="py-2 px-3 text-left text-xs tracking-luxe text-neutral-500">タイプ</th>
              <th className="py-2 px-3 text-left text-xs tracking-luxe text-neutral-500">作成日</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sakes.map((s) => (
              <tr key={s.id} className="border-b hairline">
                <td className="py-2 px-3">
                  <Link href={`/sake/${s.id}`} className="hover:underline">
                    {[s.name, s.model].filter(Boolean).join(' ')}
                  </Link>
                </td>
                <td className="py-2 px-3 text-xs text-neutral-600 whitespace-nowrap">{s.brewery ?? '-'}</td>
                <td className="py-2 px-3 text-xs text-neutral-500">{s.sake_type ?? '-'}</td>
                <td className="py-2 px-3 text-xs text-neutral-500">
                  {new Date(s.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="py-2 px-3 text-right">
                  <Link
                    href={`/sake/${s.id}/edit`}
                    className="ui-action text-xs tracking-luxe text-neutral-500 hover:text-black"
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
