'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS, type Category, type Spot } from '@/types'

type SpotLite = Pick<Spot, 'id' | 'name' | 'category' | 'genre' | 'city'>

export default function TripItemForm({
  planId,
  spots,
}: {
  planId: string
  spots: SpotLite[]
}) {
  const router = useRouter()
  const [mode, setMode] = useState<'spot' | 'custom'>('spot')
  const [spotId, setSpotId] = useState<string>(spots[0]?.id ?? '')
  const [customName, setCustomName] = useState('')
  const [dayNumber, setDayNumber] = useState(1)
  const [estimatedPrice, setEstimatedPrice] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (mode === 'spot' && !spotId) {
      setError('登録済みのお店・ホテルを選んでください')
      setSaving(false)
      return
    }
    if (mode === 'custom' && !customName.trim()) {
      setError('名前を入力してください')
      setSaving(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('trip_plan_items').insert({
      trip_plan_id: planId,
      spot_id: mode === 'spot' ? spotId : null,
      custom_name: mode === 'custom' ? customName.trim() : null,
      day_number: dayNumber,
      estimated_price: estimatedPrice === '' ? null : Number(estimatedPrice),
      notes: notes || null,
    })
    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }
    router.push(`/trips/${planId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-sm text-gray-700 mb-1">追加方法</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('spot')}
            className={`px-3 py-1.5 text-sm border ${
              mode === 'spot'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            登録済みから選ぶ
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-3 py-1.5 text-sm border ${
              mode === 'custom'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            その場で名前だけ入力
          </button>
        </div>
      </div>

      {mode === 'spot' ? (
        <div>
          <label className="block text-sm text-gray-700 mb-1">お店・ホテル *</label>
          {spots.length === 0 ? (
            <p className="text-sm text-gray-500">
              登録済みのお店がありません。先に「お店・ホテル」から登録してください。
            </p>
          ) : (
            <select
              value={spotId}
              onChange={(e) => setSpotId(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm"
            >
              {spots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.city && ` (${s.city})`} —{' '}
                  {CATEGORY_LABELS[s.category as Category]}
                  {s.genre && ` / ${s.genre}`}
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm text-gray-700 mb-1">名前 *</label>
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="例: 清水寺 / 新幹線 / お土産"
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">何日目</label>
          <input
            type="number"
            min={1}
            value={dayNumber}
            onChange={(e) => setDayNumber(Math.max(1, Number(e.target.value)))}
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">予定金額（円）</label>
          <input
            type="number"
            min={0}
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">メモ</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-gray-900 text-white px-5 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? '追加中…' : '追加する'}
      </button>
    </form>
  )
}
