'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Hotel } from '@/types'
import { PREFECTURES } from '@/types/profile'
import ImageUpload from './ImageUpload'
import MultiImageUpload from './MultiImageUpload'

export type BrandOption = { id: string; name: string }
export type PriceRangeOption = { level: number; label: string }
export type ReservationOption = { value: string; label: string }

export default function HotelForm({
  hotel,
  brands,
  priceRanges,
  reservations,
}: {
  hotel?: Hotel
  brands: BrandOption[]
  priceRanges: PriceRangeOption[]
  reservations: ReservationOption[]
}) {
  const router = useRouter()
  const [name, setName] = useState(hotel?.name ?? '')
  const [brand, setBrand] = useState(hotel?.brand ?? '')
  const [prefecture, setPrefecture] = useState(hotel?.prefecture ?? '')
  const [address, setAddress] = useState(hotel?.address ?? '')
  const [url, setUrl] = useState(hotel?.url ?? '')
  const [mapUrl, setMapUrl] = useState(hotel?.map_url ?? '')
  const [lat, setLat] = useState<string>(hotel?.lat?.toString() ?? '')
  const [lng, setLng] = useState<string>(hotel?.lng?.toString() ?? '')
  const [coverImage, setCoverImage] = useState<string | null>(hotel?.cover_image_url ?? null)
  const [photos, setPhotos] = useState<string[]>(hotel?.photo_urls ?? [])
  const [priceRange, setPriceRange] = useState<number | ''>(hotel?.price_range ?? '')
  const [notes, setNotes] = useState(hotel?.notes ?? '')
  const [rating, setRating] = useState<number | ''>(hotel?.rating ?? '')
  const [reservationMethods, setReservationMethods] = useState<string[]>(
    hotel?.reservation_methods ?? []
  )
  const [wantToVisit, setWantToVisit] = useState(hotel?.want_to_visit ?? false)
  const [isFeatured, setIsFeatured] = useState(hotel?.is_featured ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleRes(value: string) {
    setReservationMethods((cur) =>
      cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
    )
  }

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
      brand: brand || null,
      prefecture: prefecture || null,
      address: address || null,
      url: url || null,
      map_url: mapUrl || null,
      lat: lat === '' ? null : Number(lat),
      lng: lng === '' ? null : Number(lng),
      cover_image_url: coverImage,
      photo_urls: photos,
      price_range: priceRange === '' ? null : Number(priceRange),
      notes: notes || null,
      rating: rating === '' ? null : Number(rating),
      reservation_methods: reservationMethods,
      want_to_visit: wantToVisit,
      is_featured: isFeatured,
    }
    if (hotel) {
      const { error } = await supabase.from('hotels').update(payload).eq('id', hotel.id)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/hotels/${hotel.id}`)
    } else {
      const { data, error } = await supabase
        .from('hotels')
        .insert(payload)
        .select('id')
        .single()
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/hotels/${data.id}`)
    }
    router.refresh()
  }

  async function handleDelete() {
    if (!hotel) return
    if (!confirm('削除しますか？宿泊記録も一緒に削除されます。')) return
    const supabase = createClient()
    const { error } = await supabase.from('hotels').delete().eq('id', hotel.id)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/hotels')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border hairline p-6 max-w-2xl space-y-5">
      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">COVER IMAGE</label>
        <ImageUpload value={coverImage} onChange={setCoverImage} folder="hotels" />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">PHOTOS</label>
        <MultiImageUpload value={photos} onChange={setPhotos} folder="hotels" max={30} />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">ホテル名 *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: アマン東京"
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">ブランド</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">未設定</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
            {brand && !brands.some((b) => b.name === brand) && (
              <option value={brand}>{brand}（既存）</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">都道府県</label>
          <select
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">未設定</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">価格帯（1泊あたり目安）</label>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">未設定</option>
          {priceRanges.map((p) => (
            <option key={p.level} value={p.level}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">住所</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">公式サイトURL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">地図URL</label>
        <input
          type="url"
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">緯度・経度（MAP表示用）</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="緯度（例: 35.6595）"
            className="w-full border border-gray-300 px-3 py-2 text-sm font-mono"
          />
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="経度（例: 139.7006）"
            className="w-full border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">メモ</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 px-3 py-2 text-sm"
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
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">RESERVATION</label>
        <div className="flex flex-wrap gap-2">
          {reservations.map((opt) => {
            const active = reservationMethods.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleRes(opt.value)}
                className={`text-xs px-3 py-1.5 border hairline transition-colors ${
                  active
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-neutral-600 hover:border-black'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={wantToVisit}
          onChange={(e) => setWantToVisit(e.target.checked)}
        />
        泊まりたいリストに入れる
      </label>

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
          {saving ? '保存中…' : hotel ? '更新する' : '登録する'}
        </button>
        {hotel && (
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
