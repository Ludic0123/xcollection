import { createClient } from '@/lib/supabase/server'

export default async function UsersAdminPage() {
  const supabase = await createClient()
  // 自分しか見えない RLS は admin にも適用されている。SECURITY DEFINER 関数か service role が必要だが
  // ここでは簡易的に自分の情報＋invited_by 経由で広げる
  // とりあえず members を全件取得を試みる（後で RLS で admin は全件可能にする）
  const { data } = await supabase
    .from('members')
    .select('id, member_number, member_code, is_admin, invited_by, created_at')
    .order('member_number')

  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">PEOPLE</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Members.</h1>
      <p className="text-sm text-neutral-500 mb-6">
        会員一覧。
        <span className="text-neutral-400 text-xs ml-2">
          ※ 現在 RLS の都合で自分の情報しか見えません。後で admin 用ポリシー追加します
        </span>
      </p>
      <div className="bg-white border hairline overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b hairline bg-neutral-50">
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">NO.</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">CODE</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">ADMIN</th>
              <th className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500">登録日</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((m) => (
              <tr key={m.id as string} className="border-b hairline">
                <td className="py-3 px-3 font-mono">{String(m.member_number).padStart(3, '0')}</td>
                <td className="py-3 px-3 font-mono">{m.member_code as string}</td>
                <td className="py-3 px-3">{m.is_admin ? '✓' : ''}</td>
                <td className="py-3 px-3 text-xs text-neutral-500">
                  {new Date(m.created_at as string).toLocaleDateString('ja-JP')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
