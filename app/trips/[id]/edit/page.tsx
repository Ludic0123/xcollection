import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import TripPlanForm from '@/components/TripPlanForm'
import type { TripPlan } from '@/types'

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('trip_plans').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div>
      <Link
        href={`/trips/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        プラン詳細へ戻る
      </Link>
      <h1 className="text-2xl font-bold mb-6">プラン編集</h1>
      <TripPlanForm plan={data as TripPlan} />
    </div>
  )
}
