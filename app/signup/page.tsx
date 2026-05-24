import { createClient } from '@/lib/supabase/server'
import SignupForm from './SignupForm'

export default async function SignupPage() {
  const supabase = await createClient()
  // members が0人なら最初の管理者モード (招待コード不要)
  // RLS で anon は members を直接見れないので RPC を使う
  const { data: empty } = await supabase.rpc('is_members_empty')
  const isFirstUser = empty === true
  return <SignupForm isFirstUser={isFirstUser} />
}
