'use client'

import Link from 'next/link'
import { IconArrowLeft } from '@tabler/icons-react'
import { ReportHero } from '@/features/reports/components/report-hero'
import { ReportSummary } from '@/features/reports/components/report-summary'
import { ScoreOverview } from '@/features/reports/components/score-overview'
import { VerifiedSkillsSection } from '@/features/reports/components/verified-skills-section'
import { EvidenceSection } from '@/features/reports/components/evidence-section'
import { StrengthsImprovementsSection } from '@/features/reports/components/strengths-improvements-section'
import { ReportFooter } from '@/features/reports/components/report-footer'
import type { Report } from '@/features/reports/types'

type Props = {
  report: Report
}

export function ReportClient({ report }: Props) {
  return (
    <div className="px-12 py-10">
      <div className="max-w-[800px] mx-auto">
        <Link
          href="/submissions"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <IconArrowLeft size={14} />
          Back to submissions
        </Link>

        <ReportHero
          repositoryName={report.repositoryName}
          challengeTitle={report.challengeTitle}
          status={report.status}
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
          <EvidenceSection evidence={report.evidence} />
        </div>

        <div className="mt-10">
          <StrengthsImprovementsSection
            strengths={report.strengths}
            improvements={report.improvements}
          />
        </div>

        <hr className="border-border mt-12 mb-8" />

        <ReportFooter
          repositoryUrl={report.repositoryUrl}
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
