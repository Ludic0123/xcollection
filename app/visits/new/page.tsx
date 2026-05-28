export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import VisitFormWithPicker, { type SpotLite } from '@/components/VisitFormWithPicker'

export default async function NewVisitPage() {
  const supabase = await createClient()
  const [{ data }, { data: ing }] = await Promise.all([
    supabase.from('spots').select('id, name, prefecture, city, genre').order('name'),
    supabase
      .from('master_ingredients')
      .select('genre, name')
      .order('genre')
      .order('display_order')
      .order('name'),
  ])
  const spots = (data ?? []) as SpotLite[]
  const ingredients = ing ?? []

  return (
    <div className="bg-white min-h-screen px-8 md:px-16 py-12 max-w-3xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK
      </Link>
      <h1 className="font-serif text-4xl italic font-light mb-2">Log a visit.</h1>
      <p className="text-sm text-neutral-500 mb-6">
        2回目以降の訪問記録（ブログ投稿）。お店を選んで詳細を記録します。初回はお店の登録画面と同時に記入してください。
      </p>
      <VisitFormWithPicker spots={spots} ingredients={ingredients} />
    </div>
  )
}
