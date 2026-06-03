'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react'
import { ReportHero } from './report-hero'
import { ScoreOverview } from './score-overview'
import { VerifiedSkillsSection } from './verified-skills-section'
import { StrengthsImprovementsSection } from './strengths-improvements-section'
import { ReportFooter } from './report-footer'
import { ShareProofButton } from './share-proof-button'
import { ReportClaritySection } from './report-clarity-section'
import { REPORT_DISCLAIMER_TEXT, REPORT_DISCLAIMER_LINK_LABEL, REPORT_DISCLAIMER_LINK_HREF } from '@/features/reports/constants'
import { staggerContainer, fadeUp } from '@/lib/animations'
import type { Report } from '@/features/reports/types'

type Props = {
  report: Report
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  challengeId?: string
  feedbackSlot?: React.ReactNode
}

export function ReportClient({ report, backHref = '/submissions', backLabel = 'Back to submissions', actions, challengeId, feedbackSlot }: Props) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="px-10 py-10 w-full"
    >
      <div className="flex items-center justify-between mb-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft size={14} />
          {backLabel}
        </Link>
        <div className="flex items-center gap-2">
          {report.isPublic && report.publicToken && (
            <ShareProofButton publicToken={report.publicToken} />
          )}
          {actions && actions}
        </div>
      </div>

      <motion.div variants={fadeUp}>
        <ReportHero
          repositoryName={report.repositoryName}
          challengeTitle={report.challengeTitle}
          status={report.status}
          compositeScore={report.compositeScore}
        />
      </motion.div>

      <hr className="border-border my-8" />

      <motion.p variants={fadeUp} className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
        {report.summary}
      </motion.p>

      <motion.div variants={fadeUp} className="mt-10">
        <ScoreOverview
          scores={report.scores}
          repositoryName={report.repositoryName}
          commitSha={report.commitSha}
        />
      </motion.div>

      {report.skills.length > 0 && (
        <motion.div variants={fadeUp} className="mt-10">
          <VerifiedSkillsSection skills={report.skills} />
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="mt-10">
        <StrengthsImprovementsSection
          strengths={report.strengths}
          improvements={report.improvements}
          derived={report.derivedStrengthsAndImprovements}
        />
      </motion.div>

      <ReportClaritySection
        status={report.status}
        scores={report.scores}
        allCitedFiles={report.allCitedFiles}
        submissionId={report.submissionId}
        challengeId={challengeId}
      />

      {feedbackSlot && (
        <motion.div variants={fadeUp} className="mt-6">
          {feedbackSlot}
        </motion.div>
      )}

      <hr className="border-border mt-12 mb-6" />

      <motion.div variants={fadeUp}>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6">
          <IconInfoCircle size={12} className="shrink-0" />
          {REPORT_DISCLAIMER_TEXT}{' '}
          <Link href={REPORT_DISCLAIMER_LINK_HREF} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            {REPORT_DISCLAIMER_LINK_LABEL}
          </Link>
        </p>
        <ReportFooter
          repositoryName={report.repositoryName}
          commitSha={report.commitSha}
          challengeTitle={report.challengeTitle}
          generatedAt={report.generatedAt}
          modelVersion={report.modelVersion}
        />
      </motion.div>
    </motion.div>
  )
}
