import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import TripItemForm from '@/components/TripItemForm'
import type { Spot, TripPlan } from '@/types'

export default async function NewTripItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: planData } = await supabase
    .from('trip_plans')
    .select('id, title')
    .eq('id', id)
    .single()
  if (!planData) notFound()

  const { data: spotsData } = await supabase
    .from('spots')
    .select('id, name, category, genre, city')
    .order('name', { ascending: true })
  const spots = (spotsData ?? []) as Pick<Spot, 'id' | 'name' | 'category' | 'genre' | 'city'>[]

  return (
    <div className="max-w-2xl">
      <Link
        href={`/trips/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        プランへ戻る
      </Link>
      <h1 className="text-2xl font-bold mb-1">行き先を追加</h1>
      <p className="text-sm text-gray-500 mb-6">{(planData as TripPlan).title}</p>
      <TripItemForm planId={id} spots={spots} />
    </div>
  )
}
