import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import AdminSignOut from '@/components/admin/AdminSignOut'

const ADMIN_NAV = [
  { href: '/admin', label: 'OVERVIEW', section: 'GENERAL' },
  { href: '/admin/spots', label: 'お店・ホテル', section: 'CONTENTS' },
  { href: '/admin/sake', label: '日本酒', section: 'CONTENTS' },
  { href: '/admin/trips', label: '旅行プラン', section: 'CONTENTS' },
  { href: '/admin/events', label: 'グルメ会', section: 'CONTENTS' },
  { href: '/admin/masters/genres', label: 'ジャンル', section: 'MASTERS' },
  { href: '/admin/masters/cities', label: '街', section: 'MASTERS' },
  { href: '/admin/masters/sake-types', label: '日本酒タイプ', section: 'MASTERS' },
  { href: '/admin/masters/reservation-methods', label: '予約方法', section: 'MASTERS' },
  { href: '/admin/masters/price-ranges', label: '価格帯', section: 'MASTERS' },
  { href: '/admin/users', label: '会員', section: 'PEOPLE' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const res = await requireAdmin()
  if (!res.ok) {
    if (res.reason === 'not_logged_in') redirect('/login?redirect=/admin')
    redirect('/')
  }

  const sections = ['GENERAL', 'CONTENTS', 'MASTERS', 'PEOPLE'] as const

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="w-60 shrink-0 bg-white border-r hairline sticky top-0 h-screen overflow-y-auto">
        <div className="px-6 py-6 border-b hairline">
          <p className="text-[10px] tracking-luxe text-neutral-400">COLLECTION ADMIN</p>
          <h1 className="font-serif text-2xl italic font-light mt-1">Backstage.</h1>
        </div>
        <nav className="py-4">
          {sections.map((sec) => {
            const items = ADMIN_NAV.filter((n) => n.section === sec)
            return (
              <div key={sec} className="mb-4">
                <p className="px-6 text-[9px] tracking-luxe text-neutral-300 mb-2">{sec}</p>
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-6 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )
          })}
        </nav>
        <div className="px-6 py-4 border-t hairline flex items-center justify-between">
          <Link href="/" className="text-[10px] tracking-luxe text-neutral-400 hover:text-black">
            ← SITE
          </Link>
          <AdminSignOut />
        </div>
      </aside>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
