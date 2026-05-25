export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import {
  CATEGORY_LABELS,
  type Category,
  type Spot,
  type Visit,
} from '@/types'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import VisitItem from '@/components/VisitItem'

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const authed = await isAuthed()

  const [
    { data: spotData },
    { data: visitsData },
    { data: priceRanges },
    { data: reservationMasters },
  ] = await Promise.all([
    supabase.from('spots').select('*, chef:chefs(id, name, specialty)').eq('id', id).single(),
    supabase.from('visits').select('*').eq('spot_id', id).order('visited_at', { ascending: false }),
    supabase.from('master_price_ranges').select('level, label'),
    supabase.from('master_reservation_methods').select('value, label'),
  ])
  if (!spotData) notFound()
  const spot = spotData as Spot & {
    chef?: { id: string; name: string; specialty: string | null } | null
  }
  const visits = (visitsData ?? []) as Visit[]
  const priceLabel = priceRanges?.find((p) => p.level === spot.price_range)?.label
  const reservationLabel: Record<string, string> = Object.fromEntries(
    (reservationMasters ?? []).map((r) => [r.value, r.label])
  )

  const totalPaid = visits.reduce((a, v) => a + (v.price ?? 0), 0)
  const allPhotos = [
    ...(spot.photo_urls ?? []),
    ...visits.flatMap((v) => v.photo_urls ?? []),
  ]

  // 評価平均はエディターにだけ計算
  const rated = visits.filter((v) => v.rating != null)
  const avg =
    rated.length > 0
      ? rated.reduce((a, v) => a + (v.rating ?? 0), 0) / rated.length
      : null

  return (
    <div className="bg-white min-h-screen">
      {/* HERO */}
      <section className="relative">
        {spot.cover_image_url ? (
          <div className="relative h-[60vh] md:h-[75vh] overflow-hidden bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={spot.cover_image_url}
              alt={spot.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12 text-white">
              <p className="text-[10px] tracking-luxe opacity-80">
                {CATEGORY_LABELS[spot.category as Category]}
                {spot.genre && ` · ${spot.genre}`}
                {spot.city && ` · ${spot.city}`}
              </p>
              <h1 className="font-serif text-5xl md:text-7xl mt-3 leading-tight">{spot.name}</h1>
            </div>
          </div>
        ) : (
          <div className="px-8 md:px-16 pt-20 pb-12 border-b hairline">
            <p className="text-[10px] tracking-luxe text-neutral-400">
              {CATEGORY_LABELS[spot.category as Category]}
              {spot.genre && ` · ${spot.genre}`}
              {spot.city && ` · ${spot.city}`}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl mt-4 leading-tight">{spot.name}</h1>
          </div>
        )}
      </section>

      {/* TOP BAR */}
      <div className="px-8 md:px-16 py-5 border-b hairline flex items-center justify-between text-xs">
        <Link
          href="/spots"
          className="inline-flex items-center gap-1 text-neutral-500 hover:text-black tracking-luxe text-[10px]"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK
        </Link>
        {authed && (
          <Link
            href={`/spots/${id}/edit`}
            className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
          >
            EDIT
          </Link>
        )}
      </div>

      {/* META */}
      <section className="px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-12 gap-10 border-b hairline">
        <div className="md:col-span-4 space-y-6">
          {/* 評価はエディターにのみ表示 */}
          {authed && avg !== null && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">
                RATING <span className="ml-1 text-neutral-300">(EDITOR ONLY)</span>
              </p>
              <p className="font-serif text-4xl mt-2">
                {avg.toFixed(1)}
                <span className="text-base text-neutral-400 ml-2">/ 5.0</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">{rated.length}回評価</p>
            </div>
          )}
          {spot.price_range && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">PRICE</p>
              <p className="font-serif text-2xl mt-2">{priceLabel ?? `Lv. ${spot.price_range}`}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] tracking-luxe text-neutral-400">VISITS</p>
            <p className="font-serif text-2xl mt-2">{visits.length}</p>
            {totalPaid > 0 && (
              <p className="text-xs text-neutral-500 mt-1">
                総支出 ¥{totalPaid.toLocaleString()}
              </p>
            )}
          </div>
          {spot.chef && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">大将・シェフ</p>
              <Link
                href={`/chefs/${spot.chef.id}`}
                className="font-serif text-2xl mt-2 inline-block hover:italic transition-all"
              >
                {spot.chef.name}
              </Link>
              {spot.chef.specialty && (
                <p className="text-xs text-neutral-500 mt-1">{spot.chef.specialty}</p>
              )}
            </div>
          )}
          {spot.reservation_methods && spot.reservation_methods.length > 0 && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">RESERVATION</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {spot.reservation_methods.map((m) => (
                  <span
                    key={m}
                    className="text-xs px-2 py-1 border hairline text-neutral-700"
                  >
                    {reservationLabel[m] ?? m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-8 space-y-6">
          {spot.notes && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">NOTES</p>
              <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-neutral-800">
                {spot.notes}
              </p>
            </div>
          )}
          {(spot.address || spot.url || spot.map_url) && (
            <div className="space-y-2 text-sm text-neutral-700 pt-4 border-t hairline">
              {spot.address && <div>{spot.address}</div>}
              <div className="flex gap-5 text-xs">
                {spot.url && (
                  <a
                    href={spot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 tracking-luxe text-neutral-500 hover:text-black"
                  >
                    <ExternalLink className="w-3 h-3" />
                    WEBSITE
                  </a>
                )}
                {spot.map_url && (
                  <a
                    href={spot.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 tracking-luxe text-neutral-500 hover:text-black"
                  >
                    <ExternalLink className="w-3 h-3" />
                    MAP
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* GALLERY: 全訪問の写真をまとめて */}
      {allPhotos.length > 0 && (
        <section className="px-8 md:px-16 py-12 border-b hairline">
          <p className="text-[10px] tracking-luxe text-neutral-400">GALLERY</p>
          <h2 className="font-serif text-3xl italic font-light mt-1 mb-6">All photos.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {allPhotos.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square bg-neutral-100 overflow-hidden group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* VISITS LOG */}
      <section className="px-8 md:px-16 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-luxe text-neutral-400">VISITS</p>
            <h2 className="font-serif text-3xl italic font-light mt-1">Memories.</h2>
          </div>
          {authed && (
            <Link
              href={`/spots/${id}/visit`}
              className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
            >
              + ADD VISIT
            </Link>
          )}
        </div>

        {visits.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-400">
            まだ訪問記録がありません。
          </div>
        ) : (
          <ul className="space-y-px bg-neutral-100">
            {visits.map((v) => (
              <VisitItem
                key={v.id}
                visit={v}
                spotId={id}
                canEdit={authed}
                showRating={authed}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
