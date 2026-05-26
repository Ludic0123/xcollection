export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: m } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()
  if (!m) notFound()

  // 招待者を逆引き
  let inviter: { name: string; number: number } | null = null
  if (m.invited_by) {
    const { data: inv } = await supabase
      .from('members')
      .select('member_number, last_name_kanji, first_name_kanji')
      .eq('id', m.invited_by)
      .single()
    if (inv) {
      const name = [inv.last_name_kanji, inv.first_name_kanji].filter(Boolean).join(' ')
      inviter = {
        name: name || `メンバー ${inv.member_number}`,
        number: inv.member_number as number,
      }
    }
  }

  const fullName = [m.last_name_kanji, m.first_name_kanji].filter(Boolean).join(' ') || '(未入力)'
  const fullKana = [m.last_name_kana, m.first_name_kana].filter(Boolean).join(' ')

  return (
    <div className="px-4 py-6 md:px-10 md:py-10 max-w-4xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK
      </Link>

      <p className="text-[10px] tracking-luxe text-neutral-400">
        MEMBER NO. {String(m.member_number).padStart(3, '0')}
        {m.is_admin && <span className="ml-3 px-2 py-0.5 bg-black text-white">ADMIN</span>}
      </p>
      <h1 className="font-serif text-4xl md:text-5xl italic font-light mt-2">{fullName}</h1>
      {fullKana && (
        <p className="text-xs tracking-luxe text-neutral-400 mt-1">{fullKana}</p>
      )}

      {/* MEMBERSHIP */}
      <section className="mt-8 border-t hairline pt-6">
        <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">MEMBERSHIP</p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
          <Row label="会員番号">{String(m.member_number).padStart(3, '0')}</Row>
          <Row label="招待コード">
            <span className="font-mono">{m.member_code}</span>
          </Row>
          {inviter && (
            <Row label="招待者">
              {inviter.name}{' '}
              <span className="text-neutral-400 text-xs ml-1">
                (No.{String(inviter.number).padStart(3, '0')})
              </span>
            </Row>
          )}
          <Row label="登録日">{new Date(m.created_at).toLocaleString('ja-JP')}</Row>
        </dl>
      </section>

      {/* CONTACT */}
      <section className="mt-8 border-t hairline pt-6">
        <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">CONTACT</p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
          {m.phone && <Row label="電話">{m.phone}</Row>}
        </dl>
      </section>

      {/* NAME (full) */}
      <section className="mt-8 border-t hairline pt-6">
        <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">NAME</p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
          {m.last_name_kanji && <Row label="姓（漢字）">{m.last_name_kanji}</Row>}
          {m.first_name_kanji && <Row label="名（漢字）">{m.first_name_kanji}</Row>}
          {m.last_name_kana && <Row label="姓（フリガナ）">{m.last_name_kana}</Row>}
          {m.first_name_kana && <Row label="名（フリガナ）">{m.first_name_kana}</Row>}
        </dl>
      </section>

      {/* RESIDENCE / WORK */}
      <section className="mt-8 border-t hairline pt-6">
        <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">RESIDENCE & WORK</p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
          {m.residence_1 && <Row label="居住地①">{m.residence_1}</Row>}
          {m.residence_2 && <Row label="居住地②">{m.residence_2}</Row>}
          {m.work_location && <Row label="勤務地">{m.work_location}</Row>}
          {m.company && <Row label="勤務先企業">{m.company}</Row>}
        </dl>
      </section>

      {/* EDUCATION */}
      <section className="mt-8 border-t hairline pt-6">
        <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">EDUCATION</p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
          {m.high_school && <Row label="出身高校">{m.high_school}</Row>}
          {m.education && <Row label="最終学歴">{m.education}</Row>}
        </dl>
      </section>

      {/* PREFERENCES */}
      <section className="mt-8 border-t hairline pt-6">
        <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">PREFERENCES</p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
          {m.favorite_genres && <Row label="好きなジャンル">{m.favorite_genres}</Row>}
          {m.favorite_sake_types && (
            <Row label="好きな酒の種類">{m.favorite_sake_types}</Row>
          )}
          {m.drinking_frequency && (
            <Row label="酒を飲む頻度">{m.drinking_frequency}</Row>
          )}
          {m.allergies && <Row label="アレルギー">{m.allergies}</Row>}
        </dl>
      </section>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] tracking-luxe text-neutral-400">{label}</dt>
      <dd className="font-serif text-base mt-1 break-words">{children}</dd>
    </div>
  )
}
