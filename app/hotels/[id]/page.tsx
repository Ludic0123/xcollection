export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import type { Hotel, Stay } from '@/types'

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const authed = await isAuthed()

  const [
    { data: hotelData },
    { data: staysData },
    { data: priceRanges },
    { data: reservationMasters },
  ] = await Promise.all([
    supabase.from('hotels').select('*').eq('id', id).single(),
    supabase.from('stays').select('*').eq('hotel_id', id).order('check_in_date', { ascending: false }),
    supabase.from('master_price_ranges').select('level, label'),
    supabase.from('master_reservation_methods').select('value, label'),
  ])
  if (!hotelData) notFound()
  const hotel = hotelData as Hotel
  const stays = (staysData ?? []) as Stay[]

  // 集約データ（個別の宿泊履歴は表示しない）
  const stayCount = stays.length
  const totalPaid = stays.reduce((a, s) => a + (s.price ?? 0), 0)
  const lastStayDate = stays[0]?.check_in_date ?? null
  const stayPhotos = stays.flatMap((s) => s.photo_urls ?? [])
  const allPhotos = [...(hotel.photo_urls ?? []), ...stayPhotos]
  const priceLabel = priceRanges?.find((p) => p.level === hotel.price_range)?.label
  const reservationLabel: Record<string, string> = Object.fromEntries(
    (reservationMasters ?? []).map((r) => [r.value, r.label])
  )

  const rated = stays.filter((s) => s.rating != null)
  const avg =
    hotel.rating != null
      ? hotel.rating
      : rated.length > 0
      ? rated.reduce((a, s) => a + (s.rating ?? 0), 0) / rated.length
      : null

  return (
    <div className="bg-white min-h-screen">
      {/* HERO */}
      <section className="relative">
        {hotel.cover_image_url ? (
          <div className="relative h-[60vh] md:h-[75vh] overflow-hidden bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hotel.cover_image_url}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12 text-white">
              <p className="text-[10px] tracking-luxe opacity-80">
                {hotel.brand ?? 'HOTEL'}
                {hotel.prefecture && ` · ${hotel.prefecture}`}
              </p>
              <h1 className="font-serif text-5xl md:text-7xl mt-3 leading-tight">{hotel.name}</h1>
            </div>
          </div>
        ) : (
          <div className="px-8 md:px-16 pt-20 pb-12 border-b hairline">
            <p className="text-[10px] tracking-luxe text-neutral-400">
              {hotel.brand ?? 'HOTEL'}
              {hotel.prefecture && ` · ${hotel.prefecture}`}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl mt-4 leading-tight">{hotel.name}</h1>
          </div>
        )}
      </section>

      {/* TOP BAR */}
      <div className="px-8 md:px-16 py-5 border-b hairline flex items-center justify-between text-xs">
        <Link
          href="/hotels"
          className="inline-flex items-center gap-1 text-neutral-500 hover:text-black tracking-luxe text-[10px]"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK
        </Link>
        {authed && (
          <div className="flex items-center gap-5">
            <Link
              href={`/hotels/${id}/stay`}
              className="text-[10px] tracking-luxe bg-black text-white px-3 py-1.5 hover:bg-neutral-800"
            >
              + LOG STAY
            </Link>
            <Link
              href={`/hotels/${id}/edit`}
              className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
            >
              EDIT
            </Link>
          </div>
        )}
      </div>

      {/* META */}
      <section className="px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-12 gap-10 border-b hairline">
        <div className="md:col-span-4 space-y-6">
          {authed && avg !== null && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">
                RATING <span className="text-neutral-300 ml-1">(EDITOR ONLY)</span>
              </p>
              <p className="font-serif text-4xl mt-2">★ {avg.toFixed(1)}</p>
            </div>
          )}
          {hotel.price_range && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">PRICE / NIGHT</p>
              <p className="font-serif text-2xl mt-2">{priceLabel ?? `Lv. ${hotel.price_range}`}</p>
            </div>
          )}
          {stayCount > 0 && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">STAYS</p>
              <p className="font-serif text-2xl mt-2">{stayCount}回</p>
              {totalPaid > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  累計 ¥{totalPaid.toLocaleString()}
                </p>
              )}
              {lastStayDate && (
                <p className="text-xs text-neutral-500">
                  最終 {new Date(lastStayDate).toLocaleDateString('ja-JP')}
                </p>
              )}
            </div>
          )}
          {hotel.reservation_methods && hotel.reservation_methods.length > 0 && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">RESERVATION</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {hotel.reservation_methods.map((m) => (
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
          {hotel.notes && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">NOTES</p>
              <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-neutral-800">
                {hotel.notes}
              </p>
            </div>
          )}
          {(hotel.address || hotel.url || hotel.map_url) && (
            <div className="space-y-2 text-sm text-neutral-700 pt-4 border-t hairline">
              {hotel.address && <div>{hotel.address}</div>}
              <div className="flex gap-5 text-xs">
                {hotel.url && (
                  <a
                    href={hotel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 tracking-luxe text-neutral-500 hover:text-black"
                  >
                    <ExternalLink className="w-3 h-3" />
                    WEBSITE
                  </a>
                )}
                {hotel.map_url && (
                  <a
                    href={hotel.map_url}
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

      {/* GALLERY */}
      {allPhotos.length > 0 && (
        <section className="px-8 md:px-16 py-12">
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
    </div>
  )
}
