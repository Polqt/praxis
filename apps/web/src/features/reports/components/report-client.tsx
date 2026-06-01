'use client'

import Link from 'next/link'
import { IconArrowLeft } from '@tabler/icons-react'
import { ReportHero } from '@/features/reports/components/report-hero'
import { ReportSummary } from '@/features/reports/components/report-summary'
import { ScoreOverview } from '@/features/reports/components/score-overview'
import { VerifiedSkillsSection } from '@/features/reports/components/verified-skills-section'
import { StrengthsImprovementsSection } from '@/features/reports/components/strengths-improvements-section'
import { ReportFooter } from '@/features/reports/components/report-footer'
import type { Report } from '@/features/reports/types'

type Props = {
  report: Report
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
}

export function ReportClient({ report, backHref = '/submissions', backLabel = 'Back to submissions', actions }: Props) {
  return (
    <div className="px-12 py-10">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft size={14} />
            {backLabel}
          </Link>
          {actions && <div>{actions}</div>}
        </div>

        <ReportHero
          repositoryName={report.repositoryName}
          challengeTitle={report.challengeTitle}
          status={report.status}
          compositeScore={report.compositeScore}
        />

        <hr className="border-border my-8" />

        <ReportSummary summary={report.summary} />

        <div className="mt-10">
          <ScoreOverview scores={report.scores} />
        </div>

        <div className="mt-10">
          <VerifiedSkillsSection skills={report.skills} />
        </div>

        <div className="mt-10">
          <StrengthsImprovementsSection
            strengths={report.strengths}
            improvements={report.improvements}
            derived={report.derivedStrengthsAndImprovements}
          />
        </div>

        <hr className="border-border mt-12 mb-8" />

        <ReportFooter
          repositoryName={report.repositoryName}
          commitSha={report.commitSha}
          challengeTitle={report.challengeTitle}
          generatedAt={report.generatedAt}
          modelVersion={report.modelVersion}
        />
      </div>
    </div>
  )
}
