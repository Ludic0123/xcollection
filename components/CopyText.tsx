'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyText({
  value,
  className = '',
}: {
  value: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handle() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handle}
      className={`inline-flex items-center gap-1.5 text-[10px] tracking-luxe opacity-70 hover:opacity-100 ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          COPIED
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          COPY
        </>
      )}
    </button>
  )
}
