'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminSignOut() {
  const router = useRouter()
  async function handle() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }
  return (
    <button
      onClick={handle}
      className="text-[10px] tracking-luxe text-neutral-400 hover:text-black"
    >
      SIGN OUT
    </button>
  )
}
