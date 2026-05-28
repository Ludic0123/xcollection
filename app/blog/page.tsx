export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type PhotoItem =
  | string
  | { url: string; caption?: string | null; ingredients?: string[] | null }

type Block =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; caption?: string | null; ingredients?: string[] | null }

type BlogEntry = {
  id: string
  user_id: string
  visited_at: string
  rating: number | null
  title: string | null
  comment: string | null
  body_blocks: Block[] | null
  photo_urls: PhotoItem[] | null
  spot:
    | {
        id: string
        name: string
        prefecture: string | null
        city: string | null
        cover_image_url: string | null
        photo_urls: string[] | null
      }
    | null
}

function normalizePhotos(
  photos: PhotoItem[] | null
): { url: string; caption: string; ingredients: string[] }[] {
  if (!photos) return []
  return photos
    .map((p) =>
      typeof p === 'string'
        ? { url: p, caption: '', ingredients: [] }
        : { url: p.url, caption: p.caption ?? '', ingredients: p.ingredients ?? [] }
    )
    .filter((p) => p.url)
}

export default async function BlogPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('visits')
    .select(
      'id, user_id, visited_at, rating, title, comment, body_blocks, photo_urls, spot:spots(id, name, prefecture, city, cover_image_url, photo_urls)'
    )
    .order('visited_at', { ascending: false })
    .order('created_at', { ascending: false })

  const entries = (data ?? []) as unknown as BlogEntry[]

  // 著者名を取得
  const userIds = Array.from(new Set(entries.map((e) => e.user_id))).filter(Boolean)
  const authorMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: members } = await supabase
      .from('members')
      .select('id, last_name_kanji, first_name_kanji, member_number')
      .in('id', userIds)
    for (const m of members ?? []) {
      const name = [m.last_name_kanji, m.first_name_kanji].filter(Boolean).join(' ')
      authorMap[m.id] = name || `MEMBER ${m.member_number}`
    }
  }

  return (
    <div className="bg-white min-h-[calc(100vh-6rem)]">
      {/* HERO */}
      <div className="px-4 md:px-16 pt-4 pb-3 md:pt-12 md:pb-8 border-b hairline">
        <p className="text-[9px] tracking-luxe text-neutral-400">JOURNAL</p>
        <h1 className="font-serif text-3xl md:text-6xl mt-1 md:mt-3 italic font-light">Blog.</h1>
        <p className="text-[10px] md:text-sm text-neutral-500 mt-1 md:mt-2">
          訪問記録・ブログ投稿の時系列フィード
        </p>
      </div>

      <section className="px-4 md:px-16 py-8 md:py-12 max-w-3xl">
        {entries.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-400">まだ投稿はありません。</p>
        ) : (
          <div className="space-y-16">
            {entries.map((e) => {
              const blocks = e.body_blocks ?? []
              const hasBlocks = blocks.length > 0
              const legacyPhotos = normalizePhotos(e.photo_urls)
              const authorName = authorMap[e.user_id]
              const dateStr = new Date(e.visited_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
              const loc =
                e.spot && (e.spot.prefecture || e.spot.city)
                  ? [e.spot.prefecture, e.spot.city].filter(Boolean).join(' ')
                  : ''
              return (
                <article key={e.id} className="border-b hairline pb-14 last:border-b-0">
                  <p className="text-[10px] tracking-luxe text-neutral-400">
                    {dateStr}
                    {loc && ` · ${loc}`}
                  </p>
                  {e.title && (
                    <h2 className="font-serif text-3xl md:text-4xl font-light mt-2 leading-tight">
                      {e.title}
                    </h2>
                  )}
                  {e.spot && (
                    <p className="text-sm text-neutral-500 mt-2">
                      <Link href={`/spots/${e.spot.id}`} className="italic font-serif hover:underline">
                        {e.spot.name}
                      </Link>
                    </p>
                  )}

                  {/* 本文 */}
                  {hasBlocks ? (
                    <div className="mt-6 space-y-5">
                      {blocks.map((b, i) =>
                        b.type === 'text' ? (
                          <p
                            key={i}
                            className="text-sm md:text-base text-neutral-700 leading-relaxed whitespace-pre-wrap"
                          >
                            {b.text}
                          </p>
                        ) : b.url ? (
                          <figure key={i}>
                            <div className="bg-neutral-100 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={b.url}
                                alt={b.caption ?? ''}
                                className="w-full max-h-[70vh] object-cover"
                              />
                            </div>
                            {b.caption && (
                              <figcaption className="text-xs text-neutral-500 mt-1.5 font-serif text-center">
                                {b.caption}
                              </figcaption>
                            )}
                            {b.ingredients && b.ingredients.length > 0 && (
                              <div className="flex flex-wrap gap-1 justify-center mt-1">
                                {b.ingredients.map((ing) => (
                                  <span
                                    key={ing}
                                    className="text-[9px] tracking-luxe text-neutral-500 bg-neutral-100 px-1.5 py-0.5"
                                  >
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            )}
                          </figure>
                        ) : null
                      )}
                    </div>
                  ) : (
                    <>
                      {e.comment && (
                        <p className="text-sm md:text-base text-neutral-700 mt-5 leading-relaxed whitespace-pre-wrap">
                          {e.comment}
                        </p>
                      )}
                      {legacyPhotos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                          {legacyPhotos.map((p, i) => (
                            <figure key={i}>
                              <div className="aspect-square bg-neutral-100 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.url} alt={p.caption || ''} className="w-full h-full object-cover" />
                              </div>
                              {p.caption && (
                                <figcaption className="text-xs text-neutral-600 mt-1.5 font-serif">
                                  {p.caption}
                                </figcaption>
                              )}
                              {p.ingredients.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {p.ingredients.map((ing) => (
                                    <span
                                      key={ing}
                                      className="text-[9px] tracking-luxe text-neutral-500 bg-neutral-100 px-1.5 py-0.5"
                                    >
                                      {ing}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </figure>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {authorName && (
                    <p className="text-[10px] tracking-luxe text-neutral-400 mt-6">
                      BY {authorName.toUpperCase()}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
