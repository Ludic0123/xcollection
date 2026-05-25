'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_OPTIONS, MEAL_TIME_OPTIONS, type Category, type Spot } from '@/types'
import { PREFECTURES } from '@/types/profile'
import ImageUpload from './ImageUpload'
import MultiImageUpload from './MultiImageUpload'

export type GenreOption = { id: string; category: string; name: string }
export type CityOption = { id: string; name: string; prefecture?: string | null }
export type PriceRangeOption = { level: number; label: string }
export type ReservationOption = { value: string; label: string }
export type ChefOption = { id: string; name: string; specialty: string | null }

export default function SpotForm({
  spot,
  genres,
  cities,
  priceRanges,
  reservations,
  chefs,
}: {
  spot?: Spot
  genres: GenreOption[]
  cities: CityOption[]
  priceRanges: PriceRangeOption[]
  reservations: ReservationOption[]
  chefs: ChefOption[]
}) {
  const router = useRouter()
  const [name, setName] = useState(spot?.name ?? '')
  const [category, setCategory] = useState<Category>(spot?.category ?? 'restaurant')
  const [genre, setGenre] = useState(spot?.genre ?? '')
  const [prefecture, setPrefecture] = useState(spot?.prefecture ?? '')
  const [city, setCity] = useState(spot?.city ?? '')
  const [address, setAddress] = useState(spot?.address ?? '')
  const [priceRange, setPriceRange] = useState<number | ''>(spot?.price_range ?? '')
  const [url, setUrl] = useState(spot?.url ?? '')
  const [mapUrl, setMapUrl] = useState(spot?.map_url ?? '')
  const [notes, setNotes] = useState(spot?.notes ?? '')
  const [wantToVisit, setWantToVisit] = useState(spot?.want_to_visit ?? false)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(spot?.cover_image_url ?? null)
  const [photoUrls, setPhotoUrls] = useState<string[]>(spot?.photo_urls ?? [])
  const [reservationMethods, setReservationMethods] = useState<string[]>(
    spot?.reservation_methods ?? []
  )
  const [isFeatured, setIsFeatured] = useState(spot?.is_featured ?? false)
  const [lat, setLat] = useState<string>(spot?.lat?.toString() ?? '')
  const [lng, setLng] = useState<string>(spot?.lng?.toString() ?? '')
  const [chefId, setChefId] = useState<string>(spot?.chef_id ?? '')
  const [mealTimes, setMealTimes] = useState<string[]>(spot?.meal_times ?? [])

  const genresForCategory = useMemo(
    () => genres.filter((g) => g.category === category),
    [genres, category]
  )

  const citiesForPrefecture = useMemo(
    () =>
      prefecture
        ? cities.filter((c) => c.prefecture === prefecture || !c.prefecture)
        : cities,
    [cities, prefecture]
  )

  function toggleMealTime(value: string) {
    setMealTimes((cur) =>
      cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
    )
  }

  function toggleReservation(value: string) {
    setReservationMethods((cur) =>
      cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
    )
  }
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
      category,
      genre: genre || null,
      prefecture: prefecture || null,
      city: city || null,
      address: address || null,
      price_range: priceRange === '' ? null : Number(priceRange),
      url: url || null,
      map_url: mapUrl || null,
      notes: notes || null,
      want_to_visit: wantToVisit,
      cover_image_url: coverImageUrl,
      photo_urls: photoUrls,
      reservation_methods: reservationMethods,
      is_featured: isFeatured,
      lat: lat === '' ? null : Number(lat),
      lng: lng === '' ? null : Number(lng),
      chef_id: chefId || null,
      meal_times: mealTimes,
    }
    if (spot) {
      const { error } = await supabase.from('spots').update(payload).eq('id', spot.id)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/spots/${spot.id}`)
    } else {
      const { data, error } = await supabase.from('spots').insert(payload).select('id').single()
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/spots/${data.id}`)
    }
    router.refresh()
  }

  async function handleDelete() {
    if (!spot) return
    if (!confirm('削除しますか？訪問記録も一緒に削除されます。')) return
    const supabase = createClient()
    const { error } = await supabase.from('spots').delete().eq('id', spot.id)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/spots')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border hairline p-6 max-w-2xl space-y-5">
      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">COVER IMAGE</label>
        <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} folder="spots" />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">PHOTOS</label>
        <MultiImageUpload value={photoUrls} onChange={setPhotoUrls} folder="spots" max={40} />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">名前 *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">カテゴリ *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">ジャンル</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">未設定</option>
            {genresForCategory.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
            {/* 既存値がリストにない場合の互換 */}
            {genre && !genresForCategory.some((g) => g.name === genre) && (
              <option value={genre}>{genre}（既存）</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="block text-sm text-gray-700 mb-1">街・エリア名</label>
          <input
            list="city-suggestions"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="例: 銀座 / 嵐山 / 那覇市"
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
          <datalist id="city-suggestions">
            {citiesForPrefecture.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <p className="text-[10px] text-neutral-400 mt-1">
            登録済みから選ぶか、自由に入力できます
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">価格帯</label>
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
        <label className="block text-sm text-gray-700 mb-1">大将・シェフ</label>
        <select
          value={chefId}
          onChange={(e) => setChefId(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">未設定</option>
          {chefs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.specialty && ` (${c.specialty})`}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-neutral-400 mt-1">
          選択肢にない場合は <a href="/chefs/new" target="_blank" className="underline">新しい大将を登録</a> してください
        </p>
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
        <label className="block text-sm text-gray-700 mb-1">地図URL（Google Mapsなど）</label>
        <input
          type="url"
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">
          緯度・経度（MAPに表示するため。Google Mapsで右クリック→座標をクリックでコピー）
        </label>
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
          MEAL TIMES（食事時間帯・複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {MEAL_TIME_OPTIONS.map((t) => {
            const active = mealTimes.includes(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleMealTime(t)}
                className={`text-xs px-3 py-1.5 border hairline transition-colors ${
                  active
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-neutral-600 hover:border-black'
                }`}
              >
                {t}
              </button>
            )
          })}
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
                onClick={() => toggleReservation(opt.value)}
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
        行きたいリストに入れる
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
          {saving ? '保存中…' : spot ? '更新する' : '登録する'}
        </button>
        {spot && (
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
