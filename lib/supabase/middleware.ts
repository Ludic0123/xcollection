import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ログイン必須（会員なら誰でもアクセス可）
const LOGIN_REQUIRED_PATTERNS = [
  /^\/invitation/,
  /^\/profile/,
]

// admin 限定（書き込み系コンテンツと管理画面）
const ADMIN_ONLY_PATTERNS = [
  /^\/admin/,
  /^\/spots\/new$/,
  /^\/spots\/[^/]+\/edit$/,
  /^\/spots\/[^/]+\/visit$/,
  /^\/trips\/new$/,
  /^\/trips\/[^/]+\/edit$/,
  /^\/trips\/[^/]+\/items\/new$/,
  /^\/sake\/new$/,
  /^\/sake\/[^/]+\/edit$/,
  /^\/hotels\/new$/,
  /^\/hotels\/[^/]+\/edit$/,
  /^\/hotels\/[^/]+\/stay$/,
  /^\/chefs\/new$/,
  /^\/chefs\/[^/]+\/edit$/,
  /^\/visits\/new$/,
]

function needsLogin(path: string) {
  return (
    LOGIN_REQUIRED_PATTERNS.some((re) => re.test(path)) ||
    ADMIN_ONLY_PATTERNS.some((re) => re.test(path))
  )
}
function needsAdmin(path: string) {
  return ADMIN_ONLY_PATTERNS.some((re) => re.test(path))
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // ログイン済みでログインページに来たら / へ
  if (user && (path === '/login' || path === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 未ログイン × ログイン必須パス → /login
  if (!user && needsLogin(path)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // ログイン済み × admin限定パス → admin チェック
  if (user && needsAdmin(path)) {
    const { data: me } = await supabase
      .from('members')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!me?.is_admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('forbidden', '1')
      return NextResponse.redirect(url)
    }
  }

  return response
}
