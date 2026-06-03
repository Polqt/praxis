'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-colors duration-200 ease-in-out border-b',
          scrolled ? 'bg-background border-border' : 'bg-transparent border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-[16px] font-semibold tracking-tight text-foreground"
            >
              Praxis
            </Link>

            <nav className="hidden md:flex items-center gap-0">
              <Link
                href="/why"
                className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-1"
              >
                WHY
              </Link>
              <span className="text-border select-none">|</span>
              <Link
                href="/challenges"
                className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-1"
              >
                CHALLENGES
              </Link>
              <span className="text-border select-none">|</span>
              <Link
                href="/how-it-works"
                className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-1"
              >
                HOW
              </Link>
              <span className="text-border select-none">|</span>
              <Link
                href="/leaderboard"
                className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-1"
              >
                LEADERBOARD
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-9 px-5 bg-foreground text-background text-[11px] font-medium uppercase tracking-widest rounded-none hover:bg-foreground/90 transition-colors"
            >
              GET STARTED
            </Link>
          </div>

          <button
            className="md:hidden text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            MENU
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-60 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-72 bg-background border-l border-border flex flex-col">
            <div className="flex items-center justify-between h-14 px-6 border-b border-border">
              <Link
                href="/"
                className="text-[16px] font-semibold tracking-tight text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Praxis
              </Link>
              <button
                className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest"
                onClick={() => setMobileOpen(false)}
              >
                CLOSE
              </button>
            </div>
            <nav className="flex flex-col">
              {[
                { href: '/why', label: 'WHY' },
                { href: '/challenges', label: 'CHALLENGES' },
                { href: '/how-it-works', label: 'HOW' },
                { href: '/leaderboard', label: 'LEADERBOARD' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-6 py-4 border-b border-border"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto p-6 flex flex-col gap-3">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center h-10 px-5 bg-foreground text-background text-[11px] font-medium uppercase tracking-widest rounded-none hover:bg-foreground/90 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                GET STARTED
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
