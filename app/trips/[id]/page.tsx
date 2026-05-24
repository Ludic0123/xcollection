import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import { ArrowLeft } from 'lucide-react'
import TripItemRow from '@/components/TripItemRow'
import type { Spot, TripPlan, TripPlanItem } from '@/types'

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const authed = await isAuthed()

  const { data: planData } = await supabase
    .from('trip_plans')
    .select('*')
    .eq('id', id)
    .single()
  if (!planData) notFound()
  const plan = planData as TripPlan

  const { data: itemsData } = await supabase
    .from('trip_plan_items')
    .select('*, spot:spots(*)')
    .eq('trip_plan_id', id)
    .order('day_number', { ascending: true })
    .order('display_order', { ascending: true })
  const items = (itemsData ?? []) as (TripPlanItem & { spot: Spot | null })[]

  const totalBudget = items.reduce((a, it) => a + (it.estimated_price ?? 0), 0)

  const byDay: Record<number, typeof items> = {}
  for (const it of items) {
    ;(byDay[it.day_number] ||= []).push(it)
  }
  const maxDay = Math.max(1, ...items.map((i) => i.day_number))
  const days = Array.from({ length: maxDay }, (_, i) => i + 1)

  const budgetByDay: Record<number, number> = {}
  for (const d of days) {
    budgetByDay[d] = (byDay[d] ?? []).reduce((a, it) => a + (it.estimated_price ?? 0), 0)
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ====== HERO ====== */}
      <section className="relative">
        {plan.cover_image_url ? (
          <div className="relative h-[60vh] md:h-[75vh] overflow-hidden bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plan.cover_image_url}
              alt={plan.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12 text-white">
              <p className="text-[10px] tracking-luxe opacity-80">
                JOURNEY
                {plan.city && ` · ${plan.city}`}
                {plan.start_date &&
                  ` · ${plan.start_date}${plan.end_date ? ` — ${plan.end_date}` : ''}`}
              </p>
              <h1 className="font-serif text-5xl md:text-7xl mt-3 leading-tight">{plan.title}</h1>
            </div>
          </div>
        ) : (
          <div className="px-8 md:px-16 pt-20 pb-12 border-b hairline">
            <p className="text-[10px] tracking-luxe text-neutral-400">
              JOURNEY
              {plan.city && ` · ${plan.city}`}
              {plan.start_date &&
                ` · ${plan.start_date}${plan.end_date ? ` — ${plan.end_date}` : ''}`}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl mt-4 leading-tight">{plan.title}</h1>
          </div>
        )}
      </section>

      {/* ====== TOP BAR ====== */}
      <div className="px-8 md:px-16 py-5 border-b hairline flex items-center justify-between">
        <Link
          href="/trips"
          className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK
        </Link>
        {authed && (
          <Link
            href={`/trips/${id}/edit`}
            className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
          >
            EDIT
          </Link>
        )}
      </div>

      {/* ====== META ====== */}
      <section className="px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-12 gap-10 border-b hairline">
        <div className="md:col-span-4 space-y-6">
          <div>
            <p className="text-[10px] tracking-luxe text-neutral-400">TOTAL BUDGET</p>
            <p className="font-serif text-5xl mt-2">¥{totalBudget.toLocaleString()}</p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">ITEMS</p>
              <p className="font-serif text-2xl mt-1">{items.length}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">DAYS</p>
              <p className="font-serif text-2xl mt-1">{maxDay}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-8">
          {plan.notes && (
            <>
              <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">NOTES</p>
              <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-neutral-800">
                {plan.notes}
              </p>
            </>
          )}
        </div>
      </section>

      {/* ====== ITINERARY ====== */}
      <section className="px-8 md:px-16 py-12">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-luxe text-neutral-400">ITINERARY</p>
            <h2 className="font-serif text-3xl italic font-light mt-1">Day by day.</h2>
          </div>
          {authed && (
            <Link
              href={`/trips/${id}/items/new`}
              className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
            >
              + ADD STOP
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-400">
            まだ行き先がありません。
          </div>
        ) : (
          <div className="space-y-12">
            {days.map((d) => (
              <div key={d}>
                <div className="flex items-baseline justify-between mb-4 pb-3 border-b hairline">
                  <p className="font-serif text-2xl">
                    Day <span className="italic">{String(d).padStart(2, '0')}</span>
                  </p>
                  <p className="text-xs text-neutral-500">
                    SUBTOTAL ¥{budgetByDay[d].toLocaleString()}
                  </p>
                </div>
                {(byDay[d] ?? []).length === 0 ? (
                  <p className="text-xs text-neutral-400 py-4">この日には予定がありません</p>
                ) : (
                  <ul className="space-y-px bg-neutral-100">
                    {(byDay[d] ?? []).map((it) => (
                      <TripItemRow key={it.id} item={it} planId={id} canEdit={authed} />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
