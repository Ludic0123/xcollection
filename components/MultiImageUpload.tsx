'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'

export default function MultiImageUpload({
  value,
  onChange,
  folder = 'visits',
  max = 40,
}: {
  value: string[]
  onChange: (urls: string[]) => void
  folder?: string
  max?: number
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
    const uploaded: string[] = []
    for (const file of toUpload) {
      try {
        const ext = file.name.split('.').pop() || 'jpg'
        const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filename, file, { upsert: false, cacheControl: '3600' })
        if (uploadError) {
          setError(uploadError.message)
          continue
        }
        const { data } = supabase.storage.from('photos').getPublicUrl(filename)
        uploaded.push(data.publicUrl)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'アップロード失敗')
      }
    }
    onChange([...value, ...uploaded])
    setUploading(false)
  }

  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((url, idx) => (
          <div key={idx} className="relative aspect-square bg-neutral-100 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-1 right-1 bg-white border hairline p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-100"
              aria-label="削除"
            >
              <X className="w-3 h-3" />
            </button>
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
        {value.length} / {max} 枚 ・ 複数枚をまとめて選択できます
      </p>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
