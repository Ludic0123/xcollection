'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const PUBLIC_NAV = [
  { href: '/', label: 'HOME' },
  { href: '/spots', label: 'TASTES' },
  { href: '/hotels', label: 'STAYS' },
  { href: '/sake', label: 'SAKE' },
  { href: '/trips', label: 'JOURNEYS' },
  { href: '/map', label: 'MAP' },
]

const MEMBER_NAV = [...PUBLIC_NAV, { href: '/invitation', label: 'INVITATION' }]

export default function Header({
  memberCode,
  memberNumber,
  isAdmin,
}: {
  memberCode: string | null
  memberNumber: number | null
  isAdmin: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
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

  async function copyCode() {
    if (!memberCode) return
    await navigator.clipboard.writeText(
      `Member No.${memberNumber} / Code: ${memberCode}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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
              <button
                onClick={copyCode}
                title="クリックでコピー"
                className="hidden md:flex items-center gap-2 text-[10px] tracking-luxe text-neutral-500 hover:text-black"
              >
                <span className="text-neutral-300">NO.</span>
                <span className="font-mono font-semibold text-black">
                  {String(memberNumber ?? '').padStart(3, '0')}
                </span>
                <span className="text-neutral-300">/</span>
                <span className="font-mono font-semibold tracking-widest text-black">
                  {memberCode}
                </span>
                {copied && <span className="text-green-600 ml-1">COPIED</span>}
              </button>
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
          <button
            onClick={copyCode}
            className="ml-auto text-[10px] tracking-luxe font-mono text-black whitespace-nowrap"
          >
            {copied ? 'COPIED' : `${memberNumber}/${memberCode}`}
          </button>
        )}
      </nav>
    </header>
  )
}
