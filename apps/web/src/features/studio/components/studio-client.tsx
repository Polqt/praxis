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
    <div className="p-10 max-w-3xl">
      <HeroSection greeting={greeting} githubAccount={githubAccount} />
      <VerificationProgressSection stats={stats} />
      <LatestSubmissionSection submission={latestSubmission} />
      <VerifiedSkillsSection skills={stats.verifiedSkills} />
      <ProofProfileSection
        username={user.username}
        skillsCount={stats.verifiedSkillsCount}
        reportsCount={stats.reportsGenerated}
      />
    </div>
  )
}
