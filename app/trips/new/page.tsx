import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TripPlanForm from '@/components/TripPlanForm'

export default function NewTripPage() {
  return (
    <div>
      <Link
        href="/trips"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        プラン一覧へ
      </Link>
      <h1 className="text-2xl font-bold mb-6">新規プラン</h1>
      <TripPlanForm />
    </div>
  )
}
