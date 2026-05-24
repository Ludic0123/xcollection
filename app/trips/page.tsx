import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import type { TripPlan, TripPlanItem } from '@/types'

export default async function TripsPage() {
  const supabase = await createClient()
  const authed = await isAuthed()

  const { data: plans } = await supabase
    .from('trip_plans')
    .select('*')
    .order('created_at', { ascending: false })
  const list = (plans ?? []) as TripPlan[]

  const ids = list.map((p) => p.id)
  const budgetByPlan: Record<string, { total: number; items: number; days: number }> = {}
  if (ids.length > 0) {
    const { data: items } = await supabase
      .from('trip_plan_items')
      .select('trip_plan_id, estimated_price, day_number')
      .in('trip_plan_id', ids)
    if (items) {
      for (const it of items as Pick<TripPlanItem, 'trip_plan_id' | 'estimated_price' | 'day_number'>[]) {
        const b = (budgetByPlan[it.trip_plan_id] ||= { total: 0, items: 0, days: 0 })
        b.total += it.estimated_price ?? 0
        b.items += 1
        if (it.day_number > b.days) b.days = it.day_number
      }
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-8 md:px-16 pt-14 pb-10 border-b hairline">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] tracking-luxe text-neutral-400">JOURNEYS</p>
          {authed && (
            <Link
              href="/trips/new"
              className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
            >
              + NEW JOURNEY
            </Link>
          )}
        </div>
        <h1 className="font-serif text-5xl md:text-7xl mt-4 italic font-light">Journeys.</h1>
        <p className="text-sm text-neutral-500 mt-3">
          {list.length} plan{list.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="px-8 md:px-16 py-12">
        {list.length === 0 ? (
          <div className="py-24 text-center text-sm text-neutral-400">
            まだプランがありません。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {list.map((plan) => {
              const b = budgetByPlan[plan.id] ?? { total: 0, items: 0, days: 0 }
              return (
                <Link key={plan.id} href={`/trips/${plan.id}`} className="block group">
                  <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
                    {plan.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={plan.cover_image_url}
                        alt={plan.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-serif italic text-neutral-300 text-5xl">
                          {plan.title.slice(0, 1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-5">
                    <p className="text-[10px] tracking-luxe text-neutral-400">
                      {plan.city ?? 'JOURNEY'}
                      {plan.start_date &&
                        ` · ${new Date(plan.start_date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                        })}`}
                    </p>
                    <h3 className="font-serif text-2xl mt-2 leading-tight">{plan.title}</h3>
                    <div className="mt-4 pt-3 border-t hairline flex items-baseline justify-between">
                      <p className="text-xs text-neutral-500">
                        {b.items}件 · {b.days || '-'}日
                      </p>
                      <p className="font-serif text-lg">¥{b.total.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
