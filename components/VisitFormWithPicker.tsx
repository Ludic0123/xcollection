'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BlogComposer, { type ComposerBlock } from './BlogComposer'
import PhotoPool, { type PoolPhoto, type IngredientOption } from './PhotoPool'
import { buildBlogBlocks, blogTextConcat } from '@/lib/blog'

export type SpotLite = {
  id: string
  name: string
  prefecture: string | null
  city: string | null
  genre?: string | null
}

export default function VisitFormWithPicker({
  spots,
  ingredients = [],
}: {
  spots: SpotLite[]
  ingredients?: IngredientOption[]
}) {
  const router = useRouter()
  const [spotId, setSpotId] = useState('')
  const [visitedAt, setVisitedAt] = useState(new Date().toISOString().slice(0, 10))
  const [rating, setRating] = useState<number | ''>('')
  const [price, setPrice] = useState('')
  const [title, setTitle] = useState('')
  const [pool, setPool] = useState<PoolPhoto[]>([])
  const [blocks, setBlocks] = useState<ComposerBlock[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedGenre = useMemo(
    () => spots.find((s) => s.id === spotId)?.genre ?? null,
    [spots, spotId]
  )
  const ingredientOptions = useMemo(
    () => (selectedGenre ? ingredients.filter((i) => i.genre === selectedGenre) : []),
    [ingredients, selectedGenre]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!spotId) {
      setError('店を選んでください')
      return
    }
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
    const finalBlocks = buildBlogBlocks(blocks, pool)
    const textConcat = blogTextConcat(blocks)
    if (!title.trim()) {
      setError('ブログタイトルを入力してください')
      setSaving(false)
      return
    }
    if (finalBlocks.length === 0) {
      setError('本文（文章または写真）を1つ以上入れてください')
      setSaving(false)
      return
    }
    const { error } = await supabase.from('visits').insert({
      user_id: user.id,
      spot_id: spotId,
      visited_at: visitedAt,
      rating: rating === '' ? null : Number(rating),
      price: price === '' ? null : Number(price),
      title: title.trim(),
      comment: textConcat || null,
      body_blocks: finalBlocks,
      photo_urls: pool,
    })
    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }
    router.push(`/spots/${spotId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border hairline p-6 space-y-6 max-w-2xl">
      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">SPOT *</label>
        <select
          required
          value={spotId}
          onChange={(e) => setSpotId(e.target.value)}
          className="w-full border hairline px-3 py-2 text-sm"
        >
          <option value="">選択してください</option>
          {spots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {(s.prefecture || s.city) && ` — ${[s.prefecture, s.city].filter(Boolean).join(' · ')}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">訪問日 *</label>
        <input
          type="date"
          required
          value={visitedAt}
          onChange={(e) => setVisitedAt(e.target.value)}
          className="border hairline px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">
          PHOTOS（まとめてアップロード・各写真に名前/食材）
        </label>
        <PhotoPool
          value={pool}
          onChange={setPool}
          folder="visits"
          max={40}
          ingredientOptions={ingredientOptions}
        />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">タイトル *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 再訪、やっぱり最高"
          className="w-full border hairline px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">
          本文 *（文章ベース・写真ブロックは上のPHOTOSから選択）
        </label>
        <BlogComposer blocks={blocks} onChange={setBlocks} pool={pool} />
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
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">支払い金額（円）</label>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border hairline px-3 py-2 text-sm w-40"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-6 py-3 text-[11px] tracking-luxe hover:bg-neutral-800 disabled:opacity-50"
      >
        {saving ? 'SAVING…' : 'SAVE VISIT'}
      </button>
    </form>
  )
}
