'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProofProfileSection } from './proof-profile-section'
import { ScoreHistoryCard } from './score-history-card'
import { NextStepCard } from './next-step-card'
import { StatusBadge } from '@/features/submissions/components/status-badge'
import { FormattedDate } from '@/components/ui/formatted-date'
import { staggerContainer, fadeUp } from '@/lib/animations'
import { ONBOARDING_GUIDANCE_GITHUB_CONNECTED, ONBOARDING_GUIDANCE_GITHUB_DISCONNECTED, CARD_LABEL_CLASS } from '../constants'
import { repoName } from '@/lib/praxis-format'
import type { DashboardStats, GitHubAccount, ProjectChallenge, ProjectSubmission, VerificationReport } from '@praxis/shared'
import type { ScoreHistoryEntry } from '@/lib/api'

type SubmissionStats = {
  totalSubmissions: number
  verifiedCount: number
  inProgressCount: number
  reportsGenerated: number
}

type Props = {
  displayName: string
  githubAccount: GitHubAccount | null
  activeSubmission: ProjectSubmission | null
  activeChallenge: ProjectChallenge | null
  latestTerminalSubmission: ProjectSubmission | null
  latestReport: VerificationReport | null
  submissionStats: SubmissionStats
  dashboard: DashboardStats
  username: string | null
  progress: number
  completed: number
  total: number
  proofReady: boolean
  scoreHistory: ScoreHistoryEntry[]
  challenges: ProjectChallenge[]
  verifiedSubmissions: ProjectSubmission[]
}


const greetingSubscribe = () => () => {}
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export function StudioClient({
  displayName, githubAccount, activeSubmission, activeChallenge,
  latestTerminalSubmission, latestReport, submissionStats, dashboard,
  username, progress, completed, total, proofReady, scoreHistory,
  challenges, verifiedSubmissions,
}: Props) {
  const period = useSyncExternalStore(greetingSubscribe, getGreeting, () => null)
  const verifiedChallengeIds = verifiedSubmissions.map((s) => s.challengeId)
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="px-4 py-6 sm:px-6 md:px-10 md:py-10 w-full"
    >
      <motion.section variants={fadeUp} className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {period ? `Good ${period}, ${displayName}.` : `Hello, ${displayName}.`}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {githubAccount?.connected
              ? 'Your GitHub is connected and ready.'
              : 'Connect GitHub before submitting a repository for verification.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link href="/challenges">Browse Challenges</Link></Button>
            <Button variant="outline" asChild><Link href="/submissions">My Submissions</Link></Button>
          </div>
        </div>
      </motion.section>

      <motion.div variants={fadeUp} className="mt-8 grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
        <div className="p-4">
          <p className="text-xl sm:text-2xl font-semibold tabular-nums">{completed}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
        </div>
        <div className="p-4">
          <p className="text-xl sm:text-2xl font-semibold tabular-nums">{dashboard.verifiedSkills.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Skills</p>
        </div>
        <div className="p-4">
          <p className="text-xl sm:text-2xl font-semibold tabular-nums">{submissionStats.reportsGenerated}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Reports</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4 flex items-center gap-4">
        <Progress value={progress} className="h-0.5 flex-1" />
        <span className="text-xs text-muted-foreground shrink-0">{completed} of {total} challenges</span>
      </motion.div>

      <motion.div variants={staggerContainer} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div variants={fadeUp}>
          <div className="rounded-lg border bg-card p-5 flex flex-col h-full">
            <p className={CARD_LABEL_CLASS}>Latest submission</p>
            {activeSubmission ? (
              <>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium truncate">{repoName(activeSubmission.githubRepoFullName)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activeChallenge?.title ?? ''}</p>
                  </div>
                  <StatusBadge status={activeSubmission.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Submitted <FormattedDate value={activeSubmission.submittedAt} />
                </p>
                <Button variant="outline" size="sm" className="mt-4 self-start" asChild>
                  <Link href={`/submissions/${activeSubmission.id}`}>View submission</Link>
                </Button>
              </>
            ) : githubAccount?.connected ? (
              <div className="mt-3">
                <p className="text-sm font-medium">{ONBOARDING_GUIDANCE_GITHUB_CONNECTED.heading}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{ONBOARDING_GUIDANCE_GITHUB_CONNECTED.body}</p>
                <p className="mt-3 text-xs text-muted-foreground">{ONBOARDING_GUIDANCE_GITHUB_CONNECTED.note}</p>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm font-medium">{ONBOARDING_GUIDANCE_GITHUB_DISCONNECTED.heading}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{ONBOARDING_GUIDANCE_GITHUB_DISCONNECTED.body}</p>
                <Button variant="outline" size="sm" className="mt-4 self-start" asChild>
                  <Link href="/settings">Go to Settings</Link>
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div className="rounded-lg border bg-card p-5 flex flex-col h-full">
            <p className={CARD_LABEL_CLASS}>Latest report</p>
            {latestReport && latestTerminalSubmission ? (
              <>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium truncate">{repoName(latestTerminalSubmission.githubRepoFullName)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5"><FormattedDate value={latestReport.generatedAt} /></p>
                  </div>
                  <StatusBadge status={latestReport.verdict} />
                </div>
                <Button variant="outline" size="sm" className="mt-4 self-start" asChild>
                  <Link href={`/reports/${latestReport.submissionId}`}>View report</Link>
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground mt-3">No report generated yet.</p>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div className="rounded-lg border bg-card p-5 h-full">
            <p className={CARD_LABEL_CLASS}>Verified skills</p>
            {dashboard.verifiedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {dashboard.verifiedSkills.map((userSkill) => (
                  <Badge key={userSkill.id} variant="secondary" className="gap-1 text-xs rounded">
                    <span className="text-green-500 text-[10px]">✓</span>
                    {userSkill.skill.name}
                  </Badge>
                ))}
              </div>
            ) : submissionStats.verifiedCount > 0 ? (
              <p className="text-sm text-muted-foreground mt-2">
                No skills were awarded yet. This may be a configuration issue — contact support if you believe this is wrong.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Skills appear here after your first verified submission.
              </p>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <ProofProfileSection
            username={username}
            skillsCount={dashboard.verifiedSkills.length}
            reportsCount={submissionStats.reportsGenerated}
            proofReady={proofReady}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4">
        <NextStepCard
          verifiedSkills={dashboard.verifiedSkills}
          challenges={challenges}
          verifiedChallengeIds={verifiedChallengeIds}
        />
      </motion.div>

      {scoreHistory.length > 0 && (
        <motion.div variants={fadeUp} className="mt-4">
          <ScoreHistoryCard history={scoreHistory} />
        </motion.div>
      )}
    </motion.div>
  )
}
