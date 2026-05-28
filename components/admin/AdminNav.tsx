'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import AdminSignOut from './AdminSignOut'

const ADMIN_NAV = [
  { href: '/admin', label: 'OVERVIEW', section: 'GENERAL' },
  { href: '/visits/new', label: '+ ブログ / 訪問記録', section: 'GENERAL' },
  { href: '/admin/spots', label: 'お店', section: 'CONTENTS' },
  { href: '/admin/hotels', label: 'ホテル', section: 'CONTENTS' },
  { href: '/admin/chefs', label: '大将・シェフ', section: 'CONTENTS' },
  { href: '/admin/sake', label: '日本酒', section: 'CONTENTS' },
  { href: '/admin/trips', label: '旅行プラン', section: 'CONTENTS' },
  { href: '/admin/events', label: 'グルメ会', section: 'CONTENTS' },
  { href: '/admin/masters/genres', label: 'ジャンル', section: 'MASTERS' },
  { href: '/admin/masters/cities', label: '街', section: 'MASTERS' },
  { href: '/admin/masters/hotel-brands', label: 'ホテルブランド', section: 'MASTERS' },
  { href: '/admin/masters/sake-brands', label: '日本酒・銘柄', section: 'MASTERS' },
  { href: '/admin/masters/sake-models', label: '日本酒・モデル', section: 'MASTERS' },
  { href: '/admin/masters/sake-types', label: '日本酒・タイプ', section: 'MASTERS' },
  { href: '/admin/masters/reservation-methods', label: '予約方法', section: 'MASTERS' },
  { href: '/admin/masters/price-ranges', label: '価格帯', section: 'MASTERS' },
  { href: '/admin/masters/ingredients', label: '食材', section: 'MASTERS' },
  { href: '/admin/masters/signup-favorite-genres', label: '会員登録・好きなジャンル', section: 'SIGNUP' },
  { href: '/admin/masters/signup-favorite-sake-types', label: '会員登録・好きな酒の種類', section: 'SIGNUP' },
  { href: '/admin/masters/drinking-frequencies', label: '会員登録・飲む頻度', section: 'SIGNUP' },
  { href: '/admin/users', label: '会員', section: 'PEOPLE' },
]

const SECTIONS = ['GENERAL', 'CONTENTS', 'MASTERS', 'SIGNUP', 'PEOPLE'] as const

export default function AdminNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links = (
    <nav className="py-4 flex-1 overflow-y-auto">
      {SECTIONS.map((sec) => {
        const items = ADMIN_NAV.filter((n) => n.section === sec)
        return (
          <div key={sec} className="mb-4">
            <p className="px-6 text-[9px] tracking-luxe text-neutral-300 mb-2">{sec}</p>
            {items.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-6 py-1.5 text-sm transition-colors ${
                    active
                      ? 'text-black bg-neutral-100 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        )
      })}
    </nav>
  )

  const footer = (
    <div className="px-6 py-4 border-t hairline flex items-center justify-between">
      <Link href="/" className="text-[10px] tracking-luxe text-neutral-400 hover:text-black">
        ← SITE
      </Link>
      <AdminSignOut />
    </div>
  )

  return (
    <>
      {/* ===== Desktop sidebar (lg+) ===== */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 w-60 h-screen bg-white border-r hairline z-40">
        <div className="px-6 py-6 border-b hairline">
          <p className="text-[10px] tracking-luxe text-neutral-400">COLLECTION ADMIN</p>
          <h1 className="font-serif text-2xl italic font-light mt-1">Backstage.</h1>
        </div>
        {links}
        {footer}
      </aside>

      {/* ===== Mobile top bar ===== */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b hairline px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => setOpen(true)}
          className="p-1 -ml-1"
          aria-label="メニューを開く"
        >
          <Menu className="w-5 h-5" />
        </button>
        <p className="font-serif text-lg italic font-light">Backstage.</p>
        <div className="w-7" />
      </div>

      {/* ===== Mobile drawer ===== */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <div className="px-6 py-5 border-b hairline flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-luxe text-neutral-400">COLLECTION ADMIN</p>
              <h1 className="font-serif text-2xl italic font-light mt-1">Backstage.</h1>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1"
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {links}
          {footer}
        </div>
      )}
    </>
  )
}
