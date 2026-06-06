import Link from 'next/link'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheck,
  IconTargetArrow,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChallengeDescription } from '@/features/challenges/components/challenge-description'
import {
  CHALLENGE_META_BADGE_CLASS,
  CHALLENGE_STATUS_BADGE,
  DIFFICULTY_LABEL,
} from '@/features/challenges/constants'
import { CATEGORY_LABEL } from '@/features/submissions/constants'
import type {
  Challenge,
  ChallengeSubmissionStatus,
} from '@/features/challenges/types'
import type {
  ProjectChallenge,
  ProjectSubmission,
} from '@praxis/shared'

type Props = {
  challenge: ProjectChallenge
  displayChallenge: Challenge
  submissionStatus?: ChallengeSubmissionStatus
  latestSubmission?: ProjectSubmission | null
}

export function ChallengeDetail({
  challenge,
  displayChallenge,
  submissionStatus,
  latestSubmission,
}: Props) {
  const categoryLabel =
    CATEGORY_LABEL[challenge.projectType] ?? challenge.projectType
  const statusLabel = submissionStatus
    ? CHALLENGE_STATUS_BADGE[submissionStatus].label
    : null
  const isVerified = submissionStatus === 'verified'

  return (
    <div className="w-full px-4 py-6 sm:px-6 md:px-10 md:py-10">
      <Link
        href="/challenges"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft size={14} />
        Back to challenges
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Challenge
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {challenge.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Submit a repository that meets this standard and receive an
            evidence-based verification report.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={CHALLENGE_META_BADGE_CLASS}>
              {categoryLabel}
            </Badge>
            <Badge variant="outline" className={CHALLENGE_META_BADGE_CLASS}>
              {DIFFICULTY_LABEL[displayChallenge.difficulty]}
            </Badge>
            {statusLabel ? (
              <Badge
                variant="outline"
                className={CHALLENGE_META_BADGE_CLASS}
              >
                {isVerified ? <IconCircleCheck size={10} /> : null}
                {statusLabel}
              </Badge>
            ) : null}
          </div>
        </div>

        <Button asChild>
          <Link href={`/submit?challengeId=${challenge.id}`}>
            {isVerified ? 'Submit again' : 'Submit repository'}
            <IconArrowRight size={14} />
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border bg-card p-5 sm:p-6">
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Challenge brief
            </p>
            <ChallengeDescription content={challenge.description} />
          </section>

          <section className="rounded-lg border bg-card">
            <div className="border-b px-5 py-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Scoring rubric
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Every category contributes to the final score. All category
                floors must be met.
              </p>
            </div>
            <div className="divide-y">
              {challenge.rubric.categories.map((category) => (
                <div key={category.name} className="px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Minimum {category.floor}/10 to qualify
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {category.weight}%
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Weight
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${category.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 sm:p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Skills assessed
            </p>
            <div className="flex flex-wrap gap-2">
              {displayChallenge.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="rounded-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-5 lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Verification target
            </p>
            <div className="mt-5 flex items-end gap-2">
              <span className="text-4xl font-semibold tabular-nums">
                {challenge.passingThreshold}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">/100</span>
            </div>
            <div className="mt-5 space-y-3 border-t pt-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">Categories</span>
                <span className="font-medium tabular-nums">
                  {challenge.rubric.categories.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">Rubric version</span>
                <span className="font-medium tabular-nums">
                  v{challenge.version}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">Floor rule</span>
                <span className="font-medium">All required</span>
              </div>
            </div>

            <div className="mt-5 rounded-md border bg-muted/30 px-3 py-3">
              <div className="flex items-start gap-2">
                <IconTargetArrow
                  size={14}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Passing requires the composite threshold and every category
                  floor shown in the rubric.
                </p>
              </div>
            </div>

            <Button className="mt-5 w-full" asChild>
              <Link href={`/submit?challengeId=${challenge.id}`}>
                {isVerified ? 'Submit another repository' : 'Start submission'}
              </Link>
            </Button>

            {latestSubmission ? (
              <Button variant="ghost" className="mt-1 w-full" asChild>
                <Link href={`/submissions/${latestSubmission.id}`}>
                  View latest submission
                </Link>
              </Button>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  )
}
