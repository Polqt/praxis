import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconArrowLeft, IconCircleCheck } from '@tabler/icons-react'
import { CATEGORY_LABEL } from '@/features/submissions/constants'
import { ChallengeDescription } from '@/features/challenges/components/challenge-description'
import type { ProjectChallenge } from '@praxis/shared'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ChallengeDetailPage(props: Props) {
  const { id } = await props.params
  const challenge = await serverApiFetch<ProjectChallenge>(`/challenges/${id}`).catch(() => null)

  if (!challenge) notFound()

  const categoryLabel = CATEGORY_LABEL[challenge.projectType] ?? challenge.projectType
  const submitHref = `/submit?challengeId=${challenge.id}`

  return (
    <div className="max-w-180 mx-auto px-6 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground">
        <Link href="/challenges">
          <IconArrowLeft size={14} className="mr-1" />
          Back to challenges
        </Link>
      </Button>

      <h1 className="text-3xl font-semibold tracking-tight">{challenge.title}</h1>
      <Badge variant="outline" className="mt-3">{categoryLabel}</Badge>
      <p className="mt-3 text-sm text-muted-foreground">
        Submit any repository that satisfies this verification standard. Praxis analyses the work independently.
      </p>

      <hr className="my-8" />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">What this challenge verifies</h2>
        <ChallengeDescription content={challenge.description} />
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold">What gets scored</h2>
        <p className="text-xs text-muted-foreground">Each category has a weight and a minimum floor score. Failing any floor disqualifies the submission.</p>
        <ul className="space-y-3 mt-4">
          {challenge.rubric.categories.map((cat) => (
            <li key={cat.name}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <IconCircleCheck size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">{cat.name}</span>
                  {cat.floor > 0 && (
                    <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded-sm">
                      floor {cat.floor}/10
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold tabular-nums">{cat.weight}%</span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary/60" style={{ width: `${cat.weight}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold">Skills earned</h2>
        <div className="flex flex-wrap gap-2">
          {challenge.rubric.categories.map((cat) => (
            <Badge key={cat.name} variant="outline">{cat.name}</Badge>
          ))}
        </div>
      </section>

      {challenge.passingThreshold != null && (
        <section className="mt-8 space-y-2">
          <h2 className="text-sm font-semibold">Passing threshold</h2>
          <p className="text-sm text-muted-foreground">
            Requires a composite score of at least {challenge.passingThreshold} and all category floors must be met.
          </p>
        </section>
      )}

      <div className="mt-10">
        <Button asChild>
          <Link href={submitHref}>Submit repository</Link>
        </Button>
      </div>
    </div>
  )
}
