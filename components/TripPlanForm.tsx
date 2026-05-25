'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TripPlan } from '@/types'
import ImageUpload from './ImageUpload'

export default function TripPlanForm({ plan }: { plan?: TripPlan }) {
  const router = useRouter()
  const [title, setTitle] = useState(plan?.title ?? '')
  const [city, setCity] = useState(plan?.city ?? '')
  const [startDate, setStartDate] = useState(plan?.start_date ?? '')
  const [endDate, setEndDate] = useState(plan?.end_date ?? '')
  const [notes, setNotes] = useState(plan?.notes ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(plan?.cover_image_url ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('ログインが必要です')
      setSaving(false)
      return
    }
    const payload = {
      user_id: user.id,
      title,
      city: city || null,
      start_date: startDate || null,
      end_date: endDate || null,
      notes: notes || null,
      cover_image_url: coverImageUrl,
    }
    if (plan) {
      const { error } = await supabase.from('trip_plans').update(payload).eq('id', plan.id)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/trips/${plan.id}`)
    } else {
      const { data, error } = await supabase
        .from('trip_plans')
        .insert(payload)
        .select('id')
        .single()
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/trips/${data.id}`)
    }
    router.refresh()
  }

  async function handleDelete() {
    if (!plan) return
    if (!confirm('プランを削除しますか？')) return
    const supabase = createClient()
    const { error } = await supabase.from('trip_plans').delete().eq('id', plan.id)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/trips')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border hairline p-6 max-w-2xl space-y-5">
      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">COVER IMAGE</label>
        <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} folder="trips" />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">タイトル *</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 京都2泊3日"
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">街</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="例: 京都"
          className="w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">開始日</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">終了日</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm"
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-5 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? '保存中…' : plan ? '更新する' : '作成する'}
        </button>
        {plan && (
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
