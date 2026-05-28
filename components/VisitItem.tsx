'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Visit } from '@/types'
import { Trash2 } from 'lucide-react'

export default function VisitItem({
  visit,
  spotId,
  canEdit = false,
  showRating = false,
}: {
  visit: Visit
  spotId: string
  canEdit?: boolean
  showRating?: boolean
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('この訪問記録を削除しますか？')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('visits').delete().eq('id', visit.id)
    if (error) {
      alert(error.message)
      setDeleting(false)
      return
    }
    router.refresh()
  }

  const photos = (visit.photo_urls ?? [])
    .map((p) =>
      typeof p === 'string'
        ? { url: p, caption: '', ingredients: [] as string[] }
        : { url: p.url, caption: p.caption ?? '', ingredients: p.ingredients ?? [] }
    )
    .filter((p) => p.url)

  return (
    <li className="bg-white px-6 py-6 flex justify-between items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-4 flex-wrap">
          <p className="text-[10px] tracking-luxe text-neutral-400">
            {new Date(visit.visited_at).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </p>
          {showRating && visit.rating != null && (
            <p className="font-serif text-xl">★ {visit.rating}.0</p>
          )}
          {visit.price != null && (
            <p className="font-serif text-base text-neutral-600">
              ¥{visit.price.toLocaleString()}
            </p>
          )}
        </div>
        {visit.comment && (
          <p className="text-sm text-neutral-700 mt-3 whitespace-pre-wrap leading-relaxed">
            {visit.comment}
          </p>
        )}
        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 md:grid-cols-4 gap-2">
            {photos.map((p, idx) => (
              <figure key={idx}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square bg-neutral-100 overflow-hidden group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.caption || ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </a>
                {p.caption && (
                  <figcaption className="text-[11px] text-neutral-500 mt-1">{p.caption}</figcaption>
                )}
                {p.ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="text-[9px] tracking-luxe text-neutral-500 bg-neutral-100 px-1 py-0.5"
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
      </div>
      {canEdit && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-neutral-300 hover:text-red-600"
          aria-label="削除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <input type="hidden" value={spotId} />
    </li>
  )
}
