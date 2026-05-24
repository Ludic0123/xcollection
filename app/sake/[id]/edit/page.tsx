import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import SakeForm from '@/components/SakeForm'
import { fetchSakeMasters } from '@/lib/masters'
import type { Sake } from '@/types'

export default async function EditSakePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data }, { sakeTypes }] = await Promise.all([
    supabase.from('sakes').select('*').eq('id', id).single(),
    fetchSakeMasters(),
  ])
  if (!data) notFound()

  return (
    <div className="bg-white min-h-screen px-8 md:px-16 py-12">
      <Link
        href={`/sake/${id}`}
        className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK
      </Link>
      <h1 className="font-serif text-4xl italic font-light mb-6">Edit sake.</h1>
      <SakeForm sake={data as Sake} sakeTypes={sakeTypes} />
    </div>
  )
}
