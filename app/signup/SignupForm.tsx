'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm({ isFirstUser }: { isFirstUser: boolean }) {
  const router = useRouter()
  const [memberNumber, setMemberNumber] = useState('')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    const supabase = createClient()

    let metadata: Record<string, unknown> = {}

    if (!isFirstUser) {
      const num = Number(memberNumber.trim())
      const trimmedCode = code.trim().toUpperCase()
      if (!Number.isFinite(num) || num <= 0) {
        setError('会員番号は正の数字で入力してください')
        setLoading(false)
        return
      }
      const { data: valid, error: rpcError } = await supabase.rpc('validate_invitation', {
        num,
        code: trimmedCode,
      })
      if (rpcError) {
        setError('検証エラー: ' + rpcError.message)
        setLoading(false)
        return
      }
      if (!valid) {
        setError('会員番号または招待コードが正しくありません')
        setLoading(false)
        return
      }
      metadata = { invited_by_code: trimmedCode, invited_by_number: num }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      setMessage('確認メールを送信しました。リンクをクリックしてからログインしてください。')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-12">
          <p className="text-[10px] tracking-luxe text-neutral-400">COLLECTION</p>
          <h1 className="font-serif text-3xl italic font-light mt-2">
            {isFirstUser ? 'Founder.' : 'Join.'}
          </h1>
          <p className="text-[10px] tracking-luxe text-neutral-400 mt-4">
            {isFirstUser ? 'FIRST ADMIN REGISTRATION' : 'BY INVITATION ONLY'}
          </p>
        </Link>

        {isFirstUser && (
          <p className="text-xs text-neutral-500 mb-6 leading-relaxed text-center">
            あなたはこのサイトの最初の管理者として登録されます。<br />
            一度登録すると、以降は招待コードでしかメンバーになれません。
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isFirstUser && (
            <>
              <div>
                <p className="text-[10px] tracking-luxe text-neutral-400 mb-2">
                  INVITER&apos;S MEMBER NO.
                </p>
                <input
                  type="number"
                  required
                  value={memberNumber}
                  onChange={(e) => setMemberNumber(e.target.value)}
                  placeholder="例: 1"
                  className="w-full border-b hairline bg-transparent px-1 py-2 text-sm font-mono focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <p className="text-[10px] tracking-luxe text-neutral-400 mb-2">INVITATION CODE</p>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="例: A3F9K2X1"
                  className="w-full border-b hairline bg-transparent px-1 py-2 text-sm uppercase tracking-wider font-mono focus:outline-none focus:border-black"
                />
              </div>
            </>
          )}
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
            <p className="text-[10px] tracking-luxe text-neutral-400 mb-2">PASSWORD (6+ CHARS)</p>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b hairline bg-transparent px-1 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {message && <p className="text-xs text-green-700">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-[11px] tracking-luxe bg-black text-white py-3 hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading
              ? 'REGISTERING…'
              : isFirstUser
              ? 'CREATE ADMIN ACCOUNT'
              : 'REGISTER'}
          </button>
        </form>
        <p className="text-[10px] tracking-luxe text-neutral-400 mt-10 text-center">
          <Link href="/login" className="hover:text-black">SIGN IN INSTEAD →</Link>
        </p>
      </div>
    </div>
  )
}
