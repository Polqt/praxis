'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Props = {
  reset: () => void
}

export default function PublicError({ reset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Something went wrong</p>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">An unexpected error occurred</h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        This page ran into a problem. Try refreshing or return to the home page.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="outline">Try again</Button>
        <Button asChild><Link href="/">Home</Link></Button>
      </div>
    </div>
  )
}
