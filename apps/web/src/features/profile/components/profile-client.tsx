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
  const verifiedProjectsCount = profile.verifiedProjectsCount ?? profile.reportsCount
  const publishedReportsCount = profile.publishedReportsCount ?? profile.latestReports.filter((report) => report.publicToken).length
  const needsImprovementCount = profile.needsImprovementCount ?? profile.latestReports.filter((report) => report.submissionStatus === 'insufficient').length

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
          verifiedProjectsCount={verifiedProjectsCount}
          publishedReportsCount={publishedReportsCount}
          needsImprovementCount={needsImprovementCount}
          isOwner={viewingUser?.username === profile.username}
        />
      </motion.div>

      <hr className="border-border" />

      <motion.div variants={fadeUp}>
        <VerifiedSkillsSection skills={profile.verifiedSkills} reports={profile.latestReports} />
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
          verifiedCount={verifiedProjectsCount}
          publishedReportsCount={publishedReportsCount}
          needsImprovementCount={needsImprovementCount}
          skillsCount={profile.verifiedSkills.length}
        />
      </motion.div>

      <hr className="border-border" />

      <ProfileFooter />
    </motion.div>
  )
}
