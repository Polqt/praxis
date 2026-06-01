'use client'

import Link from 'next/link'

export function ProfileFooter() {
  return (
    <p className="text-center text-[11px] text-muted-foreground">
      Verified by{' '}
      <Link href="/" className="hover:text-foreground transition-colors">
        Praxis
      </Link>
      {' · '}
      <Link href="/" className="hover:text-foreground transition-colors">
        praxis.dev
      </Link>
    </p>
  )
}
