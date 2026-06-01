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
    <div className="mb-10">
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">{greeting}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {githubAccount.connected
          ? 'Your GitHub is connected and ready.'
          : 'Connect your GitHub to start verifying.'}
      </p>
      <div className="flex items-center gap-3">
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
