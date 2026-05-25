'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'

export default function ImageUpload({
  value,
  onChange,
  folder = 'covers',
}: {
  value: string | null
  onChange: (url: string | null) => void
  folder?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filename, file, { upsert: false, cacheControl: '3600' })
      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        return
      }
      const { data } = supabase.storage.from('photos').getPublicUrl(filename)
      onChange(data.publicUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'アップロード失敗')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="w-full max-w-md aspect-[4/3] object-cover border hairline"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-white border hairline p-1 hover:bg-neutral-100"
            aria-label="画像を削除"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center w-full max-w-md aspect-[4/3] border-2 border-dashed hairline cursor-pointer hover:bg-neutral-50 ${
            uploading ? 'opacity-50' : ''
          }`}
        >
          <Upload className="w-5 h-5 text-neutral-400" />
          <span className="text-xs text-neutral-500 mt-2">
            {uploading ? 'アップロード中…' : '画像を選ぶ'}
          </span>
          <span className="text-[10px] text-neutral-400 mt-1">JPG / PNG / WEBP</span>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
