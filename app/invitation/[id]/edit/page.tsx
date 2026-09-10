import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMember } from '@/lib/auth'
import EventForm from '@/components/EventForm'
import type { AppEvent } from '@/types'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const member = await getCurrentMember()
  if (!member) redirect(`/login?redirect=/invitation/${id}/edit`)
  const supabase = await createClient()
  const [event, spots, sakes] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).maybeSingle(),
    supabase.from('spots').select('id, name, city').order('name'),
    supabase.from('sakes').select('id, name, brewery').order('name'),
  ])
  const error = [event.error, spots.error, sakes.error].find(Boolean)
  if (error) throw new Error(error.message)
  if (!event.data || event.data.organizer_id !== member.id) notFound()
  return <div className="bg-white min-h-[calc(100vh-6rem)] px-8 md:px-16 py-12">
    <Link href={`/invitation/${id}`} className="ui-action inline-flex items-center gap-1 text-xs tracking-luxe text-neutral-500 hover:text-black mb-4">
      <ArrowLeft className="w-3 h-3" />BACK
    </Link>
    <h1 className="font-serif text-4xl italic font-light mb-6">Edit gathering.</h1>
    <EventForm event={event.data as AppEvent} spots={spots.data ?? []} sakes={sakes.data ?? []} />
  </div>
}
