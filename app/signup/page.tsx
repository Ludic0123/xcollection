import { createClient } from '@/lib/supabase/server'
import SignupForm from './SignupForm'

export const dynamic = 'force-dynamic'

export default async function SignupPage() {
  const supabase = await createClient()

  const [{ data: empty }, { data: genres }, { data: sakeTypes }, { data: freqs }] =
    await Promise.all([
      supabase.rpc('is_members_empty'),
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

  const isFirstUser = empty === true
  const favoriteGenreOptions = (genres ?? []).map((r: { name: string }) => r.name)
  const favoriteSakeTypeOptions = (sakeTypes ?? []).map((r: { name: string }) => r.name)
  const drinkingFrequencyOptions = (freqs ?? []).map((r: { name: string }) => r.name)

  return (
    <SignupForm
      isFirstUser={isFirstUser}
      favoriteGenreOptions={favoriteGenreOptions}
      favoriteSakeTypeOptions={favoriteSakeTypeOptions}
      drinkingFrequencyOptions={drinkingFrequencyOptions}
    />
  )
}
