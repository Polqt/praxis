'use client'

import { getGreeting } from '@/features/studio/utils/get-greeting'
import { HeroSection } from '@/features/studio/components/hero-section'
import { VerificationProgressSection } from '@/features/studio/components/verification-progress-section'
import { LatestSubmissionSection } from '@/features/studio/components/latest-submission-section'
import { VerifiedSkillsSection } from '@/features/studio/components/verified-skills-section'
import { ProofProfileSection } from '@/features/studio/components/proof-profile-section'
import type { GitHubAccount, User } from '@praxis/shared'
import type { StudioStats, ProjectSubmission } from '@/features/studio/types'

type Props = {
  user: User
  githubAccount: GitHubAccount
  latestSubmission: ProjectSubmission | null
  stats: StudioStats
}

export function StudioClient({ user, githubAccount, latestSubmission, stats }: Props) {
  const displayName = user.username ?? user.email.split('@')[0]
  const greeting = getGreeting(displayName)

  return (
    <div className="flex-1 px-12 py-10 overflow-y-auto">
      <HeroSection greeting={greeting} githubAccount={githubAccount} />
      <VerificationProgressSection stats={stats} />
      <div className="mt-10 grid grid-cols-[1fr_300px] gap-6">
        <div className="flex flex-col gap-8">
          <LatestSubmissionSection submission={latestSubmission} />
          <VerifiedSkillsSection skills={stats.verifiedSkills ?? []} />
        </div>
        <div>
          <ProofProfileSection
            username={user.username}
            skillsCount={stats.verifiedSkillsCount}
            reportsCount={stats.reportsGenerated}
          />
        </div>
      </div>
    </div>
  )
}
