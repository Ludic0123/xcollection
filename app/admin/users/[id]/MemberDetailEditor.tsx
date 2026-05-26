'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PREFECTURES, WORK_LOCATIONS } from '@/types/profile'

type Member = {
  id: string
  member_number: number
  member_code: string
  is_admin: boolean
  email: string | null
  phone: string | null
  last_name_kanji: string | null
  first_name_kanji: string | null
  last_name_kana: string | null
  first_name_kana: string | null
  residence_1: string | null
  residence_2: string | null
  work_location: string | null
  company: string | null
  high_school: string | null
  education: string | null
  favorite_genres: string | null
  favorite_sake_types: string | null
  drinking_frequency: string | null
  allergies: string | null
  best_restaurant_1: string | null
  best_restaurant_2: string | null
  best_restaurant_3: string | null
  created_at: string
}

export default function MemberDetailEditor({
  member,
  inviter,
  favoriteGenreOptions,
  favoriteSakeTypeOptions,
  drinkingFrequencyOptions,
}: {
  member: Member
  inviter: { name: string; number: number } | null
  favoriteGenreOptions: string[]
  favoriteSakeTypeOptions: string[]
  drinkingFrequencyOptions: string[]
}) {
  const router = useRouter()
  const m = member

  async function save(payload: Partial<Member>) {
    const supabase = createClient()
    const { error } = await supabase.from('members').update(payload).eq('id', m.id)
    if (error) {
      alert('保存エラー: ' + error.message)
      return false
    }
    router.refresh()
    return true
  }

  const fullName = [m.last_name_kanji, m.first_name_kanji].filter(Boolean).join(' ') || '(未入力)'
  const fullKana = [m.last_name_kana, m.first_name_kana].filter(Boolean).join(' ')

  return (
    <>
      <p className="text-[10px] tracking-luxe text-neutral-400">
        MEMBER NO. {String(m.member_number).padStart(3, '0')}
        {m.is_admin && <span className="ml-3 px-2 py-0.5 bg-black text-white">ADMIN</span>}
      </p>
      <h1 className="font-serif text-4xl md:text-5xl italic font-light mt-2">{fullName}</h1>
      {fullKana && (
        <p className="text-xs tracking-luxe text-neutral-400 mt-1">{fullKana}</p>
      )}

      {/* MEMBERSHIP */}
      <MembershipSection member={m} inviter={inviter} onSave={save} />

      {/* CONTACT */}
      <ContactSection member={m} onSave={save} />

      {/* NAME */}
      <NameSection member={m} onSave={save} />

      {/* RESIDENCE & WORK */}
      <ResidenceWorkSection member={m} onSave={save} />

      {/* EDUCATION */}
      <EducationSection member={m} onSave={save} />

      {/* PREFERENCES */}
      <PreferencesSection
        member={m}
        favoriteGenreOptions={favoriteGenreOptions}
        favoriteSakeTypeOptions={favoriteSakeTypeOptions}
        drinkingFrequencyOptions={drinkingFrequencyOptions}
        onSave={save}
      />

      {/* BEST RESTAURANTS */}
      <BestRestaurantsSection member={m} onSave={save} />
    </>
  )
}

// ============================================================
// SECTION FRAME
// ============================================================
function SectionFrame({
  title,
  editing,
  setEditing,
  saving,
  onSave,
  children,
  hideEdit,
}: {
  title: string
  editing: boolean
  setEditing: (v: boolean) => void
  saving: boolean
  onSave: () => Promise<void>
  children: React.ReactNode
  hideEdit?: boolean
}) {
  return (
    <section className="mt-8 border-t hairline pt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] tracking-luxe text-neutral-400">{title}</p>
        {!hideEdit && (
          editing ? (
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="text-[10px] tracking-luxe text-neutral-400 hover:text-black"
              >
                CANCEL
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="text-[10px] tracking-luxe bg-black text-white px-3 py-1.5 hover:bg-neutral-800 disabled:opacity-50"
              >
                {saving ? 'SAVING…' : 'SAVE'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
            >
              EDIT
            </button>
          )
        )}
      </div>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] tracking-luxe text-neutral-400">{label}</dt>
      <dd className="font-serif text-base mt-1 break-words">{children}</dd>
    </div>
  )
}

