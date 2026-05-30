export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function UsersAdminPage() {
  let data: Record<string, unknown>[] | null = null
  let errorMessage: string | null = null
  try {
    const supabase = createAdminClient()
    const res = await supabase.from('members').select('*').order('member_number')
    data = res.data as Record<string, unknown>[] | null
    if (res.error) errorMessage = res.error.message
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : '不明なエラー'
  }
  const error = errorMessage ? { message: errorMessage } : null
  if (error) {
    return (
      <div className="px-4 py-6 md:px-10 md:py-10">
        <p className="text-[10px] tracking-luxe text-neutral-400">PEOPLE</p>
        <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Members.</h1>
        <p className="text-sm text-red-600">読み込みエラー: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">PEOPLE</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Members.</h1>
      <p className="text-sm text-neutral-500 mb-6">
        会員一覧。行をクリックすると詳細プロフィールを表示します。
      </p>
      <div className="bg-white border hairline overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b hairline">
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">NO.</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">氏名</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">フリガナ</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">勤務先</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">居住地</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">生年月日</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">ADMIN</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">登録日</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((m) => {
              const fullName =
                [m.last_name_kanji, m.first_name_kanji].filter(Boolean).join(' ') ||
                '(未入力)'
              const fullKana =
                [m.last_name_kana, m.first_name_kana].filter(Boolean).join(' ') || '-'
              const residence =
                [m.residence_1, m.residence_2].filter(Boolean).join(' / ') || '-'
              const birth = m.birth_date
                ? new Date(m.birth_date as string).toLocaleDateString('ja-JP')
                : '-'
              return (
                <tr
                  key={m.id as string}
                  className="border-b hairline hover:bg-neutral-50"
                >
                  <td className="py-3 px-3 font-mono">
                    <Link href={`/admin/users/${m.id}`} className="block">
                      {String(m.member_number).padStart(3, '0')}
                    </Link>
                  </td>
                  <td className="py-3 px-3">
                    <Link href={`/admin/users/${m.id}`} className="block font-serif">
                      {fullName}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-500">
                    <Link href={`/admin/users/${m.id}`} className="block">
                      {fullKana}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-600">
                    <Link href={`/admin/users/${m.id}`} className="block">
                      {(m.company as string) || '-'}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-600">
                    <Link href={`/admin/users/${m.id}`} className="block">
                      {residence}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-600">
                    <Link href={`/admin/users/${m.id}`} className="block">
                      {birth}
                    </Link>
                  </td>
                  <td className="py-3 px-3">
                    <Link href={`/admin/users/${m.id}`} className="block">
                      {m.is_admin ? '✓' : ''}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-500">
                    <Link href={`/admin/users/${m.id}`} className="block">
                      {new Date(m.created_at as string).toLocaleDateString('ja-JP')}
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
