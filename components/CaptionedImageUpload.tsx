'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'

export type CaptionedPhoto = { url: string; caption: string; ingredients: string[] }
export type IngredientOption = { genre: string; name: string }

export default function CaptionedImageUpload({
  value,
  onChange,
  folder = 'visits',
  max = 40,
  ingredientOptions = [],
}: {
  value: CaptionedPhoto[]
  onChange: (photos: CaptionedPhoto[]) => void
  folder?: string
  max?: number
  ingredientOptions?: IngredientOption[]
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList) {
    setError(null)
    const remaining = max - value.length
    if (remaining <= 0) {
      setError(`最大${max}枚までです`)
      return
    }
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    const supabase = createClient()

    async function uploadOne(file: File): Promise<{ url: string | null; error: string | null }> {
      try {
        const ext = file.name.split('.').pop() || 'jpg'
        const filename = `${folder}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 10)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filename, file, { upsert: false, cacheControl: '3600' })
        if (uploadError) {
          return { url: null, error: uploadError.message }
        }
        const { data } = supabase.storage.from('photos').getPublicUrl(filename)
        return { url: data.publicUrl, error: null }
      } catch (e) {
        return {
          url: null,
          error: e instanceof Error ? e.message : 'アップロード失敗',
        }
      }
    }

    const concurrency = 5
    const allResults: { url: string | null; error: string | null }[] = []
    let accumulated = [...value]
    for (let i = 0; i < toUpload.length; i += concurrency) {
      const chunk = toUpload.slice(i, i + concurrency)
      const chunkResults = await Promise.all(chunk.map(uploadOne))
      allResults.push(...chunkResults)
      const newPhotos = chunkResults
        .filter((r): r is { url: string; error: null } => !!r.url)
        .map((r) => ({ url: r.url, caption: '', ingredients: [] as string[] }))
      if (newPhotos.length > 0) {
        accumulated = [...accumulated, ...newPhotos]
        onChange(accumulated)
      }
    }

    const failed = allResults.filter((r) => !r.url)
    if (failed.length > 0) {
      setError(`${failed.length}枚のアップロードに失敗: ${failed[0].error ?? ''}`)
    }
    setUploading(false)
  }

  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  function setCaption(idx: number, caption: string) {
    onChange(value.map((p, i) => (i === idx ? { ...p, caption } : p)))
  }

  function toggleIngredient(idx: number, name: string) {
    onChange(
      value.map((p, i) => {
        if (i !== idx) return p
        const has = p.ingredients.includes(name)
        return {
          ...p,
          ingredients: has
            ? p.ingredients.filter((n) => n !== name)
            : [...p.ingredients, name],
        }
      })
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {value.map((photo, idx) => (
          <div key={idx} className="border hairline p-2">
            <div className="relative aspect-square bg-neutral-100 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 right-1 bg-white border hairline p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-100"
                aria-label="削除"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <input
              value={photo.caption}
              onChange={(e) => setCaption(idx, e.target.value)}
              placeholder="写真の名前・説明"
              className="w-full border hairline px-2 py-1.5 text-xs mt-2 focus:outline-none focus:border-black"
            />
            {ingredientOptions.length > 0 && (
              <div className="mt-2">
                <p className="text-[9px] tracking-luxe text-neutral-400 mb-1">食材（任意）</p>
                <div className="flex flex-wrap gap-1">
                  {ingredientOptions.map((opt) => {
                    const active = photo.ingredients.includes(opt.name)
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
          </div>
        ))}
        {value.length < max && (
          <label
            className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed hairline cursor-pointer hover:bg-neutral-50 ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <Upload className="w-4 h-4 text-neutral-400" />
            <span className="text-[10px] text-neutral-500 mt-1">
              {uploading ? '送信中…' : '追加'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
        )}
      </div>
      <p className="text-[10px] text-neutral-400 mt-2">
        {value.length} / {max} 枚 ・ 各写真に名前をつけられます
      </p>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
