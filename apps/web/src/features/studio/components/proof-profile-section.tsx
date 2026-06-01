'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

const SECTION_LABEL = 'PROOF PROFILE'

type Props = {
  username: string | null
  skillsCount: number
  reportsCount: number
}

export function ProofProfileSection({ username, skillsCount, reportsCount }: Props) {
  const isReady = username !== null && skillsCount > 0
  const status = isReady ? 'Ready to share' : 'Incomplete'

  return (
    <div className="mb-10">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-4">
        {SECTION_LABEL}
      </p>
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between gap-6">
          <div className="space-y-2 min-w-0">
            <div className="flex justify-between gap-8">
              <span className="text-[13px] text-muted-foreground">Username</span>
              <span className="text-[13px] text-foreground">
                {username ? `@${username}` : <span className="text-muted-foreground">Not set</span>}
              </span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-[13px] text-muted-foreground">Skills</span>
              <span className="text-[13px] text-foreground">{skillsCount}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-[13px] text-muted-foreground">Reports</span>
              <span className="text-[13px] text-foreground">{reportsCount}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-[13px] text-muted-foreground">Status</span>
              <span className="text-[13px] inline-flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${isReady ? 'bg-green-500' : 'bg-amber-500'}`}
                />
                {status}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            {isReady && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://praxis.dev/p/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View proof page
                </a>
              </Button>
            )}
            {!isReady && !username && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">Set username</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
