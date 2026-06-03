import type { Metadata } from 'next'
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/lib/query-client'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-heading',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-geist-mono',
})

const BASE_URL = 'https://praxisdev.vercel.app'

export const metadata: Metadata = {
  title: 'Praxis — Skill Verification Platform',
  description: 'Submit a real GitHub repository. Get a deterministic verification report. Share proof that speaks for itself.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: 'Praxis — Skill Verification Platform',
    description: 'Submit a real GitHub repository. Get a deterministic verification report. Share proof that speaks for itself.',
    url: BASE_URL,
    siteName: 'Praxis',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Praxis — Skill Verification Platform',
    description: 'Submit a real GitHub repository. Get a deterministic verification report.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground">
        <QueryProvider>
          {children}
          <Toaster position="bottom-right" />
        </QueryProvider>
      </body>
    </html>
  )
}
