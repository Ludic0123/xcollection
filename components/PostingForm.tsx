'use client'

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'

type UploadState = { pending: boolean; error: string | null }
const UploadContext = createContext<((id: string, state: UploadState | null) => void) | null>(null)

export function postingError(error: unknown): string {
  return error instanceof Error ? error.message : '保存に失敗しました。通信状態を確認して、もう一度お試しください。'
}

// Keep upload failures visible to the enclosing form, including before React rerenders.
export function useUploadState() {
  const report = useContext(UploadContext)
  const id = useId()
  const state = useRef<UploadState>({ pending: false, error: null })
  const [view, setView] = useState(state.current)
  const setUploading = (pending: boolean) => {
    state.current = { ...state.current, pending }
    setView(state.current)
    report?.(id, state.current)
  }
  const setError = (error: string | null) => {
    state.current = { ...state.current, error }
    setView(state.current)
    report?.(id, state.current)
  }
  useEffect(() => () => report?.(id, null), [id, report])
  return { uploading: view.pending, error: view.error, setUploading, setError }
}

export default function PostingForm({ onSubmit, onError, onSettled, children, ...props }: Omit<React.ComponentProps<'form'>, 'onSubmit' | 'onError'> & {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  onError: (message: string) => void
  onSettled: () => void
}) {
  const uploads = useRef(new Map<string, UploadState>())
  const locked = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const report = useCallback((id: string, state: UploadState | null) => {
    if (state) uploads.current.set(id, state)
    else uploads.current.delete(id)
    setUploading([...uploads.current.values()].some(s => s.pending))
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked.current) return
    if ([...uploads.current.values()].some(s => s.pending || s.error)) {
      onError('写真のアップロードが完了していません。失敗した写真を選び直してから保存してください。')
      return
    }
    locked.current = true
    setSubmitting(true)
    try {
      await onSubmit(event)
    } catch (error) {
      onError(postingError(error))
    } finally {
      locked.current = false
      setSubmitting(false)
      onSettled()
    }
  }

  return <UploadContext.Provider value={report}>
    <form {...props} onSubmit={submit} aria-busy={submitting || uploading}>
      <fieldset disabled={submitting || uploading} className={`contents ${props.className?.split(' ').filter(c => c.includes('space-y-')).join(' ') ?? ''}`}>{children}</fieldset>
    </form>
  </UploadContext.Provider>
}
