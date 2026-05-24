'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // ?redirect= があれば優先。なければ admin/通常ユーザーで分岐
    const redirectParam = sp.get('redirect')
    let target = redirectParam ?? '/'
    if (!redirectParam && data.user) {
      const { data: member } = await supabase
        .from('members')
        .select('is_admin')
        .eq('id', data.user.id)
        .single()
      if (member?.is_admin) target = '/admin'
    }
    setLoading(false)
    router.push(target)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-12">
          <p className="text-[10px] tracking-luxe text-neutral-400">COLLECTION</p>
          <h1 className="font-serif text-3xl italic font-light mt-2">Editor.</h1>
        </Link>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-[10px] tracking-luxe text-neutral-400 mb-2">EMAIL</p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b hairline bg-transparent px-1 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <p className="text-[10px] tracking-luxe text-neutral-400 mb-2">PASSWORD</p>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b hairline bg-transparent px-1 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-[11px] tracking-luxe bg-black text-white py-3 hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? 'SIGNING IN…' : 'SIGN IN'}
          </button>
        </form>
        <p className="text-[10px] tracking-luxe text-neutral-400 mt-10 text-center">
          <Link href="/" className="hover:text-black">← BACK TO SITE</Link>
        </p>
      </div>
    </div>
  )
}
