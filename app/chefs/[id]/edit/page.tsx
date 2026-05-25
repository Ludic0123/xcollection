import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ChefForm from '@/components/ChefForm'
import type { Chef } from '@/types'

export default async function EditChefPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('chefs').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="bg-white min-h-screen px-8 md:px-16 py-12">
      <Link
        href={`/chefs/${id}`}
        className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK
      </Link>
      <h1 className="font-serif text-4xl italic font-light mb-6">Edit chef.</h1>
      <ChefForm chef={data as Chef} />
    </div>
  )
}
