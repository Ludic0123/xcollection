export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type MemberRow = Record<string, unknown> & {
  id?: string
  member_number?: number
  is_admin?: boolean
  last_name_kanji?: string | null
  first_name_kanji?: string | null
  last_name_kana?: string | null
  first_name_kana?: string | null
  company?: string | null
  residence_1?: string | null
  residence_2?: string | null
  birth_date?: string | null
  created_at?: string
}

export default async function UsersAdminPage() {
  let rows: MemberRow[] = []
  let errorMessage: string | null = null

  try {
    const supabase = await createClient()
    const auth = await supabase.auth.getUser()
    const user = auth.data.user

    if (!user) {
      errorMessage = 'ログインが必要です'
    } else {
      const rpc = await supabase.rpc('admin_list_members', { caller_id: user.id })
      if (rpc.error) {
        // RPC が無いか、何か失敗
        errorMessage = `RPC失敗: ${rpc.error.message}`
      } else if (Array.isArray(rpc.data)) {
        rows = rpc.data as MemberRow[]
      }
    }
  } catch (e) {
    errorMessage = `例外: ${e instanceof Error ? e.message : String(e)}`
  }

  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">PEOPLE</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Members.</h1>

      {errorMessage && (
        <div className="mb-6 border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
          <p className="text-xs text-red-500 mt-2">
            画面に表示されている文言をそのまま貼って報告してください。
          </p>
        </div>
      )}

      <p className="text-sm text-neutral-500 mb-6">
        会員一覧（{rows.length}名）。行をクリックすると詳細プロフィールを表示します。
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
            {rows.map((m, idx) => {
              const id = (m.id as string) ?? `row-${idx}`
              const fullName =
                [m.last_name_kanji, m.first_name_kanji].filter(Boolean).join(' ') || '(未入力)'
              const fullKana =
                [m.last_name_kana, m.first_name_kana].filter(Boolean).join(' ') || '-'
              const residence =
                [m.residence_1, m.residence_2].filter(Boolean).join(' / ') || '-'
              let birth = '-'
              if (m.birth_date) {
                try {
                  birth = new Date(m.birth_date).toLocaleDateString('ja-JP')
                } catch {
                  birth = String(m.birth_date)
                }
              }
              let created = '-'
              if (m.created_at) {
                try {
                  created = new Date(m.created_at).toLocaleDateString('ja-JP')
                } catch {
                  created = String(m.created_at)
                }
              }
              return (
                <tr key={id} className="border-b hairline hover:bg-neutral-50">
                  <td className="py-3 px-3 font-mono">
                    <Link href={`/admin/users/${id}`} className="block">
                      {m.member_number != null ? String(m.member_number).padStart(3, '0') : '-'}
                    </Link>
                  </td>
                  <td className="py-3 px-3">
                    <Link href={`/admin/users/${id}`} className="block font-serif">{fullName}</Link>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-500">
                    <Link href={`/admin/users/${id}`} className="block">{fullKana}</Link>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-600">
                    <Link href={`/admin/users/${id}`} className="block">{m.company || '-'}</Link>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-600">
                    <Link href={`/admin/users/${id}`} className="block">{residence}</Link>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-600">
                    <Link href={`/admin/users/${id}`} className="block">{birth}</Link>
                  </td>
                  <td className="py-3 px-3">
                    <Link href={`/admin/users/${id}`} className="block">{m.is_admin ? '✓' : ''}</Link>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-500">
                    <Link href={`/admin/users/${id}`} className="block">{created}</Link>
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
