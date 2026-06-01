import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ProjectChallenge } from '@praxis/shared'

const ACCEPTED_REPOSITORIES = [
  'Inventory API',
  'Booking API',
  'CRM Backend',
  'Auth Service',
  'Internal Tools API',
]

const EVALUATION_SIGNALS = [
  'REST route design and status handling',
  'Authentication and authorization implementation',
  'Database schema, migrations, and persistence patterns',
  'Automated tests and CI configuration',
  'README, API documentation, and setup instructions',
  'Deployment, Docker, environment, or hosting evidence',
]

type ChallengeDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ChallengeDetailPage(props: ChallengeDetailPageProps) {
  const { id } = await props.params
  const supabase = await createClient()
  const [{ data: { user } }, challenge] = await Promise.all([
    supabase.auth.getUser(),
    serverApiFetch<ProjectChallenge>(`/challenges/${id}`),
  ])
  const submitHref = user
    ? `/submit?challengeId=${challenge.id}`
    : `/sign-in?next=${encodeURIComponent(`/submit?challengeId=${challenge.id}`)}`

  return (
    <div className="px-10 pt-24 pb-8 max-w-5xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Badge variant="outline">Backend Engineering</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{challenge.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            This is a verification standard. Submit any backend repository that satisfies the rubric.
          </p>
        </div>
        <Button asChild>
          <Link href={submitHref}>{user ? 'Submit Repository' : 'Start Verification'}</Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-[1fr_320px] gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold">Accepted repositories</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {ACCEPTED_REPOSITORIES.map((repository) => (
                <Badge key={repository} variant="secondary">{repository}</Badge>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              The repository can be any real backend project that satisfies the standard. Praxis verifies the work,
              not a fixed starter task.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold">Skills earned</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {challenge.rubric.categories.map((category) => (
                <Badge key={category.name} variant="outline">{category.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="font-semibold">Rubric</h2>
          <div className="mt-4 divide-y">
            {challenge.rubric.categories.map((category) => (
              <div key={category.name} className="py-4 flex items-center justify-between gap-6">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">Minimum floor: {category.floor}/10</p>
                </div>
                <Badge variant="outline">{category.weight}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="font-semibold">Evaluation signals</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {EVALUATION_SIGNALS.map((signal) => (
              <div key={signal} className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
                {signal}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
