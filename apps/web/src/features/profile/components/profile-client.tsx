'use client'

import { motion } from 'framer-motion'
import { staggerContainer, fadeUp } from '@/lib/animations'
import { ProfileHero } from './profile-hero'
import { VerifiedSkillsSection } from './verified-skills-section'
import { VerifiedProjectsSection } from './verified-projects-section'
import { ProofStatisticsSection } from './proof-statistics-section'
import { ProfileFooter } from './profile-footer'
import type { PublicProfile } from '../types'
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
          bio={profile.bio}
          verifiedSkills={profile.verifiedSkills}
          reportsCount={profile.reportsCount}
          isOwner={viewingUser?.username === profile.username}
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
          verifiedCount={profile.reportsCount}
          skillsCount={profile.verifiedSkills.length}
        />
      </motion.div>

      <hr className="border-border" />

      <ProfileFooter />
    </motion.div>
  )
}
