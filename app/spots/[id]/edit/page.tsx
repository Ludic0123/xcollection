import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import SpotForm from '@/components/SpotForm'
import { fetchSpotMasters } from '@/lib/masters'
import type { Spot, Visit } from '@/types'

export default async function EditSpotPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data }, masters, { data: firstVisit }] = await Promise.all([
    supabase.from('spots').select('*').eq('id', id).single(),
    fetchSpotMasters(),
    supabase
      .from('visits')
      .select('*')
      .eq('spot_id', id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])
  if (!data) notFound()

  return (
    <div>
      <Link
        href={`/spots/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        詳細へ戻る
      </Link>
      <h1 className="text-2xl font-bold mb-6">編集</h1>
      <SpotForm
        spot={data as Spot}
        firstVisit={(firstVisit as Visit) ?? null}
        {...masters}
      />
    </div>
  )
}
