'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconArrowLeft, IconCheck, IconInfoCircle } from '@tabler/icons-react'
import { ReportHero } from './report-hero'
import { ScoreOverview } from './score-overview'
import { ScoreErrorBoundary } from './score-error-boundary'
import { NextBestFixesSection } from './next-best-fixes-section'
import { VerifiedSkillsSection } from './verified-skills-section'
import { StrengthsImprovementsSection } from './strengths-improvements-section'
import { ReportFooter } from './report-footer'
import { ReportClaritySection } from './report-clarity-section'
import { AiEvidenceReviewSection } from './ai-evidence-review-section'
import { SkillProgressSection } from './skill-progress-section'
import { SubmissionDeltaSection } from './submission-delta-section'
import {
  REPORT_DISCLAIMER_TEXT,
  REPORT_DISCLAIMER_LINK_LABEL,
  REPORT_DISCLAIMER_LINK_HREF,
  SECTION_LABEL_CLASS,
  STATUS_CONFIG,
} from '@/features/reports/constants'
import { Separator } from '@/components/ui/separator'
import { staggerContainer, fadeUp } from '@/lib/animations'
import type { Report } from '@/features/reports/types'

type Props = {
  report: Report
  backHref?: string
  backLabel?: string
  submissionActions?: React.ReactNode
  proofActions?: React.ReactNode
  challengeId?: string
  language?: string | null
  passingThreshold?: number | null
  executionSlot?: React.ReactNode
  feedbackSlot?: React.ReactNode
  twitterSlot?: React.ReactNode
}

export function ReportClient({
  report,
  backHref = '/submissions',
  backLabel = 'Back to submissions',
  submissionActions,
  proofActions,
  challengeId,
  language,
  passingThreshold,
  executionSlot,
  feedbackSlot,
  twitterSlot,
}: Props) {
  const statusConfig = STATUS_CONFIG[report.status]
  const pointsToPass = passingThreshold != null ? Math.max(0, passingThreshold - report.compositeScore) : 0
  const passed = passingThreshold == null || report.compositeScore >= passingThreshold

  const hasActions = submissionActions || proofActions

  return (
    <div className="flex flex-col h-[calc(100vh-(--spacing(16)))] px-6 md:px-10 pt-6 pb-0 w-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft size={14} />
          {backLabel}
        </Link>

        {hasActions && (
          <div className="flex items-center gap-2">
            {submissionActions && (
              <div className="flex items-center gap-2">
                {submissionActions}
              </div>
            )}
            {submissionActions && proofActions && (
              <Separator orientation="vertical" className="h-4 mx-1" />
            )}
            {proofActions && (
              <div className="flex items-center gap-2">
                {proofActions}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-8 items-start flex-1 min-h-0">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex-1 min-w-0 overflow-y-auto h-full pr-2 pb-10"
        >
          <motion.div variants={fadeUp}>
            <ReportHero
              repositoryName={report.repositoryName}
              challengeTitle={report.challengeTitle}
              status={report.status}
              compositeScore={report.compositeScore}
              language={language}
            />
          </motion.div>

          <Separator className="my-8" />

          <motion.p variants={fadeUp} className="text-sm text-muted-foreground leading-relaxed">
            {report.summary}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10">
            <ScoreErrorBoundary>
              <ScoreOverview
                scores={report.scores}
                repositoryName={report.repositoryName}
                commitSha={report.commitSha}
                skillProgress={report.skillProgress}
              />
            </ScoreErrorBoundary>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10">
            <VerifiedSkillsSection skills={report.skills} scores={report.scores} />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10">
            <SkillProgressSection items={report.skillProgress} />
          </motion.div>

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

          <motion.div variants={fadeUp} className="mt-10">
            <SubmissionDeltaSection delta={report.previousSubmission} />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10">
            <AiEvidenceReviewSection review={report.aiReview} />
          </motion.div>

          <ReportClaritySection
            status={report.status}
            scores={report.scores}
            allCitedFiles={report.allCitedFiles}
            submissionId={report.submissionId}
            challengeId={challengeId}
          />

          {report.status === 'insufficient' && (
            <NextBestFixesSection scores={report.scores} />
          )}

          {twitterSlot && (
            <motion.div variants={fadeUp} className="mt-6 flex items-center gap-3">
              {twitterSlot}
            </motion.div>
          )}

          <Separator className="mt-12 mb-6" />

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

        <div className="w-72 shrink-0 hidden lg:flex lg:flex-col lg:gap-4 sticky top-0 overflow-y-auto max-h-full pb-10">
          <div className="rounded-lg border bg-card p-5 flex flex-col gap-4 shrink-0">
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md border text-sm font-medium ${statusConfig.className}`}>
                {report.status === 'verified' && <IconCheck size={13} strokeWidth={2.5} />}
                {statusConfig.label}
              </span>
            </div>

            <p className="text-5xl font-semibold tabular-nums text-center">
              {report.compositeScore ?? 0}
              <span className="text-xl font-normal text-muted-foreground">/100</span>
            </p>

            {passingThreshold != null && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Threshold</span>
                  <span className="font-medium">{passingThreshold}/100</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Your score</span>
                  <span className="font-medium">{report.compositeScore}/100</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Points to pass</span>
                  {passed ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <IconCheck size={11} strokeWidth={2.5} /> Passed
                    </span>
                  ) : (
                    <span className="font-medium text-amber-600">{pointsToPass}</span>
                  )}
                </div>
              </div>
            )}
          </div>
\
          {feedbackSlot && (
            <div className="rounded-lg border bg-card p-4">
              <p className={`${SECTION_LABEL_CLASS} mb-3`}>Report feedback</p>
              {feedbackSlot}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
