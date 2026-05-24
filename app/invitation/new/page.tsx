import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMember } from '@/lib/auth'
import EventForm from '@/components/EventForm'

export default async function NewEventPage() {
  const member = await getCurrentMember()
  if (!member) redirect('/login?redirect=/invitation/new')

  const supabase = await createClient()
  const [{ data: spots }, { data: sakes }] = await Promise.all([
    supabase.from('spots').select('id, name, city').order('name'),
    supabase.from('sakes').select('id, name, brewery').order('name'),
  ])

  return (
    <div className="bg-white min-h-[calc(100vh-6rem)] px-8 md:px-16 py-12">
      <Link
        href="/invitation"
        className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK
      </Link>
      <h1 className="font-serif text-4xl italic font-light mb-6">Create gathering.</h1>
      <EventForm spots={spots ?? []} sakes={sakes ?? []} />
    </div>
  )
}
