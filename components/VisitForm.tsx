'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MultiImageUpload from './MultiImageUpload'

export default function VisitForm({ spotId }: { spotId: string }) {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)
  const [visitedAt, setVisitedAt] = useState(today)
  const [rating, setRating] = useState<number | ''>('')
  const [price, setPrice] = useState<string>('')
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
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
    const { error } = await supabase.from('visits').insert({
      user_id: user.id,
      spot_id: spotId,
      visited_at: visitedAt,
      rating: rating === '' ? null : Number(rating),
      price: price === '' ? null : Number(price),
      comment: comment || null,
      photo_urls: photos,
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
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">PHOTOS</label>
        <MultiImageUpload value={photos} onChange={setPhotos} folder="visits" max={40} />
      </div>

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

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">NOTES</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="頼んだメニュー / 印象 / 次回試したいもの"
          className="w-full border hairline px-3 py-2 text-sm focus:outline-none focus:border-black"
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
