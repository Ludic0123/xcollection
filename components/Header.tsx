'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PUBLIC_NAV = [
  { href: '/', label: 'HOME' },
  { href: '/spots', label: 'TASTES' },
  { href: '/hotels', label: 'STAYS' },
  { href: '/sake', label: 'SAKE' },
  { href: '/trips', label: 'JOURNEYS' },
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
  const [open, setOpen] = useState(false)
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
    setOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b hairline">
        <div className="relative px-5 md:px-14 h-14 md:h-24 flex items-center justify-between gap-6">
          {/* Brand */}
          <Link
            href="/"
            className="font-serif text-2xl md:text-4xl leading-none tracking-tight italic font-light shrink-0"
          >
            Collection
          </Link>

          {/* Center nav (desktop) */}
          <nav className="hidden xl:flex items-center gap-4">
            {nav.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href.split('?')[0])
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ui-action px-1 text-xs tracking-luxe transition-colors ${
                    active ? 'text-black' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right action — Desktop */}
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            {isMember ? (
              <>
                <Link
                  href="/profile"
                  className="ui-action text-xs tracking-luxe text-neutral-500 hover:text-black"
                >
                  PROFILE
                </Link>
                <button
                  onClick={handleLogout}
                  className="ui-action text-xs tracking-luxe text-neutral-500 hover:text-black"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="ui-action text-xs tracking-luxe text-neutral-500 hover:text-black"
                >
                  JOIN
                </Link>
                <Link
                  href="/login"
                  className="ui-action text-xs tracking-luxe text-neutral-600 hover:text-black"
                >
                  SIGN IN
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — Mobile/Tablet */}
          <button
            className="xl:hidden ui-action -mr-2"
            aria-label="メニュー"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ===== Mobile drawer (Headerの外に置く: backdrop-blurの影響を避ける) ===== */}
      {open && (
        <div
          className="xl:hidden fixed inset-0 z-[60] bg-white flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <div className="px-5 h-14 flex items-center justify-between border-b hairline shrink-0">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="font-serif text-2xl leading-none italic font-light"
            >
              Collection
            </Link>
            <button onClick={() => setOpen(false)} aria-label="閉じる" className="ui-action -mr-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-8 py-8 space-y-2">
            {nav.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href.split('?')[0])
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center font-serif text-2xl italic font-light ${
                    active ? 'text-black' : 'text-neutral-600'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="px-8 py-6 border-t hairline space-y-3 shrink-0">
            {isMember ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="ui-action block text-xs tracking-luxe text-neutral-700"
                >
                  PROFILE
                </Link>
                <button
                  onClick={handleLogout}
                  className="ui-action block text-xs tracking-luxe text-neutral-500"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="ui-action block text-xs tracking-luxe text-neutral-700"
                >
                  JOIN
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="ui-action block text-xs tracking-luxe text-neutral-500"
                >
                  SIGN IN
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
