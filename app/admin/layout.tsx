import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'

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

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav />
      <main className="lg:pl-60">{children}</main>
    </div>
  )
}
