'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Chef } from '@/types'
import { PREFECTURES } from '@/types/profile'
import ImageUpload from './ImageUpload'
import MultiImageUpload from './MultiImageUpload'

export default function ChefForm({ chef }: { chef?: Chef }) {
  const router = useRouter()
  const [name, setName] = useState(chef?.name ?? '')
  const [nameKana, setNameKana] = useState(chef?.name_kana ?? '')
  const [specialty, setSpecialty] = useState(chef?.specialty ?? '')
  const [birthYear, setBirthYear] = useState<string>(chef?.birth_year?.toString() ?? '')
  const [hometown, setHometown] = useState(chef?.hometown ?? '')
  const [bio, setBio] = useState(chef?.bio ?? '')
  const [trainingHistory, setTrainingHistory] = useState(chef?.training_history ?? '')
  const [awards, setAwards] = useState(chef?.awards ?? '')
  const [coverImage, setCoverImage] = useState<string | null>(chef?.cover_image_url ?? null)
  const [photos, setPhotos] = useState<string[]>(chef?.photo_urls ?? [])
  const [isFeatured, setIsFeatured] = useState(chef?.is_featured ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('ログインが必要です')
      setSaving(false)
      return
    }
    const payload = {
      user_id: user.id,
      name,
      name_kana: nameKana || null,
      specialty: specialty || null,
      birth_year: birthYear === '' ? null : Number(birthYear),
      hometown: hometown || null,
      bio: bio || null,
      training_history: trainingHistory || null,
      awards: awards || null,
      cover_image_url: coverImage,
      photo_urls: photos,
      is_featured: isFeatured,
    }
    if (chef) {
      const { error } = await supabase.from('chefs').update(payload).eq('id', chef.id)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/chefs/${chef.id}`)
    } else {
      const { data, error } = await supabase
        .from('chefs')
        .insert(payload)
        .select('id')
        .single()
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/chefs/${data.id}`)
    }
    router.refresh()
  }

  async function handleDelete() {
    if (!chef) return
    if (!confirm('削除しますか？このシェフを紐付けている店からはチェフがnullになります。')) return
    const supabase = createClient()
    const { error } = await supabase.from('chefs').delete().eq('id', chef.id)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/chefs')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border hairline p-6 max-w-2xl space-y-5">
      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">PORTRAIT</label>
        <ImageUpload value={coverImage} onChange={setCoverImage} folder="chefs" />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">GALLERY</label>
        <MultiImageUpload value={photos} onChange={setPhotos} folder="chefs" max={40} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">氏名 *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 山田 太郎"
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">フリガナ</label>
          <input
            value={nameKana}
            onChange={(e) => setNameKana(e.target.value)}
            placeholder="ヤマダ タロウ"
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">専門</label>
          <input
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="例: 寿司 / 懐石 / フレンチ"
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">生年</label>
          <input
            type="number"
            min={1900}
            max={2100}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="例: 1975"
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">出身地</label>
        <select
          value={hometown}
          onChange={(e) => setHometown(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">選択してください</option>
          {PREFECTURES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">経歴・略歴</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="例: ◯◯歳より修行を始め…"
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">修行元・修行歴</label>
        <textarea
          value={trainingHistory}
          onChange={(e) => setTrainingHistory(e.target.value)}
          rows={5}
          placeholder={'例:\n銀座 ○○\n京都 △△\n独立 ◯◯◯◯年'}
          className="w-full border border-gray-300 px-3 py-2 text-sm whitespace-pre-wrap"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">受賞歴・メディア</label>
        <textarea
          value={awards}
          onChange={(e) => setAwards(e.target.value)}
          rows={3}
          placeholder="ミシュラン◯つ星、雑誌掲載 など"
          className="w-full border border-gray-300 px-3 py-2 text-sm whitespace-pre-wrap"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
        />
        トップページのFEATUREDで取り上げる
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-5 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? '保存中…' : chef ? '更新する' : '登録する'}
        </button>
        {chef && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto text-sm text-red-600 hover:underline"
          >
            削除する
          </button>
        )}
      </div>
    </form>
  )
}
