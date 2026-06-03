import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buildAuthRedirect } from '@/shared/utils/build-auth-redirect'
import { IconArrowLeft, IconCircleCheck, IconExternalLink } from '@tabler/icons-react'
import { CATEGORY_LABEL } from '@/features/submissions/constants'
import type { ProjectChallenge } from '@praxis/shared'

const ACCEPTED_REPOSITORY_EXAMPLES = [
  'Inventory API',
  'Booking API',
  'CRM Backend',
  'Auth Service',
  'Internal Tools API',
]

type Props = {
  params: Promise<{ id: string }>
}

export default async function ChallengeDetailPage(props: Props) {
  const { id } = await props.params
  const supabase = await createClient()

  const [{ data: { user } }, challenge] = await Promise.all([
    supabase.auth.getUser(),
    serverApiFetch<ProjectChallenge>(`/challenges/${id}`).catch(() => null),
  ])

  if (!challenge) notFound()

  const categoryLabel = CATEGORY_LABEL[challenge.projectType] ?? challenge.projectType
  const submitHref = user
    ? `/submit?challengeId=${challenge.id}`
    : buildAuthRedirect(`/submit?challengeId=${challenge.id}`)
  const ctaLabel = user ? 'Submit repository' : 'Start verification'

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
        <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold">Rubric categories</h2>
        <ul className="space-y-2">
          {challenge.rubric.categories.map((cat) => (
            <li key={cat.name} className="flex items-center gap-2">
              <IconCircleCheck size={14} className="text-muted-foreground shrink-0" />
              <span className="text-sm">{cat.name}</span>
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

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold">Accepted repository examples</h2>
        {/* Temporary UI fallback — replace when backend returns acceptedExamples */}
        <ul className="space-y-1.5">
          {ACCEPTED_REPOSITORY_EXAMPLES.map((name) => (
            <li key={name} className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
              <span>{name}</span>
              <IconExternalLink size={12} className="shrink-0" />
            </li>
          ))}
        </ul>
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
          <Link href={submitHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
