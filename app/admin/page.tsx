import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [
    { count: spots },
    { count: hotels },
    { count: sakes },
    { count: trips },
    { count: events },
    { count: members },
  ] = await Promise.all([
    supabase.from('spots').select('id', { count: 'exact', head: true }),
    supabase.from('hotels').select('id', { count: 'exact', head: true }),
    supabase.from('sakes').select('id', { count: 'exact', head: true }),
    supabase.from('trip_plans').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('members').select('id', { count: 'exact', head: true }),
  ])

  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">DASHBOARD</p>
      <h1 className="font-serif text-4xl italic font-light mt-1">Overview.</h1>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatTile label="お店" value={spots ?? 0} href="/admin/spots" />
        <StatTile label="ホテル" value={hotels ?? 0} href="/admin/hotels" />
        <StatTile label="日本酒" value={sakes ?? 0} href="/admin/sake" />
        <StatTile label="旅行プラン" value={trips ?? 0} href="/admin/trips" />
        <StatTile label="グルメ会" value={events ?? 0} href="/admin/events" />
        <StatTile label="会員" value={members ?? 0} href="/admin/users" />
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction title="お店を登録" href="/spots/new" desc="飲食店・カフェ・バー" />
        <QuickAction title="ホテルを登録" href="/hotels/new" desc="ホテル・旅館" />
        <QuickAction title="日本酒を登録" href="/sake/new" desc="銘柄登録" />
      </div>
    </div>
  )
}

function StatTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="block bg-white border hairline p-5 hover:border-black transition-colors"
    >
      <p className="text-[10px] tracking-luxe text-neutral-400">{label}</p>
      <p className="font-serif text-3xl mt-2">{value}</p>
    </Link>
  )
}

function QuickAction({
  title,
  href,
  desc,
}: {
  title: string
  href: string
  desc: string
}) {
  return (
    <Link href={href} className="block bg-white border hairline p-6 hover:border-black">
      <p className="text-[10px] tracking-luxe text-neutral-400">QUICK ACTION</p>
      <p className="font-serif text-xl mt-1">{title}</p>
      <p className="text-xs text-neutral-500 mt-2">{desc}</p>
    </Link>
  )
}
