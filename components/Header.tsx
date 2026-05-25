'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PUBLIC_NAV = [
  { href: '/', label: 'HOME' },
  { href: '/spots', label: 'TASTES' },
  { href: '/hotels', label: 'STAYS' },
  { href: '/sake', label: 'SAKE' },
  { href: '/chefs', label: 'CHEFS' },
  { href: '/trips', label: 'JOURNEYS' },
  { href: '/map', label: 'MAP' },
]

const MEMBER_NAV = [...PUBLIC_NAV, { href: '/invitation', label: 'INVITATION' }]

export default function Header({
  memberCode,
  isAdmin,
}: {
  memberCode: string | null
  memberNumber: number | null
  isAdmin: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isMember = !!memberCode
  const nav = isAdmin
    ? [...MEMBER_NAV, { href: '/admin', label: 'ADMIN' }]
    : isMember
    ? MEMBER_NAV
    : PUBLIC_NAV

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b hairline">
      <div className="relative px-8 md:px-14 h-24 flex items-center justify-between gap-6">
        {/* Brand */}
        <Link
          href="/"
          className="font-serif text-3xl md:text-4xl leading-none tracking-tight italic font-light shrink-0"
        >
          Collection
        </Link>

        {/* Center nav (desktop) */}
        <nav className="hidden lg:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
          {nav.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href.split('?')[0])
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs tracking-luxe transition-colors ${
                  active ? 'text-black' : 'text-neutral-400 hover:text-black'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right action */}
        <div className="flex items-center gap-5 shrink-0">
          {isMember ? (
            <>
              <Link
                href="/profile"
                className="hidden md:inline-block text-[11px] tracking-luxe text-neutral-500 hover:text-black"
              >
                PROFILE
              </Link>
              <button
                onClick={handleLogout}
                className="text-[11px] tracking-luxe text-neutral-500 hover:text-black"
              >
                SIGN OUT
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="text-[11px] tracking-luxe text-neutral-500 hover:text-black"
              >
                JOIN
              </Link>
              <Link
                href="/login"
                className="text-[11px] tracking-luxe text-neutral-300 hover:text-black"
              >
                SIGN IN
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile / Tablet nav */}
      <nav className="lg:hidden border-t hairline px-6 py-3 flex items-center gap-5 overflow-x-auto">
        {nav.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href.split('?')[0])
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[10px] tracking-luxe whitespace-nowrap ${
                active ? 'text-black' : 'text-neutral-400'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
        {isMember && (
          <Link
            href="/profile"
            className="ml-auto text-[10px] tracking-luxe text-black whitespace-nowrap"
          >
            PROFILE
          </Link>
        )}
      </nav>
    </header>
  )
}
