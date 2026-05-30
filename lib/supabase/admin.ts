import { createClient } from '@supabase/supabase-js'

// 管理画面の Server Component 専用。RLS を完全にバイパスするため、
// 必ず先に middleware/ページ側で管理者チェック済みの場所だけで使うこと。
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY が設定されていません。Vercel のプロジェクト Settings → Environment Variables に追加してください。'
    )
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
