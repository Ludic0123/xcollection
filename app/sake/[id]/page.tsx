import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isAuthed } from '@/lib/auth'
import type { Sake } from '@/types'

export default async function SakeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const authed = await isAuthed()
  const { data } = await supabase.from('sakes').select('*').eq('id', id).single()
  if (!data) notFound()
  const sake = data as Sake

  return (
    <div className="bg-white min-h-screen">
      {sake.cover_image_url ? (
        <div className="relative h-[60vh] md:h-[70vh] bg-neutral-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sake.cover_image_url} alt={sake.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12 text-white">
            <p className="text-[10px] tracking-luxe opacity-80">
              {sake.region ?? 'JAPAN'}
              {sake.sake_type && ` · ${sake.sake_type}`}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl mt-3 leading-tight">{sake.name}</h1>
            {sake.brewery && (
              <p className="text-sm mt-2 opacity-80">{sake.brewery}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="px-8 md:px-16 pt-20 pb-12 border-b hairline">
          <p className="text-[10px] tracking-luxe text-neutral-400">
            {sake.region ?? 'JAPAN'}
            {sake.sake_type && ` · ${sake.sake_type}`}
          </p>
          <h1 className="font-serif text-5xl md:text-7xl mt-4 leading-tight">{sake.name}</h1>
          {sake.brewery && <p className="text-sm text-neutral-500 mt-2">{sake.brewery}</p>}
        </div>
      )}

      <div className="px-8 md:px-16 py-5 border-b hairline flex items-center justify-between">
        <Link
          href="/sake"
          className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK
        </Link>
        {authed && (
          <Link
            href={`/sake/${id}/edit`}
            className="text-[10px] tracking-luxe text-neutral-500 hover:text-black"
          >
            EDIT
          </Link>
        )}
      </div>

      <section className="px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-12 gap-10 border-b hairline">
        <div className="md:col-span-4 space-y-6">
          {authed && sake.rating != null && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">
                RATING <span className="text-neutral-300 ml-1">(EDITOR ONLY)</span>
              </p>
              <p className="font-serif text-4xl mt-2">★ {sake.rating}.0</p>
            </div>
          )}
          {sake.rice_polishing_pct != null && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">精米歩合</p>
              <p className="font-serif text-2xl mt-2">{sake.rice_polishing_pct}%</p>
            </div>
          )}
          {sake.alcohol_pct != null && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">アルコール</p>
              <p className="font-serif text-2xl mt-2">{sake.alcohol_pct}%</p>
            </div>
          )}
          {sake.price_yen != null && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">参考価格</p>
              <p className="font-serif text-2xl mt-2">¥{sake.price_yen.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="md:col-span-8 space-y-6">
          {sake.notes && (
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400 mb-3">NOTES</p>
              <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-neutral-800">
                {sake.notes}
              </p>
            </div>
          )}
        </div>
      </section>

      {sake.photo_urls && sake.photo_urls.length > 0 && (
        <section className="px-8 md:px-16 py-12">
          <p className="text-[10px] tracking-luxe text-neutral-400">GALLERY</p>
          <h2 className="font-serif text-3xl italic font-light mt-1 mb-6">All photos.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {sake.photo_urls.map((url, idx) => (
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
