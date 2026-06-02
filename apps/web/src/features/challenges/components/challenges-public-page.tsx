'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MarqueeTicker } from '@/features/challenges/components/marquee-ticker'
import { VerificationReportMockup } from '@/features/challenges/components/verification-report-mockup'
import { ChallengeCard } from '@/features/challenges/components/challenge-card'
import type { Challenge, ChallengeCategory } from '@/features/challenges/types'

type Props = {
  challenges: Challenge[]
  isAuthenticated: boolean
}

export function ChallengesPublicPage({ challenges, isAuthenticated }: Props) {
  const [tab, setTab] = useState<ChallengeCategory>('frontend')

  const frontend = challenges.filter((c) => c.category === 'frontend')
  const backend = challenges.filter((c) => c.category === 'backend')

  return (
    <div>
      <section className="bg-muted/40 h-[calc(100vh-3.5rem)] flex flex-col justify-center px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="size-2 rounded-sm bg-primary inline-block shrink-0" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              Verification challenges
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Prove what you have built. Not what you claim.
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
            Submit real repositories. Earn verified skills. Build trusted proof of work that speaks for itself.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild>
              <Link href={isAuthenticated ? '/submit' : '/sign-in'}>Get started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/example-report">See an example</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background h-screen flex flex-col px-6 md:px-20">
        <MarqueeTicker />
        <div className="flex-1 flex flex-col justify-center py-8">
          <h2 className="text-xl font-semibold tracking-tight">Browse verification challenges</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Each challenge verifies a specific engineering discipline through real repository analysis.
          </p>
          <div className="mt-6">
            <Tabs value={tab} onValueChange={(v) => setTab(v as ChallengeCategory)}>
              <TabsList>
                <TabsTrigger value="frontend">Frontend Engineering</TabsTrigger>
                <TabsTrigger value="backend">Backend Engineering</TabsTrigger>
              </TabsList>
              <TabsContent value="frontend">
                <ChallengeList challenges={frontend} isAuthenticated={isAuthenticated} />
              </TabsContent>
              <TabsContent value="backend">
                <ChallengeList challenges={backend} isAuthenticated={isAuthenticated} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 h-screen flex items-center px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="size-2 rounded-sm bg-primary inline-block shrink-0" />
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                Start verifying
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              Your GitHub repositories are already your portfolio. Let Praxis verify them.
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Connect your GitHub account, select a verification challenge, submit a repository, and receive an
              independent analysis report in minutes.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href={isAuthenticated ? '/submit' : '/sign-in'}>Get started</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-start md:justify-end">
            <VerificationReportMockup />
          </div>
        </div>
      </section>
    </div>
  )
}

function ChallengeList({ challenges, isAuthenticated }: { challenges: Challenge[]; isAuthenticated: boolean }) {
  if (challenges.length === 0) {
    return <p className="text-sm text-muted-foreground mt-3">No challenges available.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} isAuthenticated={isAuthenticated} />
      ))}
    </div>
  )
}
