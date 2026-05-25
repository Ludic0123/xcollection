import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SakeForm from '@/components/SakeForm'
import { fetchSakeMasters } from '@/lib/masters'

export default async function NewSakePage() {
  const masters = await fetchSakeMasters()
  return (
    <div className="bg-white min-h-screen px-8 md:px-16 py-12">
      <Link
        href="/sake"
        className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK
      </Link>
      <h1 className="font-serif text-4xl italic font-light mb-6">New sake.</h1>
      <SakeForm {...masters} />
    </div>
  )
}
