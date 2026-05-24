import SpotForm from '@/components/SpotForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { fetchSpotMasters } from '@/lib/masters'

export default async function NewSpotPage() {
  const masters = await fetchSpotMasters()
  return (
    <div>
      <Link
        href="/spots"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        一覧へ
      </Link>
      <h1 className="text-2xl font-bold mb-6">お店・ホテルを新規登録</h1>
      <SpotForm {...masters} />
    </div>
  )
}