const inputClass =
  'w-full border-b hairline bg-transparent px-1 py-2 text-sm focus:outline-none focus:border-black'

function chipClass(active: boolean, disabled?: boolean) {
  return `text-xs px-3 py-1.5 border hairline transition-colors ${
    active
      ? 'bg-black text-white border-black'
      : disabled
      ? 'bg-neutral-50 text-neutral-300 border-neutral-200 cursor-not-allowed'
      : 'bg-white text-neutral-600 hover:border-black'
  }`
}

// ============================================================
// MEMBERSHIP (is_admin のみ編集)
// ============================================================
function MembershipSection({
  member: m,
  inviter,
  onSave,
}: {
  member: Member
  inviter: { name: string; number: number } | null
  onSave: (p: Partial<Member>) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(m.is_admin)

  async function handleSave() {
    setSaving(true)
    const ok = await onSave({ is_admin: isAdmin })
    setSaving(false)
    if (ok) setEditing(false)
  }

  return (
    <SectionFrame
      title="MEMBERSHIP"
      editing={editing}
      setEditing={(v) => {
        if (v) setIsAdmin(m.is_admin)
        setEditing(v)
      }}
      saving={saving}
      onSave={handleSave}
    >
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
        <Row label="会員番号">{String(m.member_number).padStart(3, '0')}</Row>
        <Row label="招待コード">
          <span className="font-mono">{m.member_code}</span>
        </Row>
        {inviter && (
          <Row label="招待者">
            {inviter.name}{' '}
            <span className="text-neutral-400 text-xs ml-1">
              (No.{String(inviter.number).padStart(3, '0')})
            </span>
          </Row>
        )}
        <Row label="登録日">{new Date(m.created_at).toLocaleString('ja-JP')}</Row>
        <Row label="権限">
          {editing ? (
            <label className="flex items-center gap-2 text-sm font-sans">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <span>管理者にする</span>
            </label>
          ) : m.is_admin ? (
            <span className="px-2 py-0.5 bg-black text-white text-xs">ADMIN</span>
          ) : (
            <span className="text-neutral-400">一般会員</span>
          )}
        </Row>
      </dl>
    </SectionFrame>
  )
}

// ============================================================
// CONTACT (phone のみ編集 / email は表示のみ)
// ============================================================
function ContactSection({
  member: m,
  onSave,
}: {
  member: Member
  onSave: (p: Partial<Member>) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [phone, setPhone] = useState(m.phone ?? '')

  async function handleSave() {
    setSaving(true)
    const ok = await onSave({ phone: phone.trim() || null })
    setSaving(false)
    if (ok) setEditing(false)
  }

  return (
    <SectionFrame
      title="CONTACT"
      editing={editing}
      setEditing={(v) => {
        if (v) setPhone(m.phone ?? '')
        setEditing(v)
      }}
      saving={saving}
      onSave={handleSave}
    >
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
        <Row label="メール">
          {m.email || <span className="text-neutral-300">未登録</span>}
          {editing && (
            <span className="block text-[10px] text-neutral-300 mt-1">（編集不可）</span>
          )}
        </Row>
        <Row label="電話">
          {editing ? (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          ) : (
            m.phone || <span className="text-neutral-300">未登録</span>
          )}
        </Row>
      </dl>
    </SectionFrame>
  )
}

// ============================================================
// NAME
// ============================================================
function NameSection({
  member: m,
  onSave,
}: {
  member: Member
  onSave: (p: Partial<Member>) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastKanji, setLastKanji] = useState(m.last_name_kanji ?? '')
  const [firstKanji, setFirstKanji] = useState(m.first_name_kanji ?? '')
  const [lastKana, setLastKana] = useState(m.last_name_kana ?? '')
  const [firstKana, setFirstKana] = useState(m.first_name_kana ?? '')

  function reset() {
    setLastKanji(m.last_name_kanji ?? '')
    setFirstKanji(m.first_name_kanji ?? '')
    setLastKana(m.last_name_kana ?? '')
    setFirstKana(m.first_name_kana ?? '')
  }

  async function handleSave() {
    setSaving(true)
    const ok = await onSave({
      last_name_kanji: lastKanji.trim() || null,
      first_name_kanji: firstKanji.trim() || null,
      last_name_kana: lastKana.trim() || null,
      first_name_kana: firstKana.trim() || null,
    })
    setSaving(false)
    if (ok) setEditing(false)
  }

  return (
    <SectionFrame
      title="NAME"
      editing={editing}
      setEditing={(v) => {
        if (v) reset()
        setEditing(v)
      }}
      saving={saving}
      onSave={handleSave}
    >
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
        <Row label="姓（漢字）">
          {editing ? (
            <input value={lastKanji} onChange={(e) => setLastKanji(e.target.value)} className={inputClass} />
          ) : (
            m.last_name_kanji || <span className="text-neutral-300">未登録</span>
          )}
        </Row>
        <Row label="名（漢字）">
          {editing ? (
            <input value={firstKanji} onChange={(e) => setFirstKanji(e.target.value)} className={inputClass} />
          ) : (
            m.first_name_kanji || <span className="text-neutral-300">未登録</span>
          )}
        </Row>
        <Row label="姓（フリガナ）">
          {editing ? (
            <input value={lastKana} onChange={(e) => setLastKana(e.target.value)} className={inputClass} />
          ) : (
            m.last_name_kana || <span className="text-neutral-300">未登録</span>
          )}
        </Row>
        <Row label="名（フリガナ）">
          {editing ? (
            <input value={firstKana} onChange={(e) => setFirstKana(e.target.value)} className={inputClass} />
          ) : (
            m.first_name_kana || <span className="text-neutral-300">未登録</span>
          )}
        </Row>
      </dl>
    </SectionFrame>
  )
}

// ============================================================
// RESIDENCE & WORK
// ============================================================
function ResidenceWorkSection({
  member: m,
  onSave,
}: {
  member: Member
  onSave: (p: Partial<Member>) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [residence1, setResidence1] = useState(m.residence_1 ?? '')
  const [residence2, setResidence2] = useState(m.residence_2 ?? '')
  const [workLocation, setWorkLocation] = useState(m.work_location ?? '')
  const [company, setCompany] = useState(m.company ?? '')

  function reset() {
    setResidence1(m.residence_1 ?? '')
    setResidence2(m.residence_2 ?? '')
    setWorkLocation(m.work_location ?? '')
    setCompany(m.company ?? '')
  }

  async function handleSave() {
    setSaving(true)
    const ok = await onSave({
      residence_1: residence1 || null,
      residence_2: residence2 || null,
      work_location: workLocation || null,
      company: company.trim() || null,
    })
    setSaving(false)
    if (ok) setEditing(false)
  }

  return (
    <SectionFrame
      title="RESIDENCE & WORK"
      editing={editing}
      setEditing={(v) => {
        if (v) reset()
        setEditing(v)
      }}
      saving={saving}
      onSave={handleSave}
    >
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
        <Row label="居住地①">
          {editing ? (
            <select value={residence1} onChange={(e) => setResidence1(e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          ) : (
            m.residence_1 || <span className="text-neutral-300">未登録</span>
          )}
        </Row>
        <Row label="居住地②">
          {editing ? (
            <select value={residence2} onChange={(e) => setResidence2(e.target.value)} className={inputClass}>
              <option value="">なし</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          ) : (
            m.residence_2 || <span className="text-neutral-300">なし</span>
          )}
        </Row>
        <Row label="勤務地">
          {editing ? (
            <select value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {WORK_LOCATIONS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          ) : (
            m.work_location || <span className="text-neutral-300">未登録</span>
          )}
        </Row>
        <Row label="勤務先（企業名）">
          {editing ? (
            <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
          ) : (
            m.company || <span className="text-neutral-300">未登録</span>
          )}
        </Row>
      </dl>
    </SectionFrame>
  )
}

// ============================================================
// EDUCATION
// ============================================================
function EducationSection({
  member: m,
  onSave,
}: {
  member: Member
  onSave: (p: Partial<Member>) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [highSchool, setHighSchool] = useState(m.high_school ?? '')
  const [education, setEducation] = useState(m.education ?? '')

  function reset() {
    setHighSchool(m.high_school ?? '')
    setEducation(m.education ?? '')
  }

  async function handleSave() {
    setSaving(true)
    const ok = await onSave({
      high_school: highSchool.trim() || null,
      education: education.trim() || null,
    })
    setSaving(false)
    if (ok) setEditing(false)
  }

  return (
    <SectionFrame
      title="EDUCATION"
      editing={editing}
      setEditing={(v) => {
        if (v) reset()
        setEditing(v)
      }}
      saving={saving}
      onSave={handleSave}
    >
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
        <Row label="出身高校">
          {editing ? (
            <input value={highSchool} onChange={(e) => setHighSchool(e.target.value)} className={inputClass} />
          ) : (
            m.high_school || <span className="text-neutral-300">未登録</span>
          )}
        </Row>
        <Row label="最終学歴">
          {editing ? (
            <input value={education} onChange={(e) => setEducation(e.target.value)} className={inputClass} />
          ) : (
            m.education || <span className="text-neutral-300">未登録</span>
          )}
        </Row>
      </dl>
    </SectionFrame>
  )
}

// ============================================================
// PREFERENCES (favorite_genres / favorite_sake_types / drinking_frequency / allergies)
// ============================================================
// ============================================================
// BEST RESTAURANTS (任意 3枠)
// ============================================================
function BestRestaurantsSection({
  member: m,
  onSave,
}: {
  member: Member
  onSave: (p: Partial<Member>) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [r1, setR1] = useState(m.best_restaurant_1 ?? '')
  const [r2, setR2] = useState(m.best_restaurant_2 ?? '')
  const [r3, setR3] = useState(m.best_restaurant_3 ?? '')

  function reset() {
    setR1(m.best_restaurant_1 ?? '')
    setR2(m.best_restaurant_2 ?? '')
    setR3(m.best_restaurant_3 ?? '')
  }

  async function handleSave() {
    setSaving(true)
    const ok = await onSave({
      best_restaurant_1: r1.trim() || null,
      best_restaurant_2: r2.trim() || null,
      best_restaurant_3: r3.trim() || null,
    })
    setSaving(false)
    if (ok) setEditing(false)
  }

  const items = [
    { label: '①', value: m.best_restaurant_1 },
    { label: '②', value: m.best_restaurant_2 },
    { label: '③', value: m.best_restaurant_3 },
  ]
  const setters = [setR1, setR2, setR3]
  const values = [r1, r2, r3]

  return (
    <SectionFrame
      title="BEST RESTAURANTS"
      editing={editing}
      setEditing={(v) => {
        if (v) reset()
        setEditing(v)
      }}
      saving={saving}
      onSave={handleSave}
    >
      <dl className="space-y-4 text-sm">
        {items.map((it, i) => (
          <Row key={i} label={`人生最高レストラン ${it.label}`}>
            {editing ? (
              <input
                value={values[i]}
                onChange={(e) => setters[i](e.target.value)}
                placeholder="記入なしの場合は空欄"
                className={inputClass}
              />
            ) : (
              it.value || <span className="text-neutral-300">未記入</span>
            )}
          </Row>
        ))}
      </dl>
    </SectionFrame>
  )
}

function PreferencesSection({
  member: m,
  favoriteGenreOptions,
  favoriteSakeTypeOptions,
  drinkingFrequencyOptions,
  onSave,
}: {
  member: Member
  favoriteGenreOptions: string[]
  favoriteSakeTypeOptions: string[]
  drinkingFrequencyOptions: string[]
  onSave: (p: Partial<Member>) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [genres, setGenres] = useState<string[]>(
    (m.favorite_genres ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  )
  const [sakes, setSakes] = useState<string[]>(
    (m.favorite_sake_types ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  )
  const [freq, setFreq] = useState(m.drinking_frequency ?? '')
  const [allergies, setAllergies] = useState(m.allergies ?? '')

  function reset() {
    setGenres((m.favorite_genres ?? '').split(',').map((s) => s.trim()).filter(Boolean))
    setSakes((m.favorite_sake_types ?? '').split(',').map((s) => s.trim()).filter(Boolean))
    setFreq(m.drinking_frequency ?? '')
    setAllergies(m.allergies ?? '')
  }

  async function handleSave() {
    setSaving(true)
    const ok = await onSave({
      favorite_genres: genres.length > 0 ? genres.join(',') : null,
      favorite_sake_types: sakes.length > 0 ? sakes.join(',') : null,
      drinking_frequency: freq || null,
      allergies: allergies.trim() || null,
    })
    setSaving(false)
    if (ok) setEditing(false)
  }

  function toggleGenre(g: string) {
    setGenres(genres.includes(g) ? genres.filter((v) => v !== g) : [...genres, g])
  }

  function toggleSake(s: string) {
    if (sakes.includes(s)) {
      setSakes(sakes.filter((v) => v !== s))
    } else if (sakes.length < 3) {
      setSakes([...sakes, s])
    }
  }

  return (
    <SectionFrame
      title="PREFERENCES"
      editing={editing}
      setEditing={(v) => {
        if (v) reset()
        setEditing(v)
      }}
      saving={saving}
      onSave={handleSave}
    >
      <dl className="space-y-6 text-sm">
        <div>
          <dt className="text-[10px] tracking-luxe text-neutral-400 mb-2">好きなジャンル</dt>
          <dd>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {favoriteGenreOptions.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={chipClass(genres.includes(g))}
                  >
                    {g}
                  </button>
                ))}
              </div>
            ) : m.favorite_genres ? (
              <span className="font-serif text-base break-words">{m.favorite_genres}</span>
            ) : (
              <span className="text-neutral-300">未登録</span>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] tracking-luxe text-neutral-400 mb-2">
            好きな酒の種類（好きな順に上位3つ）
          </dt>
          <dd>
            {editing ? (
              <>
                <p className="text-[10px] text-neutral-400 mb-2">
                  クリックで1位→2位→3位の順に追加。再クリックで解除。
                </p>
                <div className="flex flex-wrap gap-2">
                  {favoriteSakeTypeOptions.map((s) => {
                    const rank = sakes.indexOf(s)
                    const active = rank >= 0
                    const disabled = !active && sakes.length >= 3
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleSake(s)}
                        className={chipClass(active, disabled)}
                      >
                        {active && <span className="font-serif italic mr-1.5">{rank + 1}.</span>}
                        {s}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : m.favorite_sake_types ? (
              <span className="font-serif text-base break-words">{m.favorite_sake_types}</span>
            ) : (
              <span className="text-neutral-300">未登録</span>
            )}
          </dd>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <Row label="酒を飲む頻度">
            {editing ? (
              <select value={freq} onChange={(e) => setFreq(e.target.value)} className={inputClass}>
                <option value="">選択してください</option>
                {drinkingFrequencyOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : (
              m.drinking_frequency || <span className="text-neutral-300">未登録</span>
            )}
          </Row>
          <Row label="アレルギー">
            {editing ? (
              <input
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className={inputClass}
              />
            ) : (
              m.allergies || <span className="text-neutral-300">未登録</span>
            )}
          </Row>
        </div>
      </dl>
    </SectionFrame>
  )
}
