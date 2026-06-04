'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react'
import { ReportHero } from './report-hero'
import { ScoreOverview } from './score-overview'
import { ScoreErrorBoundary } from './score-error-boundary'
import { SkillsNearMissSection } from './skills-near-miss-section'
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
  language?: string | null
  passingThreshold?: number | null
  executionSlot?: React.ReactNode
  feedbackSlot?: React.ReactNode
  twitterSlot?: React.ReactNode
  viewCount?: number
}

export function ReportClient({ report, backHref = '/submissions', backLabel = 'Back to submissions', actions, challengeId, language, passingThreshold, executionSlot, feedbackSlot, twitterSlot, viewCount }: Props) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="px-4 py-6 sm:px-6 md:px-10 md:py-10 w-full"
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
          {viewCount !== undefined && viewCount > 0 && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}
            </span>
          )}
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
          language={language}
        />
      </motion.div>

      <hr className="border-border my-8" />

      {passingThreshold != null && (
        <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6 text-xs text-muted-foreground">
          <span>Threshold: <span className="font-semibold text-foreground">{passingThreshold}/100</span></span>
          <span>·</span>
          <span>Your score: <span className="font-semibold text-foreground">{report.compositeScore}/100</span></span>
          {report.status === 'insufficient' && (
            <>
              <span>·</span>
              <span className="text-amber-600 font-semibold">
                {Math.max(0, passingThreshold - report.compositeScore)} points to pass
              </span>
            </>
          )}
        </motion.div>
      )}

      <motion.p variants={fadeUp} className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
        {report.summary}
      </motion.p>

      <motion.div variants={fadeUp} className="mt-10">
        <ScoreErrorBoundary>
          <ScoreOverview
            scores={report.scores}
            repositoryName={report.repositoryName}
            commitSha={report.commitSha}
          />
        </ScoreErrorBoundary>
      </motion.div>

      {report.skills.length > 0 && (
        <motion.div variants={fadeUp} className="mt-10">
          <VerifiedSkillsSection skills={report.skills} />
        </motion.div>
      )}

      {executionSlot && (
        <motion.div variants={fadeUp} className="mt-10">
          {executionSlot}
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="mt-10">
        <StrengthsImprovementsSection
          strengths={report.strengths}
          improvements={report.improvements}
          derived={report.derivedStrengthsAndImprovements}
          categories={report.scores.map((s) => s.category)}
        />
      </motion.div>

      <ReportClaritySection
        status={report.status}
        scores={report.scores}
        allCitedFiles={report.allCitedFiles}
        submissionId={report.submissionId}
        challengeId={challengeId}
      />

      {report.status === 'insufficient' && (
        <SkillsNearMissSection scores={report.scores} />
      )}

      {feedbackSlot && (
        <motion.div variants={fadeUp} className="mt-6">
          {feedbackSlot}
        </motion.div>
      )}

      {twitterSlot && (
        <motion.div variants={fadeUp} className="mt-6">
          {twitterSlot}
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
