import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import VisitForm from '@/components/VisitForm'
import type { Spot } from '@/types'

export default async function NewVisitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('spots').select('id, name, genre').eq('id', id).single()
  if (!data) notFound()

  // お店のジャンルに対応する食材
  let ingredientOptions: { genre: string; name: string }[] = []
  if (data.genre) {
    const { data: ing } = await supabase
      .from('master_ingredients')
      .select('genre, name')
      .eq('genre', data.genre)
      .order('display_order')
      .order('name')
    ingredientOptions = ing ?? []
  }

  return (
    <div className="max-w-2xl">
      <Link
        href={`/spots/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        詳細へ戻る
      </Link>
      <h1 className="text-2xl font-bold mb-1">訪問記録を追加</h1>
      <p className="text-sm text-gray-500 mb-6">{(data as Spot).name}</p>
      <VisitForm spotId={id} ingredientOptions={ingredientOptions} />
    </div>
  )
}
