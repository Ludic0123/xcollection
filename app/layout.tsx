import type { Metadata } from 'next'
import { Cormorant_Garamond, Noto_Serif_JP, Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import AppChrome from '@/components/AppChrome'
import { getCurrentMember } from '@/lib/auth'

const serifEn = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-serif-en',
  display: 'swap',
})

const serifJp = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-serif-jp',
  display: 'swap',
})

const sansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-sans-jp',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Collection — Curated Tastes',
  description: '私が選んだ、食と宿、そして旅。',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const member = await getCurrentMember()

  return (
    <html lang="ja" className={`${serifEn.variable} ${serifJp.variable} ${sansJp.variable}`}>
      <body className="bg-white text-black min-h-screen">
        <AppChrome
          memberCode={member?.memberCode ?? null}
          memberNumber={member?.memberNumber ?? null}
          isAdmin={member?.isAdmin ?? false}
        >
          {children}
        </AppChrome>
      </body>
    </html>
  )
}
