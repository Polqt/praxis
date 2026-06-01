import { redirect } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { Card, CardContent } from '@/components/ui/card'
import type { ProjectChallenge } from '@praxis/shared'
import { SubmitRepositoryForm } from '@/features/studio/components/submit-repository-form'

export default async function SubmitRepositoryPage(props: PageProps<'/studio/submit'>) {
  const searchParams = await props.searchParams
  const challengeId = typeof searchParams.challengeId === 'string' ? searchParams.challengeId : null
  if (!challengeId) redirect('/studio/challenges')

  const challenge = await serverApiFetch<ProjectChallenge>(`/challenges/${challengeId}`)

  return (
    <div className="px-10 py-8 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Submit repository</h1>
      <p className="mt-2 text-sm text-muted-foreground">{challenge.title}</p>

      <Card className="mt-8">
        <CardContent className="p-6">
          <SubmitRepositoryForm challengeId={challenge.id} />
        </CardContent>
      </Card>
    </div>
  )
}
