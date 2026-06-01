'use client'

import { ProfileHero } from '@/features/profile/components/profile-hero'
import { VerifiedSkillsSection } from '@/features/profile/components/verified-skills-section'
import { VerifiedProjectsSection } from '@/features/profile/components/verified-projects-section'
import { ProofStatisticsSection } from '@/features/profile/components/proof-statistics-section'
import { ProfileFooter } from '@/features/profile/components/profile-footer'
import type { PublicProfile } from '@/features/profile/types'
import type { User } from '@praxis/shared'

type Props = {
  profile: PublicProfile
  viewingUser: User | null
}

export function ProfileClient({ profile, viewingUser }: Props) {
  return (
    <div className="flex flex-col gap-10">
      <ProfileHero
        username={profile.username}
        verifiedSkills={profile.verifiedSkills}
        reportsCount={profile.reportsCount}
        verificationsCount={profile.verificationsCount}
      />

      <hr className="border-border" />

      <VerifiedSkillsSection skills={profile.verifiedSkills} />

      <VerifiedProjectsSection
        reports={profile.latestReports}
        profileUsername={profile.username}
        viewingUser={viewingUser}
      />

      <ProofStatisticsSection
        reportsCount={profile.reportsCount}
        skillsCount={profile.verifiedSkills.length}
        challengesCompleted={profile.challengesCompleted}
      />

      <hr className="border-border" />

      <ProfileFooter />
    </div>
  )
}
