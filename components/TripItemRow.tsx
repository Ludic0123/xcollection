'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS, type Category, type Spot, type TripPlanItem } from '@/types'
import { Trash2, ExternalLink } from 'lucide-react'

export default function TripItemRow({
  item,
  planId,
  canEdit = false,
}: {
  item: TripPlanItem & { spot?: Spot | null }
  planId: string
  canEdit?: boolean
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('この行き先を削除しますか？')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('trip_plan_items').delete().eq('id', item.id)
    if (error) {
      alert(error.message)
      setDeleting(false)
      return
    }
    router.refresh()
  }

  const displayName = item.spot?.name ?? item.custom_name ?? '(名前なし)'

  return (
    <li className="bg-white px-6 py-5 flex justify-between items-start gap-6">
      <div className="flex gap-5 flex-1 min-w-0">
        {item.spot?.cover_image_url && (
          <Link
            href={`/spots/${item.spot.id}`}
            className="block w-20 h-20 shrink-0 overflow-hidden bg-neutral-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.spot.cover_image_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          {item.spot ? (
            <Link
              href={`/spots/${item.spot.id}`}
              className="font-serif text-lg hover:italic block truncate"
            >
              {displayName}
            </Link>
          ) : (
            <p className="font-serif text-lg truncate">{displayName}</p>
          )}
          {item.spot && (
            <p className="text-[10px] tracking-luxe text-neutral-400 mt-1">
              {CATEGORY_LABELS[item.spot.category as Category]}
              {item.spot.genre && ` · ${item.spot.genre}`}
            </p>
          )}
          {item.notes && (
            <p className="text-sm text-neutral-600 mt-2 whitespace-pre-wrap">{item.notes}</p>
          )}
          {item.spot?.map_url && (
            <a
              href={item.spot.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] tracking-luxe text-neutral-500 hover:text-black mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              MAP
            </a>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-serif text-lg">
          {item.estimated_price != null
            ? `¥${item.estimated_price.toLocaleString()}`
            : '—'}
        </p>
        {canEdit && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="mt-3 text-neutral-300 hover:text-red-600"
            aria-label="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <input type="hidden" value={planId} />
    </li>
  )
}
