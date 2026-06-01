'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ChallengeCard } from '@/features/challenges/components/challenge-card'
import type { Challenge, ChallengeCategory } from '@/features/challenges/types'

type Props = {
  challenges: Challenge[]
  isAuthenticated: boolean
}

export function ChallengesClient({ challenges, isAuthenticated }: Props) {
  const [tab, setTab] = useState<ChallengeCategory>('frontend')

  const frontend = challenges.filter((c) => c.category === 'frontend')
  const backend = challenges.filter((c) => c.category === 'backend')

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Verification Challenges</h1>
      <div className="mt-2 space-y-0.5">
        <p className="text-sm text-muted-foreground">Submit real repositories.</p>
        <p className="text-sm text-muted-foreground">Earn verified skills.</p>
        <p className="text-sm text-muted-foreground">Build trusted proof of work.</p>
      </div>

      <div className="mt-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as ChallengeCategory)}>
          <TabsList>
            <TabsTrigger value="frontend">Frontend Engineering</TabsTrigger>
            <TabsTrigger value="backend">Backend Engineering</TabsTrigger>
          </TabsList>
          <TabsContent value="frontend">
            {frontend.length === 0 ? (
              <p className="text-sm text-muted-foreground">No challenges available.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {frontend.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} isAuthenticated={isAuthenticated} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="backend">
            {backend.length === 0 ? (
              <p className="text-sm text-muted-foreground">No challenges available.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {backend.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} isAuthenticated={isAuthenticated} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
