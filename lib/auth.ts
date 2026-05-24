import { createClient } from '@/lib/supabase/server'

export async function isAuthed() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return !!user
}

export async function getCurrentMember() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('members')
    .select('member_code, member_number, is_admin')
    .eq('id', user.id)
    .single()

  if (!member) return null
  return {
    id: user.id,
    email: user.email ?? null,
    memberCode: member.member_code as string,
    memberNumber: member.member_number as number,
    isAdmin: (member.is_admin as boolean) ?? false,
  }
}

export async function requireAdmin() {
  const member = await getCurrentMember()
  if (!member) return { ok: false as const, reason: 'not_logged_in' as const }
  if (!member.isAdmin) return { ok: false as const, reason: 'not_admin' as const }
  return { ok: true as const, member }
}
