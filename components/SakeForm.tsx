'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Sake } from '@/types'
import ImageUpload from './ImageUpload'
import MultiImageUpload from './MultiImageUpload'

export type SakeTypeOption = { id: string; name: string }
export type SakeBrandOption = { id: string; name: string }
export type SakeModelOption = { id: string; name: string }

export default function SakeForm({
  sake,
  sakeTypes,
  sakeBrands,
  sakeModels,
}: {
  sake?: Sake
  sakeTypes: SakeTypeOption[]
  sakeBrands: SakeBrandOption[]
  sakeModels: SakeModelOption[]
}) {
  const router = useRouter()
  const [name, setName] = useState(sake?.name ?? '')
  const [model, setModel] = useState(sake?.model ?? '')
  const [brewery, setBrewery] = useState(sake?.brewery ?? '')
  const [region, setRegion] = useState(sake?.region ?? '')
  const [sakeType, setSakeType] = useState(sake?.sake_type ?? '')
  const [ricePolishingPct, setRicePolishingPct] = useState<string>(
    sake?.rice_polishing_pct?.toString() ?? ''
  )
  const [alcoholPct, setAlcoholPct] = useState<string>(sake?.alcohol_pct?.toString() ?? '')
  const [priceYen, setPriceYen] = useState<string>(sake?.price_yen?.toString() ?? '')
  const [notes, setNotes] = useState(sake?.notes ?? '')
  const [coverImage, setCoverImage] = useState<string | null>(sake?.cover_image_url ?? null)
  const [photos, setPhotos] = useState<string[]>(sake?.photo_urls ?? [])
  const [rating, setRating] = useState<number | ''>(sake?.rating ?? '')
  const [isFeatured, setIsFeatured] = useState(sake?.is_featured ?? false)
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
      model: model || null,
      brewery: brewery || null,
      region: region || null,
      sake_type: sakeType || null,
      rice_polishing_pct: ricePolishingPct === '' ? null : Number(ricePolishingPct),
      alcohol_pct: alcoholPct === '' ? null : Number(alcoholPct),
      price_yen: priceYen === '' ? null : Number(priceYen),
      notes: notes || null,
      cover_image_url: coverImage,
      photo_urls: photos,
      rating: rating === '' ? null : Number(rating),
      is_featured: isFeatured,
    }
    if (sake) {
      const { error } = await supabase.from('sakes').update(payload).eq('id', sake.id)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/sake/${sake.id}`)
    } else {
      const { data, error } = await supabase.from('sakes').insert(payload).select('id').single()
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/sake/${data.id}`)
    }
    router.refresh()
  }

  async function handleDelete() {
    if (!sake) return
    if (!confirm('削除しますか？')) return
    const supabase = createClient()
    const { error } = await supabase.from('sakes').delete().eq('id', sake.id)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/sake')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border hairline p-6 max-w-2xl space-y-5">
      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">COVER IMAGE</label>
        <ImageUpload value={coverImage} onChange={setCoverImage} folder="sakes" />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">PHOTOS</label>
        <MultiImageUpload value={photos} onChange={setPhotos} folder="sakes" max={40} />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">銘柄 *</label>
        <input
          required
          list="sake-brand-suggestions"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 十四代"
          className="w-full border hairline px-3 py-2 text-sm"
        />
        <datalist id="sake-brand-suggestions">
          {sakeBrands.map((b) => (
            <option key={b.id} value={b.name} />
          ))}
        </datalist>
        <p className="text-[10px] text-neutral-400 mt-1">
          登録済みから選ぶか、自由に入力できます
        </p>
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">モデル</label>
        <input
          list="sake-model-suggestions"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="例: 純米大吟醸 / 龍泉 / 二割三分"
          className="w-full border hairline px-3 py-2 text-sm"
        />
        <datalist id="sake-model-suggestions">
          {sakeModels.map((m) => (
            <option key={m.id} value={m.name} />
          ))}
        </datalist>
        <p className="text-[10px] text-neutral-400 mt-1">
          登録済みから選ぶか、自由に入力できます
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">蔵元</label>
          <input
            value={brewery}
            onChange={(e) => setBrewery(e.target.value)}
            placeholder="例: 高木酒造"
            className="w-full border hairline px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">産地</label>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="例: 山形県"
            className="w-full border hairline px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">タイプ</label>
          <select
            value={sakeType}
            onChange={(e) => setSakeType(e.target.value)}
            className="w-full border hairline px-3 py-2 text-sm"
          >
            <option value="">未設定</option>
            {sakeTypes.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
            {sakeType && !sakeTypes.some((t) => t.name === sakeType) && (
              <option value={sakeType}>{sakeType}（既存）</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">精米歩合(%)</label>
          <input
            type="number"
            min={1}
            max={100}
            value={ricePolishingPct}
            onChange={(e) => setRicePolishingPct(e.target.value)}
            className="w-full border hairline px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">アルコール(%)</label>
          <input
            type="number"
            step="0.1"
            min={0}
            value={alcoholPct}
            onChange={(e) => setAlcoholPct(e.target.value)}
            className="w-full border hairline px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">参考価格(円)</label>
        <input
          type="number"
          min={0}
          value={priceYen}
          onChange={(e) => setPriceYen(e.target.value)}
          className="border hairline px-3 py-2 text-sm w-40"
        />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">
          RATING（公開サイトには表示されません）
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(rating === n ? '' : n)}
              className={`w-10 h-10 border hairline text-sm ${
                rating !== '' && n <= rating
                  ? 'bg-black border-black text-white'
                  : 'bg-white text-neutral-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">NOTES</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full border hairline px-3 py-2 text-sm"
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

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white px-6 py-3 text-[11px] tracking-luxe hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? 'SAVING…' : sake ? 'UPDATE' : 'CREATE'}
        </button>
        {sake && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto text-xs text-red-600 hover:underline"
          >
            削除する
          </button>
        )}
      </div>
    </form>
  )
}
