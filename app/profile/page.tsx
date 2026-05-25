export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMember } from '@/lib/auth'
import CopyText from '@/components/CopyText'

export default async function ProfilePage() {
  const member = await getCurrentMember()
  if (!member) redirect('/login?redirect=/profile')

  const supabase = await createClient()
  const { data: full } = await supabase
    .from('members')
    .select(
      'last_name_kanji, first_name_kanji, last_name_kana, first_name_kana, phone, residence_1, residence_2, high_school, education, work_location, company, allergies, drinking_frequency, favorite_genres, favorite_sake_types, invited_by, created_at'
    )
    .eq('id', member.id)
    .single()

  // 招待者の情報
  let inviter: { name: string; number: number } | null = null
  if (full?.invited_by) {
    const { data } = await supabase
      .from('members')
      .select('member_number, last_name_kanji, first_name_kanji')
      .eq('id', full.invited_by)
      .single()
    if (data) {
      const name = [data.last_name_kanji, data.first_name_kanji].filter(Boolean).join(' ')
      inviter = {
        name: name || `メンバー ${data.member_number}`,
        number: data.member_number as number,
      }
    }
  }

  const displayName =
    [full?.last_name_kanji, full?.first_name_kanji].filter(Boolean).join(' ') || 'メンバー'

  return (
    <div className="bg-white min-h-[calc(100vh-6rem)]">
      {/* HERO */}
      <section className="px-8 md:px-16 pt-16 pb-12 border-b hairline">
        <p className="text-[10px] tracking-luxe text-neutral-400">PROFILE</p>
        <h1 className="font-serif text-5xl md:text-7xl italic font-light mt-3">
          {displayName}
        </h1>
        {(full?.last_name_kana || full?.first_name_kana) && (
          <p className="text-xs tracking-luxe text-neutral-400 mt-2">
            {[full.last_name_kana, full.first_name_kana].filter(Boolean).join(' ')}
          </p>
        )}
      </section>

      {/* MEMBERSHIP CARD */}
      <section className="px-8 md:px-16 py-12 border-b hairline">
        <p className="text-[10px] tracking-luxe text-neutral-400 mb-6">MEMBERSHIP</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="bg-black text-white p-8">
            <p className="text-[10px] tracking-luxe text-white/50">MEMBER NO.</p>
            <p className="font-mono text-4xl md:text-5xl tracking-widest mt-3">
              {String(member.memberNumber).padStart(3, '0')}
            </p>
            <CopyText value={String(member.memberNumber)} className="mt-4 text-white" />
          </div>
          <div className="bg-neutral-900 text-white p-8">
            <p className="text-[10px] tracking-luxe text-white/50">INVITATION CODE</p>
            <p className="font-mono text-2xl md:text-3xl tracking-[0.3em] mt-3">
              {member.memberCode}
            </p>
            <CopyText value={member.memberCode} className="mt-4 text-white" />
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-6 max-w-xl leading-relaxed">
          このサイトに友人を招待するときは、上の <span className="font-mono">MEMBER NO.</span> と{' '}
          <span className="font-mono">INVITATION CODE</span>{' '}
          の両方を伝えてください。相手は{' '}
          <Link href="/signup" className="underline">
            会員登録ページ
          </Link>{' '}
          で2つを入力すれば会員になれます。
        </p>
      </section>

      {/* INVITER */}
      {inviter && (
        <section className="px-8 md:px-16 py-10 border-b hairline">
          <p className="text-[10px] tracking-luxe text-neutral-400">INVITED BY</p>
          <p className="font-serif text-2xl mt-2">
            {inviter.name}{' '}
            <span className="text-sm text-neutral-400 font-sans font-light ml-2">
              MEMBER NO.{String(inviter.number).padStart(3, '0')}
            </span>
          </p>
        </section>
      )}

      {/* DETAILS */}
      <section className="px-8 md:px-16 py-12 border-b hairline">
        <p className="text-[10px] tracking-luxe text-neutral-400 mb-6">DETAILS</p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 max-w-3xl text-sm">
          {member.email && (
            <Row label="メール" value={member.email} />
          )}
          {full?.phone && <Row label="電話" value={full.phone} />}
          {full?.residence_1 && (
            <Row
              label="居住地"
              value={[full.residence_1, full.residence_2].filter(Boolean).join(' / ')}
            />
          )}
          {full?.work_location && <Row label="勤務地" value={full.work_location} />}
          {full?.company && <Row label="勤務先" value={full.company} />}
          {full?.high_school && <Row label="出身高校" value={full.high_school} />}
          {full?.education && <Row label="最終学歴" value={full.education} />}
          {full?.drinking_frequency && (
            <Row label="酒を飲む頻度" value={full.drinking_frequency} />
          )}
          {full?.favorite_genres && (
            <Row label="好きなジャンル" value={full.favorite_genres} />
          )}
          {full?.favorite_sake_types && (
            <Row label="好きな酒の種類" value={full.favorite_sake_types} />
          )}
          {full?.allergies && <Row label="アレルギー" value={full.allergies} />}
          {full?.created_at && (
            <Row
              label="登録日"
              value={new Date(full.created_at).toLocaleDateString('ja-JP')}
            />
          )}
        </dl>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] tracking-luxe text-neutral-400">{label}</dt>
      <dd className="font-serif text-base mt-1 break-words">{value}</dd>
    </div>
  )
}
