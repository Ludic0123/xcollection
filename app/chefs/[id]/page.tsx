export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import type { Chef, Spot } from '@/types'
import { CATEGORY_LABELS, type Category } from '@/types'

export default async function ChefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const authed = await isAuthed()

  const [{ data: chefData }, { data: spotsData }] = await Promise.all([
    supabase.from('chefs').select('*').eq('id', id).single(),
    supabase.from('spots').select('*').eq('chef_id', id).order('created_at', { ascending: false }),
  ])
  if (!chefData) notFound()
  const chef = chefData as Chef
  const spots = (spotsData ?? []) as Spot[]

  return (
    <div className="bg-white min-h-screen">
      {/* HERO */}
      {chef.cover_image_url ? (
        <section className="relative h-[55vh] md:h-[70vh] bg-neutral-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={chef.cover_image_url}
            alt={chef.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12 text-white">
            <p className="text-[10px] tracking-luxe opacity-80">
              {chef.specialty ?? 'CHEF'}
              {chef.hometown && ` · ${chef.hometown}`}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl mt-3 leading-tight">{chef.name}</h1>
            {chef.name_kana && (
              <p className="text-xs tracking-luxe opacity-70 mt-2">{chef.name_kana}</p>
            )}
          </div>
        </section>
      ) : (
        <section className="px-8 md:px-16 pt-20 pb-12 border-b hairline">
          <p className="text-[10px] tracking-luxe text-neutral-400">
            {chef.specialty ?? 'CHEF'}
            {chef.hometown && ` · ${chef.hometown}`}
          </p>
          <h1 className="font-serif text-5xl md:text-7xl mt-4 leading-tight">{chef.name}</h1>
          {chef.name_kana && (
            <p className="text-xs tracking-luxe text-neutral-400 mt-2">{chef.name_kana}</p>
          )}
        </section>
      )}

      <div className="px-8 md:px-16 py-5 border-b hairline flex items-center justify-between text-xs">
        <Link
          href="/chefs"
          className="inline-flex items-center gap-1 text-neutral-500 hover:text-black tracking-luxe text-[10px]"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK
        </Link>
        {authed && (
          <Link
            href={`/chefs/${id}/edit`}
            className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
          >
            EDIT
          </Link>
        )}
      </div>

      {/* PROFILE */}
      <section className="px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-12 gap-10 border-b hairline">
        <div className="md:col-span-4 space-y-6">
          {chef.birth_year && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">BORN</p>
              <p className="font-serif text-2xl mt-2">{chef.birth_year}年</p>
            </div>
          )}
          {chef.hometown && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">HOMETOWN</p>
              <p className="font-serif text-xl mt-2">{chef.hometown}</p>
            </div>
          )}
          {chef.specialty && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">SPECIALTY</p>
              <p className="font-serif text-xl mt-2">{chef.specialty}</p>
            </div>
          )}
        </div>

        <div className="md:col-span-8 space-y-8">
          {chef.bio && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">BIOGRAPHY</p>
              <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-neutral-800">
                {chef.bio}
              </p>
            </div>
          )}

          {chef.training_history && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">修行元・修行歴</p>
              <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-neutral-800">
                {chef.training_history}
              </p>
            </div>
          )}

          {chef.awards && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">AWARDS</p>
              <p className="font-serif text-base leading-relaxed whitespace-pre-wrap text-neutral-700">
                {chef.awards}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* RELATED SPOTS */}
      {spots.length > 0 && (
        <section className="px-8 md:px-16 py-12 border-b hairline">
          <p className="text-[10px] tracking-luxe text-neutral-400">CURRENT POSTING</p>
          <h2 className="font-serif text-3xl italic font-light mt-1 mb-6">
            この大将が出る店。
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {spots.map((s) => (
              <Link key={s.id} href={`/spots/${s.id}`} className="block group">
                <div className="aspect-[4/5] bg-neutral-100 overflow-hidden">
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
                <div className="mt-4">
                  <p className="text-[10px] tracking-luxe text-neutral-400">
                    {CATEGORY_LABELS[s.category as Category] ?? ''}
                    {s.city && ` · ${s.city}`}
                  </p>
                  <h3 className="font-serif text-xl mt-1 leading-snug">{s.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* GALLERY */}
      {chef.photo_urls && chef.photo_urls.length > 0 && (
        <section className="px-8 md:px-16 py-12">
          <p className="text-[10px] tracking-luxe text-neutral-400">GALLERY</p>
          <h2 className="font-serif text-3xl italic font-light mt-1 mb-6">Photos.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {chef.photo_urls.map((url, idx) => (
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
