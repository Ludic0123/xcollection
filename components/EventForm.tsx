'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  EVENT_TYPE_OPTIONS,
  type AppEvent,
  type EventType,
  type Sake,
  type Spot,
} from '@/types'
import ImageUpload from './ImageUpload'

type SpotLite = Pick<Spot, 'id' | 'name' | 'city'>
type SakeLite = Pick<Sake, 'id' | 'name' | 'brewery'>

export default function EventForm({
  event,
  spots,
  sakes,
}: {
  event?: AppEvent
  spots: SpotLite[]
  sakes: SakeLite[]
}) {
  const router = useRouter()
  const [eventType, setEventType] = useState<EventType>(event?.event_type ?? 'dining_meetup')
  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [coverImage, setCoverImage] = useState<string | null>(event?.cover_image_url ?? null)
  const [eventDate, setEventDate] = useState(event?.event_date ?? '')
  const [eventTime, setEventTime] = useState(event?.event_time?.slice(0, 5) ?? '')
  const [locationText, setLocationText] = useState(event?.location_text ?? '')
  const [spotId, setSpotId] = useState<string>(event?.spot_id ?? '')
  const [sakeId, setSakeId] = useState<string>(event?.sake_id ?? '')
  const [maxParticipants, setMaxParticipants] = useState<string>(
    event?.max_participants?.toString() ?? ''
  )
  const [budgetYen, setBudgetYen] = useState<string>(event?.budget_yen?.toString() ?? '')
  const [deadline, setDeadline] = useState(event?.deadline?.slice(0, 16) ?? '')
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
      organizer_id: user.id,
      event_type: eventType,
      title,
      description: description || null,
      cover_image_url: coverImage,
      event_date: eventDate || null,
      event_time: eventTime || null,
      location_text: locationText || null,
      spot_id: spotId || null,
      sake_id: sakeId || null,
      max_participants: maxParticipants === '' ? null : Number(maxParticipants),
      budget_yen: budgetYen === '' ? null : Number(budgetYen),
      deadline: deadline ? new Date(deadline).toISOString() : null,
    }
    if (event) {
      const { error } = await supabase.from('events').update(payload).eq('id', event.id)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/invitation/${event.id}`)
    } else {
      const { data, error } = await supabase
        .from('events')
        .insert(payload)
        .select('id')
        .single()
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/invitation/${data.id}`)
    }
    router.refresh()
  }

  // タイプ別のヒント
  const showSpotPicker = eventType === 'dining_meetup'
  const showSakePicker = eventType === 'sake_meetup' || eventType === 'sake_distribution'

  return (
    <form onSubmit={handleSubmit} className="bg-white border hairline p-6 max-w-2xl space-y-5">
      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">COVER IMAGE</label>
        <ImageUpload value={coverImage} onChange={setCoverImage} folder="events" />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">TYPE *</label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as EventType)}
          className="w-full border hairline px-3 py-2 text-sm"
        >
          {EVENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">TITLE *</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: すきやばし次郎、一緒に行きませんか"
          className="w-full border hairline px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">DESCRIPTION</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border hairline px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">DATE</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full border hairline px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">TIME</label>
          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="w-full border hairline px-3 py-2 text-sm"
          />
        </div>
      </div>

      {showSpotPicker && spots.length > 0 && (
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">
            SPOT (登録済みから選ぶ)
          </label>
          <select
            value={spotId}
            onChange={(e) => setSpotId(e.target.value)}
            className="w-full border hairline px-3 py-2 text-sm"
          >
            <option value="">— 選択しない —</option>
            {spots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.city && ` (${s.city})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {showSakePicker && sakes.length > 0 && (
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">
            SAKE (登録済みから選ぶ)
          </label>
          <select
            value={sakeId}
            onChange={(e) => setSakeId(e.target.value)}
            className="w-full border hairline px-3 py-2 text-sm"
          >
            <option value="">— 選択しない —</option>
            {sakes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.brewery && ` (${s.brewery})`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">LOCATION</label>
        <input
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          placeholder="店名やエリアなど。Spotが選ばれている場合は不要"
          className="w-full border hairline px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">
            MAX PARTICIPANTS
          </label>
          <input
            type="number"
            min={1}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="w-full border hairline px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs tracking-luxe text-neutral-500 mb-2">
            BUDGET / FEE (¥)
          </label>
          <input
            type="number"
            min={0}
            value={budgetYen}
            onChange={(e) => setBudgetYen(e.target.value)}
            className="w-full border hairline px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-luxe text-neutral-500 mb-2">DEADLINE</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="border hairline px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-6 py-3 text-[11px] tracking-luxe hover:bg-neutral-800 disabled:opacity-50"
      >
        {saving ? 'SAVING…' : event ? 'UPDATE' : 'CREATE'}
      </button>
    </form>
  )
}
