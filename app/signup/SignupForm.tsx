'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  PREFECTURES,
  EDUCATION_LEVELS,
  DRINKING_FREQUENCIES,
  FAVORITE_GENRE_OPTIONS,
  FAVORITE_SAKE_TYPE_OPTIONS,
} from '@/types/profile'

type Inviter = { memberNumber: number; name: string }

export default function SignupForm({ isFirstUser }: { isFirstUser: boolean }) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)

  // Step1
  const [memberNumber, setMemberNumber] = useState('')
  const [code, setCode] = useState('')
  const [lastNameKanji, setLastNameKanji] = useState('')
  const [firstNameKanji, setFirstNameKanji] = useState('')
  const [lastNameKana, setLastNameKana] = useState('')
  const [firstNameKana, setFirstNameKana] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviter, setInviter] = useState<Inviter | null>(null)

  // Step2
  const [residence1, setResidence1] = useState('')
  const [residence2, setResidence2] = useState('')
  const [highSchool, setHighSchool] = useState('')
  const [education, setEducation] = useState('')
  const [company, setCompany] = useState('')
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([])
  const [allergies, setAllergies] = useState('')
  const [drinkingFrequency, setDrinkingFrequency] = useState('')
  const [favoriteSakeTypes, setFavoriteSakeTypes] = useState<string[]>([])

  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function toggleArr(value: string, list: string[], setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    let inviterData: Inviter | null = null

    if (!isFirstUser) {
      const num = Number(memberNumber.trim())
      const trimmedCode = code.trim().toUpperCase()
      if (!Number.isFinite(num) || num <= 0) {
        setError('会員番号は数字で入力してください')
        setLoading(false)
        return
      }
      const { data, error: rpcError } = await supabase.rpc('get_inviter_info', {
        num,
        code: trimmedCode,
      })
      if (rpcError) {
        setError('検証エラー: ' + rpcError.message)
        setLoading(false)
        return
      }
      const info = data as {
        valid: boolean
        member_number?: number
        last_name?: string | null
        first_name?: string | null
      }
      if (!info?.valid) {
        setError('会員番号または招待コードが正しくありません')
        setLoading(false)
        return
      }
      inviterData = {
        memberNumber: info.member_number ?? num,
        name:
          [info.last_name, info.first_name].filter(Boolean).join(' ') ||
          `メンバー ${info.member_number ?? num}`,
      }
    }

    setInviter(inviterData)
    setLoading(false)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    const supabase = createClient()

    if (favoriteGenres.length === 0) {
      setError('好きなジャンルを1つ以上選んでください')
      setLoading(false)
      return
    }
    if (favoriteSakeTypes.length === 0) {
      setError('好きな酒の種類を1つ以上選んでください')
      setLoading(false)
      return
    }

    const metadata: Record<string, string | number> = {
      last_name_kanji: lastNameKanji.trim(),
      first_name_kanji: firstNameKanji.trim(),
      last_name_kana: lastNameKana.trim(),
      first_name_kana: firstNameKana.trim(),
      residence_1: residence1,
      residence_2: residence2,
      high_school: highSchool.trim(),
      education,
      company: company.trim(),
      favorite_genres: favoriteGenres.join(','),
      allergies: allergies.trim(),
      drinking_frequency: drinkingFrequency,
      favorite_sake_types: favoriteSakeTypes.join(','),
    }

    if (!isFirstUser) {
      metadata.invited_by_code = code.trim().toUpperCase()
      metadata.invited_by_number = Number(memberNumber.trim())
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
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="w-full max-w-lg mx-auto">
        <Link href="/" className="block text-center mb-10">
          <p className="text-[10px] tracking-luxe text-neutral-400">COLLECTION</p>
          <h1 className="font-serif text-3xl italic font-light mt-2">
            {isFirstUser ? 'Founder.' : step === 1 ? 'Join.' : 'About you.'}
          </h1>
          <p className="text-[10px] tracking-luxe text-neutral-400 mt-4">
            {isFirstUser
              ? 'FIRST ADMIN REGISTRATION'
              : `STEP ${step} OF 2 · ${step === 1 ? 'BASIC' : 'PROFILE'}`}
          </p>
        </Link>

        {inviter && step === 2 && (
          <div className="border hairline p-4 mb-6 text-center bg-neutral-50">
            <p className="text-[10px] tracking-luxe text-neutral-400">INVITED BY</p>
            <p className="font-serif text-lg mt-1">{inviter.name}</p>
            <p className="text-[10px] tracking-luxe text-neutral-400 mt-1">
              MEMBER NO. {String(inviter.memberNumber)}
            </p>
          </div>
        )}

        {/* ============ STEP 1 ============ */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-6">
            {!isFirstUser && (
              <>
                <Field label="INVITER'S MEMBER NO.">
                  <input
                    type="number"
                    required
                    value={memberNumber}
                    onChange={(e) => setMemberNumber(e.target.value)}
                    placeholder="例: 18900000"
                    className={inputClass + ' font-mono'}
                  />
                </Field>
                <Field label="INVITATION CODE">
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="例: A3F9K2X1"
                    className={inputClass + ' font-mono uppercase tracking-wider'}
                  />
                </Field>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="姓（漢字）">
                <input
                  required
                  value={lastNameKanji}
                  onChange={(e) => setLastNameKanji(e.target.value)}
                  placeholder="例: 山田"
                  className={inputClass}
                />
              </Field>
              <Field label="名（漢字）">
                <input
                  required
                  value={firstNameKanji}
                  onChange={(e) => setFirstNameKanji(e.target.value)}
                  placeholder="例: 太郎"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="姓（フリガナ）">
                <input
                  required
                  value={lastNameKana}
                  onChange={(e) => setLastNameKana(e.target.value)}
                  placeholder="例: ヤマダ"
                  className={inputClass}
                />
              </Field>
              <Field label="名（フリガナ）">
                <input
                  required
                  value={firstNameKana}
                  onChange={(e) => setFirstNameKana(e.target.value)}
                  placeholder="例: タロウ"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="EMAIL">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="PASSWORD (6文字以上)">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </Field>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-[11px] tracking-luxe bg-black text-white py-3 hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? 'CHECKING…' : 'NEXT →'}
            </button>
          </form>
        )}

        {/* ============ STEP 2 ============ */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="居住地 ①">
              <select
                required
                value={residence1}
                onChange={(e) => setResidence1(e.target.value)}
                className={inputClass}
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="居住地 ②（任意）">
              <select
                value={residence2}
                onChange={(e) => setResidence2(e.target.value)}
                className={inputClass}
              >
                <option value="">なし</option>
                {PREFECTURES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="出身高校">
              <input
                required
                value={highSchool}
                onChange={(e) => setHighSchool(e.target.value)}
                placeholder="例: ○○高等学校"
                className={inputClass}
              />
            </Field>

            <Field label="最終学歴">
              <select
                required
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className={inputClass}
              >
                <option value="">選択してください</option>
                {EDUCATION_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="勤務先企業名">
              <input
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="例: ○○株式会社"
                className={inputClass}
              />
            </Field>

            <Field label="好きなジャンル（複数選択可・1つ以上必須）">
              <div className="flex flex-wrap gap-2">
                {FAVORITE_GENRE_OPTIONS.map((g) => {
                  const active = favoriteGenres.includes(g)
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleArr(g, favoriteGenres, setFavoriteGenres)}
                      className={chipClass(active)}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
            </Field>

            <Field label="アレルギー・苦手な食材">
              <input
                required
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="例: 甲殻類アレルギー / なし"
                className={inputClass}
              />
            </Field>

            <Field label="酒を飲む頻度">
              <select
                required
                value={drinkingFrequency}
                onChange={(e) => setDrinkingFrequency(e.target.value)}
                className={inputClass}
              >
                <option value="">選択してください</option>
                {DRINKING_FREQUENCIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="好きな酒の種類（複数選択可・1つ以上必須）">
              <div className="flex flex-wrap gap-2">
                {FAVORITE_SAKE_TYPE_OPTIONS.map((s) => {
                  const active = favoriteSakeTypes.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleArr(s, favoriteSakeTypes, setFavoriteSakeTypes)}
                      className={chipClass(active)}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </Field>

            {error && <p className="text-xs text-red-600">{error}</p>}
            {message && <p className="text-xs text-green-700">{message}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] tracking-luxe border border-black px-4 py-3 hover:bg-neutral-100"
              >
                ← BACK
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 text-[11px] tracking-luxe bg-black text-white py-3 hover:bg-neutral-800 disabled:opacity-50"
              >
                {loading ? 'REGISTERING…' : 'COMPLETE REGISTRATION'}
              </button>
            </div>
          </form>
        )}

        <p className="text-[10px] tracking-luxe text-neutral-400 mt-10 text-center">
          <Link href="/login" className="hover:text-black">SIGN IN INSTEAD →</Link>
        </p>
      </div>
    </div>
  )
}

const inputClass =
  'w-full border-b hairline bg-transparent px-1 py-2 text-sm focus:outline-none focus:border-black'

function chipClass(active: boolean) {
  return `text-xs px-3 py-1.5 border hairline transition-colors ${
    active ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 hover:border-black'
  }`
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] tracking-luxe text-neutral-400 mb-2">{label}</p>
      {children}
    </div>
  )
}
