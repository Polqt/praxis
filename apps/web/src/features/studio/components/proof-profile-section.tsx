'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { IconCopy, IconCheck } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
    void navigator.clipboard.writeText(`https://praxis.dev/p/${username}`)
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Proof Profile</p>
        {username ? (
          <>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Username</span>
                <span>@{username}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Skills</span>
                <span>{skillsCount}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Reports</span>
                <span>{reportsCount}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={proofReady ? 'text-green-700 border-green-300' : 'text-amber-700 border-amber-300'}>
                  {proofReady ? 'Ready to share' : 'Incomplete'}
                </Badge>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button className="flex-1" variant="outline" asChild>
                <Link href={`/p/${username}`}>View proof page</Link>
              </Button>
              <Button variant="outline" onClick={handleCopy} className="shrink-0">
                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-muted-foreground">Set a username to activate your public proof profile.</p>
            <Button className="mt-5 w-full" variant="outline" asChild>
              <Link href="/onboarding/username">Set username</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
