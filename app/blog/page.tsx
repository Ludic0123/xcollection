export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type PhotoItem =
  | string
  | { url: string; caption?: string | null; ingredients?: string[] | null }

type BlogEntry = {
  id: string
  user_id: string
  visited_at: string
  rating: number | null
  comment: string | null
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

type AuthorMap = Record<string, string>

export default async function BlogPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('visits')
    .select(
      'id, user_id, visited_at, rating, comment, photo_urls, spot:spots(id, name, prefecture, city, cover_image_url, photo_urls)'
    )
    .order('visited_at', { ascending: false })
    .order('created_at', { ascending: false })

  const entries = (data ?? []) as unknown as BlogEntry[]

  // 写真を {url, caption, ingredients} 形式に正規化（旧: string[] / 新: object[]）
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

  // 著者名を取得
  const userIds = Array.from(new Set(entries.map((e) => e.user_id))).filter(Boolean)
  const authorMap: AuthorMap = {}
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
        <h1 className="font-serif text-3xl md:text-6xl mt-1 md:mt-3 italic font-light">
          Blog.
        </h1>
        <p className="text-[10px] md:text-sm text-neutral-500 mt-1 md:mt-2">
          訪問記録・ブログ投稿の時系列フィード
        </p>
      </div>

      <section className="px-4 md:px-16 py-8 md:py-12 max-w-4xl">
        {entries.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-400">
            まだ投稿はありません。
          </p>
        ) : (
          <ul className="space-y-10">
            {entries.map((e) => {
              const photos = normalizePhotos(e.photo_urls)
              const cover =
                photos[0]?.url ||
                e.spot?.cover_image_url ||
                (e.spot?.photo_urls && e.spot.photo_urls[0]) ||
                null
              const authorName = authorMap[e.user_id]
              return (
                <li key={e.id} className="border-b hairline pb-10 last:border-b-0">
                  <div className="flex flex-col md:flex-row gap-5">
                    {cover && (
                      <Link
                        href={e.spot ? `/spots/${e.spot.id}` : '#'}
                        className="block w-full md:w-56 shrink-0"
                      >
                        <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cover}
                            alt={e.spot?.name ?? ''}
                            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
                          />
                        </div>
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] tracking-luxe text-neutral-400">
                        {new Date(e.visited_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {e.spot &&
                          (e.spot.prefecture || e.spot.city) &&
                          ` · ${[e.spot.prefecture, e.spot.city].filter(Boolean).join(' ')}`}
                      </p>
                      {e.spot && (
                        <h2 className="font-serif text-3xl md:text-4xl italic font-light mt-2 leading-tight">
                          <Link href={`/spots/${e.spot.id}`} className="hover:underline">
                            {e.spot.name}
                          </Link>
                        </h2>
                      )}
                      {e.comment && (
                        <p className="text-sm md:text-base text-neutral-700 mt-4 leading-relaxed whitespace-pre-wrap">
                          {e.comment}
                        </p>
                      )}
                      {authorName && (
                        <p className="text-[10px] tracking-luxe text-neutral-400 mt-4">
                          BY {authorName.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* キャプション付き写真ギャラリー */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      {photos.map((p, i) => (
                        <figure key={i}>
                          <div className="aspect-square bg-neutral-100 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.url}
                              alt={p.caption || ''}
                              className="w-full h-full object-cover"
                            />
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
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
