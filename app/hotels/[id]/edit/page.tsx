import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import HotelForm from '@/components/HotelForm'
import { fetchHotelMasters } from '@/lib/masters'
import type { Hotel } from '@/types'

export default async function EditHotelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data }, masters] = await Promise.all([
    supabase.from('hotels').select('*').eq('id', id).single(),
    fetchHotelMasters(),
  ])
  if (!data) notFound()

  return (
    <div className="bg-white min-h-screen px-8 md:px-16 py-12">
      <Link
        href={`/hotels/${id}`}
        className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK
      </Link>
      <h1 className="font-serif text-4xl italic font-light mb-6">Edit hotel.</h1>
      <HotelForm hotel={data as Hotel} {...masters} />
    </div>
  )
}
