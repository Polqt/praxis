'use client'

import { motion } from 'framer-motion'
import { ProfileHero } from '@/features/profile/components/profile-hero'
import { VerifiedSkillsSection } from '@/features/profile/components/verified-skills-section'
import { VerifiedProjectsSection } from '@/features/profile/components/verified-projects-section'
import { ProofStatisticsSection } from '@/features/profile/components/proof-statistics-section'
import { ProfileFooter } from '@/features/profile/components/profile-footer'
import { staggerContainer, fadeUp } from '@/lib/animations'
import type { PublicProfile } from '@/features/profile/types'
import type { User } from '@praxis/shared'

type Props = {
  profile: PublicProfile
  viewingUser: User | null
}

export function ProfileClient({ profile, viewingUser }: Props) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-10"
    >
      <motion.div variants={fadeUp}>
        <ProfileHero
          username={profile.username}
          verifiedSkills={profile.verifiedSkills}
          reportsCount={profile.reportsCount}
          verificationsCount={profile.verificationsCount}
        />
      </motion.div>

      <hr className="border-border" />

      <motion.div variants={fadeUp}>
        <VerifiedSkillsSection skills={profile.verifiedSkills} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <VerifiedProjectsSection
          reports={profile.latestReports}
          profileUsername={profile.username}
          viewingUser={viewingUser}
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <ProofStatisticsSection
          reportsCount={profile.reportsCount}
          skillsCount={profile.verifiedSkills.length}
          challengesCompleted={profile.challengesCompleted}
        />
      </motion.div>

      <hr className="border-border" />

      <ProfileFooter />
    </motion.div>
  )
}
