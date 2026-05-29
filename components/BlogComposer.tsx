'use client'

import { X, ArrowUp, ArrowDown, Type, Image as ImageIcon } from 'lucide-react'
import type { PoolPhoto } from './PhotoPool'

export type TextBlock = { type: 'text'; text: string }
export type ImageBlock = { type: 'image'; url: string }
export type ComposerBlock = TextBlock | ImageBlock

export default function BlogComposer({
  blocks,
  onChange,
  pool,
}: {
  blocks: ComposerBlock[]
  onChange: (blocks: ComposerBlock[]) => void
  pool: PoolPhoto[]
}) {
  function update(idx: number, block: ComposerBlock) {
    onChange(blocks.map((b, i) => (i === idx ? block : b)))
  }
  function remove(idx: number) {
    onChange(blocks.filter((_, i) => i !== idx))
  }
  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]
    ;[next[idx], next[j]] = [next[j], next[idx]]
    onChange(next)
  }
  function addText() {
    onChange([...blocks, { type: 'text', text: '' }])
  }
  function addImage() {
    onChange([...blocks, { type: 'image', url: '' }])
  }

  return (
    <div className="space-y-3">
      {blocks.length === 0 && (
        <p className="text-xs text-neutral-400 border border-dashed hairline p-4 text-center">
          下のボタンから「文章」や「写真」を追加してブログを組み立てます。
        </p>
      )}

      {blocks.map((block, idx) => {
        const poolPhoto =
          block.type === 'image' ? pool.find((p) => p.url === block.url) : undefined
        return (
          <div key={idx} className="border hairline p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] tracking-luxe text-neutral-400">
                {block.type === 'text' ? '文章' : '写真'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 text-neutral-400 hover:text-black disabled:opacity-30"
                  aria-label="上へ"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === blocks.length - 1}
                  className="p-1 text-neutral-400 hover:text-black disabled:opacity-30"
                  aria-label="下へ"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1 text-neutral-300 hover:text-red-600"
                  aria-label="削除"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {block.type === 'text' ? (
              <textarea
                value={block.text}
                onChange={(e) => update(idx, { ...block, text: e.target.value })}
                rows={4}
                placeholder="本文を入力…"
                className="w-full border hairline px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            ) : (
              <div>
                {pool.length === 0 ? (
                  <p className="text-xs text-neutral-400">
                    上のPHOTOSに写真を追加すると、ここから選べます。
                  </p>
                ) : (
                  <>
                    <p className="text-[10px] tracking-luxe text-neutral-400 mb-2">
                      アップ済みの写真から選択
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pool.map((p) => {
                        const active = block.url === p.url
                        return (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => update(idx, { type: 'image', url: active ? '' : p.url })}
                            className={`relative w-16 h-16 overflow-hidden border-2 ${
                              active ? 'border-black' : 'border-transparent hover:border-neutral-300'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.url} alt="" className="w-full h-full object-cover" />
                            {active && (
                              <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-[9px] tracking-luxe">
                                選択中
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {poolPhoto?.caption && (
                      <p className="text-xs text-neutral-500 mt-2 font-serif">{poolPhoto.caption}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={addText}
          className="inline-flex items-center gap-1 text-[11px] tracking-luxe border border-black px-3 py-2 hover:bg-neutral-100"
        >
          <Type className="w-3.5 h-3.5" /> + 文章
        </button>
        <button
          type="button"
          onClick={addImage}
          className="inline-flex items-center gap-1 text-[11px] tracking-luxe border border-black px-3 py-2 hover:bg-neutral-100"
        >
          <ImageIcon className="w-3.5 h-3.5" /> + 写真
        </button>
      </div>
    </div>
  )
}
