'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { IconCopy, IconCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { CARD_LABEL_CLASS } from '@/features/studio/constants'

type Props = {
  username: string | null
  skillsCount: number
  reportsCount: number
  proofReady: boolean
}

export function ProofProfileSection({ username, skillsCount, reportsCount, proofReady }: Props) {
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleCopy() {
    if (!username) return
    void navigator.clipboard.writeText(`${window.location.origin}/p/${username}`)
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-lg border bg-card p-5 flex flex-col h-full">
      <p className={CARD_LABEL_CLASS}>Proof profile</p>
      {username ? (
        <>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Username</span>
              <span className="text-xs font-medium">@{username}</span>
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
              <span className="text-xs font-medium flex items-center gap-1.5">
                <span
                  className={`size-1.5 rounded-full inline-block ${proofReady ? 'bg-green-500' : 'bg-amber-400'}`}
                />
                {proofReady ? 'Ready to share' : 'Incomplete'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/p/${username}`}>View proof page</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopy} aria-label="Copy link">
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-xs text-muted-foreground">
            Set a username to activate your public proof profile.
          </p>
          <Button variant="outline" size="sm" className="mt-4 self-start" asChild>
            <Link href="/onboarding/username">Set username</Link>
          </Button>
        </>
      )}
    </div>
  )
}
