import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 書き込み系・会員専用パスは認証必須
const PROTECTED_PATTERNS = [
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
  /^\/invitation/,
  /^\/profile/,
  /^\/admin/,
]

function isProtected(path: string) {
  return PROTECTED_PATTERNS.some((re) => re.test(path))
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

  // 保護パスは未ログインなら /login へ
  if (!user && isProtected(path)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  return response
}
