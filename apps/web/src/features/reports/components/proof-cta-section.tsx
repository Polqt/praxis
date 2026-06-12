'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

type Props = {
  challengeTitle?: string | null
}

export function ProofCtaSection({ challengeTitle }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    apiFetch<{ id: string }>('/users/me')
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
  }, [])

  // null = still loading; true = logged in (hide CTA)
  if (isAuthenticated !== false) return null

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 py-24 border-t border-border bg-foreground">
      <div className="max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-2 h-2.5 rounded-[1px] shrink-0 bg-white/40" />
          <span className="text-[13px] uppercase tracking-widest text-white/40">Your turn</span>
        </div>
        {challengeTitle ? (
          <>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-4 max-w-3xl text-background">
              Think you can score higher?
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl">
              Submit your own repo to <span className="text-white/90 font-medium">{challengeTitle}</span> and let the system decide.
            </p>
          </>
        ) : (
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-10 max-w-3xl text-background">
            Verify your own project.
            <br />
            Earn your place.
          </h2>
        )}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none bg-background text-foreground hover:opacity-90 transition-opacity"
          >
            {challengeTitle ? 'Submit your repo' : 'Get started'}
          </Link>
          <Link
            href="/challenges"
            className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none border border-white/30 text-background hover:bg-white/10 transition-colors"
          >
            Browse challenges
          </Link>
        </div>
        <p className="text-sm text-white/50">
          Free to start. No credit card required.
        </p>
      </div>
    </section>
  )
}
