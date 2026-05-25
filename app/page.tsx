export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMember } from '@/lib/auth'
import {
  CATEGORY_LABELS,
  EVENT_TYPE_LABELS,
  type AppEvent,
  type Category,
  type Hotel,
  type Sake,
  type Spot,
  type TripPlan,
} from '@/types'

// ヒーロー画像 — public/ フォルダに置いたファイルを参照
// 差し替えたければ public/ に画像を置いて、ここのファイル名を変えるだけ
const HERO_IMAGE = '/hero.png'

export default async function TopPage() {
  const supabase = await createClient()
  const member = await getCurrentMember()

  const [
    { count: spotCount },
    { count: hotelCount },
    { count: tripCount },
    { data: featuredData },
    { data: tasteData },
    { data: stayData },
    { data: tripData },
    { data: sakeData },
    { data: eventsData },
  ] = await Promise.all([
    supabase.from('spots').select('id', { count: 'exact', head: true }),
    supabase.from('hotels').select('id', { count: 'exact', head: true }),
    supabase.from('trip_plans').select('id', { count: 'exact', head: true }),
    supabase
      .from('spots')
      .select('*')
      .eq('is_featured', true)
      .order('updated_at', { ascending: false })
      .limit(8),
    supabase
      .from('spots')
      .select('*')
      .in('category', ['restaurant', 'cafe', 'bar', 'other'])
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('hotels')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('trip_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('sakes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12),
    member
      ? supabase
          .from('events')
          .select('id, event_type, title, cover_image_url, event_date, location_text, max_participants, budget_yen, status')
          .eq('status', 'open')
          .order('event_date', { ascending: true, nullsFirst: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
  ])

  const featured = (featuredData ?? []) as Spot[]
  const tastes = (tasteData ?? []) as Spot[]
  const stays = (stayData ?? []) as Hotel[]
  const trips = (tripData ?? []) as TripPlan[]
  const sakes = (sakeData ?? []) as Sake[]
  const events = (eventsData ?? []) as Pick<
    AppEvent,
    'id' | 'event_type' | 'title' | 'cover_image_url' | 'event_date' | 'location_text' | 'max_participants' | 'budget_yen' | 'status'
  >[]
  const isMember = !!member

  return (
    <div className="bg-white">
      {/* ====== HERO ====== */}
      <section className="relative h-[70vh] min-h-[480px] md:h-[calc(100vh-6rem)] md:min-h-[640px] overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />

        {/* 中央タイトル */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1 className="font-serif text-[19vw] md:text-[15vw] leading-[0.9] tracking-tight italic font-light text-white text-center">
            Collection.
          </h1>
        </div>

        {/* 右下に縦並びステータス（大きめ） */}
        <div className="absolute bottom-5 md:bottom-14 right-5 md:right-14 text-white text-right space-y-3 md:space-y-7">
          <HeroStat label="TASTES" value={spotCount ?? 0} href="/spots" />
          <HeroStat label="STAYS" value={hotelCount ?? 0} href="/spots?category=hotel" />
          <HeroStat label="JOURNEYS" value={tripCount ?? 0} href="/trips" />
        </div>

        {/* 左下にキャプション (モバイルでは省略) */}
        <div className="hidden md:block absolute bottom-14 left-14">
          <p className="text-[10px] tracking-luxe text-white/70">
            CURATED EATS<br />STAYS · JOURNEYS
          </p>
        </div>
      </section>

      {/* ====== FEATURED BANNER ====== */}
      {featured.length > 0 && (
        <section className="bg-black text-white border-b hairline">
          <div className="px-8 md:px-14 pt-6 pb-2 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl md:text-3xl italic font-light">Featured.</h2>
          </div>
          <div className="overflow-x-auto pb-6">
            <div className="snap-x snap-mandatory flex gap-5 px-8 md:px-14">
              {featured.map((s) => (
              <Link
                key={s.id}
                href={`/spots/${s.id}`}
                className="snap-start shrink-0 w-[70vw] md:w-[34vw] group"
              >
                <div className="aspect-[4/3] bg-neutral-900 overflow-hidden relative">
                  {s.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.cover_image_url}
                      alt={s.name}
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif italic text-white/20 text-6xl">
                        {s.name.slice(0, 1)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <h3 className="font-serif text-xl md:text-2xl leading-tight">
                      {s.name}
                      {(s.prefecture || s.city) && (
                        <span className="ml-2 font-sans font-light text-[10px] md:text-xs tracking-luxe text-white/60 align-middle">
                          {[s.prefecture, s.city].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
              </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== INVITATION (members only) ====== */}
      {isMember && events.length > 0 && (
        <section className="border-b hairline bg-neutral-50">
          <div className="px-8 md:px-14 pt-5 pb-2 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl md:text-3xl italic font-light">Invitation.</h2>
            <Link
              href="/invitation"
              className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
            >
              VIEW ALL →
            </Link>
          </div>
          <Carousel>
            {events.map((e) => (
              <Link
                key={e.id}
                href={`/invitation/${e.id}`}
                className="snap-start shrink-0 w-72 md:w-80 bg-white border hairline group"
              >
                <div className="aspect-[3/2] bg-neutral-100 overflow-hidden">
                  {e.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.cover_image_url}
                      alt={e.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif italic text-neutral-300 text-4xl">
                      {e.title.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] tracking-luxe text-neutral-400">
                    {EVENT_TYPE_LABELS[e.event_type]}
                    {e.event_date && ` · ${e.event_date}`}
                  </p>
                  <h3 className="font-serif text-xl mt-1 leading-snug">{e.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-neutral-500">
                    {e.location_text && <span>{e.location_text}</span>}
                    {e.budget_yen != null && <span>¥{e.budget_yen.toLocaleString()}</span>}
                    {e.max_participants != null && <span>〜{e.max_participants}名</span>}
                  </div>
                </div>
              </Link>
            ))}
          </Carousel>
        </section>
      )}

      {/* ====== TASTES SECTION ====== */}
      <CarouselSection
        label="EATS · CAFÉS · BARS"
        title="Tastes."
        viewAllHref="/spots"
      >
        {tastes.length === 0 ? (
          <EmptyState />
        ) : (
          tastes.map((s) => <SpotCard key={s.id} spot={s} />)
        )}
      </CarouselSection>

      {/* ====== SAKE SECTION ====== */}
      {sakes.length > 0 && (
        <CarouselSection label="JAPANESE SAKE" title="Sake." viewAllHref="/sake">
          {sakes.map((s) => (
            <Link
              key={s.id}
              href={`/sake/${s.id}`}
              className="snap-start shrink-0 w-36 md:w-44 group"
            >
              <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
                {s.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.cover_image_url}
                    alt={s.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif italic text-neutral-300 text-3xl">
                    {s.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-[9px] tracking-luxe text-neutral-400">
                  {s.region ?? 'JAPAN'}
                </p>
                <h3 className="font-serif text-base mt-0.5 leading-snug">{s.name}</h3>
                {s.brewery && (
                  <p className="text-[10px] text-neutral-500 mt-0.5">{s.brewery}</p>
                )}
              </div>
            </Link>
          ))}
        </CarouselSection>
      )}

      {/* ====== STAYS SECTION ====== */}
      <CarouselSection
        label="HOTELS · RYOKAN"
        title="Stays."
        viewAllHref="/hotels"
      >
        {stays.length === 0 ? (
          <EmptyState />
        ) : (
          stays.map((h) => <HotelCard key={h.id} hotel={h} />)
        )}
      </CarouselSection>

      {/* ====== JOURNEYS SECTION ====== */}
      <CarouselSection label="CITY PLANS" title="Journeys." viewAllHref="/trips">
        {trips.length === 0 ? (
          <EmptyState />
        ) : (
          trips.map((t) => <TripCard key={t.id} trip={t} />)
        )}
      </CarouselSection>
    </div>
  )
}

/* ============== Sub-components ============== */

function HeroStat({
  label,
  value,
  href,
}: {
  label: string
  value: number
  href: string
}) {
  return (
    <Link href={href} className="block group">
      <p className="text-[10px] md:text-xs tracking-luxe text-white/70 group-hover:text-white transition-colors">
        {label}
      </p>
      <p className="font-serif text-3xl md:text-6xl mt-0.5 md:mt-1 leading-none group-hover:italic transition-all">
        {String(value).padStart(2, '0')}
      </p>
    </Link>
  )
}

function CarouselSection({
  title,
  viewAllHref,
  children,
}: {
  label?: string
  title: string
  viewAllHref: string
  children: React.ReactNode
}) {
  return (
    <section className="border-b hairline">
      <div className="px-8 md:px-14 pt-5 pb-2 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl md:text-3xl italic font-light">{title}</h2>
        <Link
          href={viewAllHref}
          className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
        >
          VIEW ALL →
        </Link>
      </div>
      <Carousel>{children}</Carousel>
    </section>
  )
}

function Carousel({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto pb-5">
      <div className="snap-x snap-mandatory flex gap-4 px-8 md:px-14">{children}</div>
    </div>
  )
}

function SpotCard({ spot }: { spot: Spot }) {
  const location = [spot.prefecture, spot.city].filter(Boolean).join(' · ')
  return (
    <Link
      href={`/spots/${spot.id}`}
      className="snap-start shrink-0 w-36 md:w-44 group"
    >
      <div className="aspect-[4/5] bg-neutral-100 overflow-hidden">
        {spot.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spot.cover_image_url}
            alt={spot.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif italic text-neutral-300 text-3xl">
              {spot.name.slice(0, 1)}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        {location && (
          <p className="text-[9px] tracking-luxe text-neutral-400">{location}</p>
        )}
        <h3 className="font-serif text-base mt-0.5 leading-snug">{spot.name}</h3>
      </div>
    </Link>
  )
}

function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="snap-start shrink-0 w-36 md:w-44 group"
    >
      <div className="aspect-[4/5] bg-neutral-100 overflow-hidden">
        {hotel.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.cover_image_url}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif italic text-neutral-300 text-3xl">
              {hotel.name.slice(0, 1)}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[9px] tracking-luxe text-neutral-400">
          {hotel.brand ?? 'HOTEL'}
          {hotel.prefecture && ` · ${hotel.prefecture}`}
        </p>
        <h3 className="font-serif text-base mt-0.5 leading-snug">{hotel.name}</h3>
      </div>
    </Link>
  )
}

function TripCard({ trip }: { trip: TripPlan }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="snap-start shrink-0 w-36 md:w-44 group"
    >
      <div className="aspect-[4/5] bg-neutral-100 overflow-hidden">
        {trip.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip.cover_image_url}
            alt={trip.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif italic text-neutral-300 text-3xl">
              {trip.title.slice(0, 1)}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[9px] tracking-luxe text-neutral-400">
          {trip.city ?? 'JOURNEY'}
        </p>
        <h3 className="font-serif text-base mt-0.5 leading-snug">{trip.title}</h3>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="py-16 px-8 text-sm text-neutral-300 w-full text-center">
      まだ登録がありません。
    </div>
  )
}
