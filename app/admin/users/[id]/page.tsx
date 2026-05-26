export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import MemberDetailEditor from './MemberDetailEditor'

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

  // signup option masters
  const [{ data: genres }, { data: sakes }, { data: freqs }] = await Promise.all([
    supabase
      .from('master_signup_favorite_genres')
      .select('name')
      .order('display_order')
      .order('name'),
    supabase
      .from('master_signup_favorite_sake_types')
      .select('name')
      .order('display_order')
      .order('name'),
    supabase
      .from('master_drinking_frequencies')
      .select('name')
      .order('display_order')
      .order('name'),
  ])

  return (
    <div className="px-4 py-6 md:px-10 md:py-10 max-w-4xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK
      </Link>

      <MemberDetailEditor
        member={m}
        inviter={inviter}
        favoriteGenreOptions={(genres ?? []).map((r: { name: string }) => r.name)}
        favoriteSakeTypeOptions={(sakes ?? []).map((r: { name: string }) => r.name)}
        drinkingFrequencyOptions={(freqs ?? []).map((r: { name: string }) => r.name)}
      />
    </div>
  )
}
