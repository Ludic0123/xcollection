import type { PoolPhoto } from '@/components/PhotoPool'
import type { ComposerBlock } from '@/components/BlogComposer'
import type { BlogBlock, Visit, VisitPhoto } from '@/types'

// VisitPhoto[] を写真プール（PoolPhoto[]）に正規化
export function photosToPool(photos: VisitPhoto[] | null | undefined): PoolPhoto[] {
  if (!photos) return []
  return photos
    .map((p) =>
      typeof p === 'string'
        ? { url: p, caption: '', ingredients: [] as string[] }
        : { url: p.url, caption: p.caption ?? '', ingredients: p.ingredients ?? [] }
    )
    .filter((p) => p.url)
}

// 既存の訪問記録 → 写真プール
export function visitToPool(visit: Visit | null | undefined): PoolPhoto[] {
  return photosToPool(visit?.photo_urls)
}

// 既存の訪問記録 → 本文ブロック（ComposerBlock[]）
export function visitToComposerBlocks(visit: Visit | null | undefined): ComposerBlock[] {
  if (!visit) return []
  if (visit.body_blocks && visit.body_blocks.length > 0) {
    return visit.body_blocks.map((b) =>
      b.type === 'image' ? { type: 'image', url: b.url } : { type: 'text', text: b.text }
    )
  }
  // 旧データ: comment + photo_urls から組み立て
  const blocks: ComposerBlock[] = []
  if (visit.comment) blocks.push({ type: 'text', text: visit.comment })
  for (const p of visit.photo_urls ?? []) {
    const url = typeof p === 'string' ? p : p?.url
    if (url) blocks.push({ type: 'image', url })
  }
  return blocks
}

// 保存用: ブロック + プール → body_blocks（画像はプールから caption/食材をスナップショット）
export function buildBlogBlocks(blocks: ComposerBlock[], pool: PoolPhoto[]): BlogBlock[] {
  const map = new Map(pool.map((p) => [p.url, p]))
  return blocks
    .map((b): BlogBlock | null => {
      if (b.type === 'text') return b.text.trim() ? { type: 'text', text: b.text } : null
      if (!b.url) return null
      const p = map.get(b.url)
      return {
        type: 'image',
        url: b.url,
        caption: p?.caption ?? '',
        ingredients: p?.ingredients ?? [],
      }
    })
    .filter((b): b is BlogBlock => b !== null)
}

// 保存用: 文章ブロックを結合（comment フォールバック用）
export function blogTextConcat(blocks: ComposerBlock[]): string {
  return blocks
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map((b) => b.text.trim())
    .filter(Boolean)
    .join('\n\n')
}
