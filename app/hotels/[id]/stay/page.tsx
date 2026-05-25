import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import StayForm from '@/components/StayForm'
import type { Hotel } from '@/types'

export default async function NewStayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('hotels').select('id, name').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="bg-white min-h-screen px-8 md:px-16 py-12 max-w-2xl">
      <Link
        href={`/hotels/${id}`}
        className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK
      </Link>
      <h1 className="font-serif text-3xl italic font-light mb-1">Log a stay.</h1>
      <p className="text-sm text-neutral-500 mb-6">{(data as Hotel).name}</p>
      <StayForm hotelId={id} />
    </div>
  )
}
