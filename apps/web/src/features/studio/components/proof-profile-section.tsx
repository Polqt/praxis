'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SECTION_LABEL } from '@/features/studio/constants/studio.constants'

type Props = {
  username: string | null
  skillsCount: number
  reportsCount: number
}

export function ProofProfileSection({ username, skillsCount, reportsCount }: Props) {
  const isReady = username !== null && skillsCount > 0

  return (
    <div className="rounded-lg border bg-card self-start sticky top-10">
      <div className="px-4 py-3 border-b">
        <p className={SECTION_LABEL}>Proof profile</p>
        {username && (
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            praxis.dev/p/{username}
          </p>
        )}
      </div>

      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Username</span>
          <span className="text-xs font-medium">
            {username ? `@${username}` : <span className="text-muted-foreground">Not set</span>}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Skills</span>
          <span className="text-xs font-medium">{skillsCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Reports</span>
          <span className="text-xs font-medium">{reportsCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={`size-1.5 rounded-full inline-block ${isReady ? 'bg-green-500' : 'bg-amber-400'}`}
            />
            {isReady ? 'Ready to share' : 'Incomplete'}
          </span>
        </div>
      </div>

      {(isReady || !username) && (
        <div className="px-4 py-3 border-t">
          {isReady ? (
            <Button variant="outline" size="sm" className="w-full text-xs" asChild>
              <a href={`https://praxis.dev/p/${username}`} target="_blank" rel="noopener noreferrer">
                View proof page
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full text-xs" asChild>
              <Link href="/settings">Set username</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
