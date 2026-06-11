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
  CATEGORY_STATUS_CLASS,
} from '@/features/reports/constants'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
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

  return (
    <div className="px-6 md:px-10 pt-6 pb-16 w-full">
      <div className="mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft size={14} />
          {backLabel}
        </Link>
      </div>

      <div className="flex items-start gap-8">
        {/* ── Main column ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex-1 min-w-0"
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

          <motion.div variants={fadeUp}>
            <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
            {report.aiFallback && (
              <p className="mt-2 text-[11px] text-muted-foreground/60 italic">
                AI-generated narratives are unavailable — report uses automated summaries.
              </p>
            )}
          </motion.div>

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
            <>
              <NextBestFixesSection scores={report.scores} />
              {submissionActions && (
                <motion.div variants={fadeUp} className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
                  <p className="text-sm font-semibold text-amber-800 mb-1">Ready to resubmit?</p>
                  <p className="text-xs text-amber-700 mb-4">
                    Fix the floor failures above, push your changes, then resubmit for a fresh evaluation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {submissionActions}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {feedbackSlot && (
            <motion.div variants={fadeUp} className="mt-10">
              <div className="rounded-lg border bg-card p-5">
                <p className={`${SECTION_LABEL_CLASS} mb-3`}>Report feedback</p>
                {feedbackSlot}
              </div>
            </motion.div>
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

        {/* ── Right column ── */}
        <div className="w-72 shrink-0 hidden lg:flex flex-col gap-4 sticky top-6 self-start">

          {/* Card 1 — Score summary */}
          <div className="rounded-lg border bg-card p-4">
            <p className={`${SECTION_LABEL_CLASS} mb-3`}>Score</p>
            <div className="flex items-end justify-between mb-3">
              <p className="text-4xl font-semibold tabular-nums leading-none">
                {report.compositeScore ?? 0}
                <span className="text-base font-normal text-muted-foreground">/100</span>
              </p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium ${statusConfig.className}`}>
                {report.status === 'verified' && <IconCheck size={11} strokeWidth={2.5} />}
                {statusConfig.label}
              </span>
            </div>
            {passingThreshold != null && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Threshold</span>
                  <span className="font-medium">{passingThreshold}/100</span>
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

          {/* Card 2 — Quick actions */}
          {(submissionActions || proofActions) && (
            <div className="rounded-lg border bg-card p-4">
              <p className={`${SECTION_LABEL_CLASS} mb-3`}>Actions</p>
              <div className="flex flex-col gap-2">
                {proofActions}
                {submissionActions && report.status !== 'insufficient' && submissionActions}
              </div>
            </div>
          )}

          {/* Card 3 — Category summary */}
          {report.scores.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <p className={`${SECTION_LABEL_CLASS} mb-3`}>Categories</p>
              <div className="flex flex-col gap-2">
                {report.scores.map((s) => {
                  const scorePercent = (s.score / 10) * 100
                  return (
                    <div key={s.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground truncate flex-1 mr-2">{s.category}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] uppercase tracking-widest font-medium px-1.5 py-0.5 border rounded-sm ${s.status ? (CATEGORY_STATUS_CLASS[s.status] ?? 'bg-muted text-muted-foreground border-border') : 'bg-muted text-muted-foreground border-border'}`}>
                            {s.status}
                          </span>
                          <span className="text-xs font-semibold tabular-nums w-8 text-right">{s.score}/10</span>
                        </div>
                      </div>
                      <Progress
                        value={scorePercent}
                        className={`h-1 *:data-[slot=progress-indicator]:transition-none ${
                          s.status === 'pass'
                            ? '*:data-[slot=progress-indicator]:bg-green-500'
                            : s.status === 'floor'
                              ? '*:data-[slot=progress-indicator]:bg-amber-500'
                              : '*:data-[slot=progress-indicator]:bg-red-500'
                        }`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Card 4 — Points breakdown */}
          {report.scores.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <p className={`${SECTION_LABEL_CLASS} mb-3`}>Points breakdown</p>
              <div className="flex flex-col gap-1.5">
                {report.scores.map((s) => {
                  const weighted = s.weight != null ? ((s.score / 10) * s.weight).toFixed(1) : null
                  return (
                    <div key={s.category} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate flex-1 mr-2">{s.category}</span>
                      <span className="font-medium tabular-nums shrink-0">
                        {weighted != null ? `${weighted} / ${s.weight}` : `${s.score}/10`}
                      </span>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between text-xs pt-2 mt-1 border-t border-border font-semibold">
                  <span>Total</span>
                  <span>{report.compositeScore}/100</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
