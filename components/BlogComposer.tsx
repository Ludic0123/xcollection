'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ArrowUp, ArrowDown, Type, Image as ImageIcon } from 'lucide-react'

export type TextBlock = { type: 'text'; text: string }
export type ImageBlock = {
  type: 'image'
  url: string
  caption: string
  ingredients: string[]
}
export type ComposerBlock = TextBlock | ImageBlock
export type IngredientOption = { genre: string; name: string }

export default function BlogComposer({
  blocks,
  onChange,
  ingredientOptions = [],
  folder = 'visits',
}: {
  blocks: ComposerBlock[]
  onChange: (blocks: ComposerBlock[]) => void
  ingredientOptions?: IngredientOption[]
  folder?: string
}) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    onChange([...blocks, { type: 'image', url: '', caption: '', ingredients: [] }])
  }

  async function uploadFor(idx: number, file: File) {
    setError(null)
    setUploadingIdx(idx)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('photos')
        .upload(filename, file, { upsert: false, cacheControl: '3600' })
      if (upErr) {
        setError(upErr.message)
        setUploadingIdx(null)
        return
      }
      const { data } = supabase.storage.from('photos').getPublicUrl(filename)
      const cur = blocks[idx]
      if (cur && cur.type === 'image') {
        update(idx, { ...cur, url: data.publicUrl })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'アップロード失敗')
    }
    setUploadingIdx(null)
  }

  function toggleIngredient(idx: number, name: string) {
    const cur = blocks[idx]
    if (cur?.type !== 'image') return
    const has = cur.ingredients.includes(name)
    update(idx, {
      ...cur,
      ingredients: has
        ? cur.ingredients.filter((n) => n !== name)
        : [...cur.ingredients, name],
    })
  }

  return (
    <div className="space-y-3">
      {blocks.length === 0 && (
        <p className="text-xs text-neutral-400 border border-dashed hairline p-4 text-center">
          下のボタンから「文章」や「写真」を追加してブログを組み立てます。
        </p>
      )}

      {blocks.map((block, idx) => (
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
              {block.url ? (
                <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={block.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => update(idx, { ...block, url: '' })}
                    className="absolute top-1 right-1 bg-white border hairline p-1 hover:bg-neutral-100"
                    aria-label="写真を変更"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center aspect-[4/3] max-w-sm border-2 border-dashed hairline cursor-pointer hover:bg-neutral-50 ${
                    uploadingIdx === idx ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <Upload className="w-5 h-5 text-neutral-400" />
                  <span className="text-[11px] text-neutral-500 mt-1">
                    {uploadingIdx === idx ? '送信中…' : '写真を選択'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) uploadFor(idx, e.target.files[0])
                      e.target.value = ''
                    }}
                  />
                </label>
              )}

              {block.url && (
                <>
                  <input
                    value={block.caption}
                    onChange={(e) => update(idx, { ...block, caption: e.target.value })}
                    placeholder="写真の名前・説明（任意）"
                    className="w-full border hairline px-2 py-1.5 text-xs mt-2 focus:outline-none focus:border-black max-w-sm"
                  />
                  {ingredientOptions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[9px] tracking-luxe text-neutral-400 mb-1">食材（任意）</p>
                      <div className="flex flex-wrap gap-1">
                        {ingredientOptions.map((opt) => {
                          const active = block.ingredients.includes(opt.name)
                          return (
                            <button
                              key={opt.name}
                              type="button"
                              onClick={() => toggleIngredient(idx, opt.name)}
                              className={`text-[10px] px-2 py-0.5 border hairline transition-colors ${
                                active
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-neutral-500 hover:border-black'
                              }`}
                            >
                              {opt.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {error && <p className="text-xs text-red-600">{error}</p>}

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
