export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMember } from '@/lib/auth'
import { EVENT_TYPE_LABELS, type AppEvent } from '@/types'
import JoinEventButton from '@/components/JoinEventButton'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const member = await getCurrentMember()
  if (!member) redirect(`/login?redirect=/invitation/${id}`)

  const supabase = await createClient()
  const { data: eventData } = await supabase
    .from('events')
    .select('*, spot:spots(id, name, city), sake:sakes(id, name, brewery)')
    .eq('id', id)
    .single()
  if (!eventData) notFound()
  const event = eventData as AppEvent

  const { data: parts } = await supabase
    .from('event_participants')
    .select('id, user_id, joined_at')
    .eq('event_id', id)
    .order('joined_at')
  const participants = parts ?? []
  const isJoined = participants.some((p) => p.user_id === member.id)
  const isFull =
    event.max_participants != null && participants.length >= event.max_participants
  const isOrganizer = event.organizer_id === member.id

  return (
    <div className="bg-white min-h-[calc(100vh-6rem)]">
      {/* HERO */}
      {event.cover_image_url ? (
        <div className="relative h-[50vh] md:h-[60vh] bg-neutral-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-10 text-white">
            <p className="text-[10px] tracking-luxe opacity-80">
              {EVENT_TYPE_LABELS[event.event_type]}
              {event.event_date && ` · ${event.event_date}`}
            </p>
            <h1 className="font-serif text-4xl md:text-6xl mt-3 leading-tight">{event.title}</h1>
          </div>
        </div>
      ) : (
        <div className="px-8 md:px-16 pt-16 pb-10 border-b hairline">
          <p className="text-[10px] tracking-luxe text-neutral-400">
            {EVENT_TYPE_LABELS[event.event_type]}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl mt-3 leading-tight">{event.title}</h1>
        </div>
      )}

      <div className="px-8 md:px-16 py-5 border-b hairline flex items-center justify-between">
        <Link
          href="/invitation"
          className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK
        </Link>
        {isOrganizer && (
          <Link
            href={`/invitation/${id}/edit`}
            className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
          >
            EDIT
          </Link>
        )}
      </div>

      <section className="px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-12 gap-10 border-b hairline">
        <div className="md:col-span-4 space-y-6">
          {event.event_date && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">DATE</p>
              <p className="font-serif text-2xl mt-2">
                {event.event_date}
                {event.event_time && (
                  <span className="text-neutral-500 ml-2">{event.event_time.slice(0, 5)}</span>
                )}
              </p>
            </div>
          )}
          {event.budget_yen != null && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">BUDGET / FEE</p>
              <p className="font-serif text-2xl mt-2">¥{event.budget_yen.toLocaleString()}</p>
            </div>
          )}
          {event.max_participants != null && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">PARTICIPANTS</p>
              <p className="font-serif text-2xl mt-2">
                {participants.length} / {event.max_participants} 名
              </p>
            </div>
          )}
          {event.deadline && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">DEADLINE</p>
              <p className="font-serif text-base mt-2">
                {new Date(event.deadline).toLocaleString('ja-JP')}
              </p>
            </div>
          )}
        </div>

        <div className="md:col-span-8 space-y-6">
          {event.description && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">DESCRIPTION</p>
              <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-neutral-800">
                {event.description}
              </p>
            </div>
          )}
          {(event.location_text || event.spot || event.sake) && (
            <div className="pt-4 border-t hairline space-y-3 text-sm text-neutral-700">
              {event.spot && (
                <div>
                  <p className="text-[10px] tracking-luxe text-neutral-400">SPOT</p>
                  <Link
                    href={`/spots/${event.spot.id}`}
                    className="font-serif text-xl hover:underline"
                  >
                    {event.spot.name}
                    {event.spot.city && (
                      <span className="text-neutral-400 text-sm ml-2">
                        {event.spot.city}
                      </span>
                    )}
                  </Link>
                </div>
              )}
              {event.sake && (
                <div>
                  <p className="text-[10px] tracking-luxe text-neutral-400">SAKE</p>
                  <Link
                    href={`/sake/${event.sake.id}`}
                    className="font-serif text-xl hover:underline"
                  >
                    {event.sake.name}
                    {event.sake.brewery && (
                      <span className="text-neutral-400 text-sm ml-2">
                        {event.sake.brewery}
                      </span>
                    )}
                  </Link>
                </div>
              )}
              {event.location_text && !event.spot && (
                <div>
                  <p className="text-[10px] tracking-luxe text-neutral-400">LOCATION</p>
                  <p className="font-serif text-xl">{event.location_text}</p>
                </div>
              )}
            </div>
          )}

          <div className="pt-6">
            {event.status === 'open' ? (
              <JoinEventButton eventId={id} isJoined={isJoined} isFull={isFull} />
            ) : (
              <p className="text-sm text-neutral-500 uppercase tracking-luxe">
                {event.status}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
