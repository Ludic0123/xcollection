'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MultiImageUpload from './MultiImageUpload'

export default function StayForm({ hotelId }: { hotelId: string }) {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState('')
  const [price, setPrice] = useState('')
  const [rating, setRating] = useState<number | ''>('')
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
    const { error } = await supabase.from('stays').insert({
      user_id: user.id,
      hotel_id: hotelId,
      check_in_date: checkIn,
      check_out_date: checkOut || null,
      price: price === '' ? null : Number(price),
      rating: rating === '' ? null : Number(rating),
      comment: comment || null,
      photo_urls: photos,
    })
    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }
    router.push(`/hotels/${hotelId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border hairline p-6 space-y-6">
      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">PHOTOS</label>
        <MultiImageUpload value={photos} onChange={setPhotos} folder="stays" max={30} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">CHECK-IN *</label>
          <input
            type="date"
            required
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border hairline px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">CHECK-OUT</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border hairline px-3 py-2 text-sm w-full"
          />
        </div>
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
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">支払い金額（¥）</label>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border hairline px-3 py-2 text-sm w-40"
        />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">NOTES</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="部屋タイプ・印象・サービスなど"
          className="w-full border hairline px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-6 py-3 text-[11px] tracking-luxe hover:bg-neutral-800 disabled:opacity-50"
      >
        {saving ? 'SAVING…' : 'SAVE STAY'}
      </button>
    </form>
  )
}
