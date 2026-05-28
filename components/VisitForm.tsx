'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BlogComposer, { type ComposerBlock, type IngredientOption } from './BlogComposer'

export default function VisitForm({
  spotId,
  ingredientOptions = [],
}: {
  spotId: string
  ingredientOptions?: IngredientOption[]
}) {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)
  const [visitedAt, setVisitedAt] = useState(today)
  const [rating, setRating] = useState<number | ''>('')
  const [price, setPrice] = useState<string>('')
  const [title, setTitle] = useState('')
  const [blocks, setBlocks] = useState<ComposerBlock[]>([])
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
    const imageBlocks = blocks.filter(
      (b): b is Extract<ComposerBlock, { type: 'image' }> => b.type === 'image' && !!b.url
    )
    const textConcat = blocks
      .filter((b): b is Extract<ComposerBlock, { type: 'text' }> => b.type === 'text')
      .map((b) => b.text.trim())
      .filter(Boolean)
      .join('\n\n')
    if (!title.trim()) {
      setError('ブログタイトルを入力してください')
      setSaving(false)
      return
    }
    if (blocks.length === 0 || (!textConcat && imageBlocks.length === 0)) {
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
      body_blocks: blocks,
      photo_urls: imageBlocks.map((b) => ({
        url: b.url,
        caption: b.caption,
        ingredients: b.ingredients,
      })),
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
    <form onSubmit={handleSubmit} className="bg-white border hairline p-6 space-y-6">
      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">DATE *</label>
        <input
          type="date"
          required
          value={visitedAt}
          onChange={(e) => setVisitedAt(e.target.value)}
          className="border-b hairline bg-transparent px-1 py-1 text-sm focus:outline-none focus:border-black"
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
          本文 *（文章・写真ブロック）
        </label>
        <BlogComposer
          blocks={blocks}
          onChange={setBlocks}
          ingredientOptions={ingredientOptions}
          folder="visits"
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
          {rating !== '' && (
            <button
              type="button"
              onClick={() => setRating('')}
              className="ml-2 text-[10px] tracking-luxe text-neutral-500 underline"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">PRICE (¥)</label>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border-b hairline bg-transparent px-1 py-1 text-sm w-40 focus:outline-none focus:border-black"
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
