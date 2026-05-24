'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function AppChrome({
  memberCode,
  memberNumber,
  isAdmin,
  children,
}: {
  memberCode: string | null
  memberNumber: number | null
  isAdmin: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPath = pathname?.startsWith('/admin')

  if (isAdminPath) {
    // 管理画面では公開ヘッダー/フッターを出さず、admin/layout がすべて担う
    return <>{children}</>
  }

  return (
    <>
      <Header
        memberCode={memberCode}
        memberNumber={memberNumber}
        isAdmin={isAdmin}
      />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}

function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t hairline mt-20">
      <div className="px-6 md:px-12 py-12 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <p className="font-serif text-lg italic font-light">Collection</p>
        <p className="text-[10px] tracking-luxe text-neutral-400">
          {year} · PERSONAL EDITION · CURATED BY ONE
        </p>
      </div>
    </footer>
  )
}
