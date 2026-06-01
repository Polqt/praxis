'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { GitHubAccount } from '@praxis/shared'

type Props = {
  greeting: string
  githubAccount: GitHubAccount
}

export function HeroSection({ greeting, githubAccount }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {githubAccount.connected
          ? 'Your GitHub is connected and ready for verification.'
          : 'Connect your GitHub to start verifying.'}
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Button asChild>
          <Link href="/challenges">Browse challenges</Link>
        </Button>
        {githubAccount.connected && (
          <Button variant="outline" asChild>
            <Link href="/challenges">Submit repository</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
