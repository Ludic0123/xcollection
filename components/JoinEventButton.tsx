'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function JoinEventButton({
  eventId,
  isJoined,
  isFull,
}: {
  eventId: string
  isJoined: boolean
  isFull: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handle() {
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('ログインが必要です')
      setBusy(false)
      return
    }
    if (isJoined) {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id)
      if (error) {
        setError(error.message)
        setBusy(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: user.id })
      if (error) {
        setError(error.message)
        setBusy(false)
        return
      }
    }
    router.refresh()
    setBusy(false)
  }

  if (isFull && !isJoined) {
    return (
      <button
        disabled
        className="text-[11px] tracking-luxe bg-neutral-300 text-white px-6 py-3 cursor-not-allowed"
      >
        FULL
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={handle}
        disabled={busy}
        className={`text-[11px] tracking-luxe px-6 py-3 disabled:opacity-50 ${
          isJoined
            ? 'border border-black bg-white text-black hover:bg-neutral-100'
            : 'bg-black text-white hover:bg-neutral-800'
        }`}
      >
        {busy ? '...' : isJoined ? 'CANCEL ATTENDANCE' : 'JOIN'}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
