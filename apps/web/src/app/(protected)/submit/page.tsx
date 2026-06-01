import { redirect } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import { Card, CardContent } from '@/components/ui/card'
import type { GitHubAccount, ProjectChallenge } from '@praxis/shared'
import { SubmitRepositoryForm } from '@/features/studio/components/submit-repository-form'
import { ConnectGitHubButton } from '@/features/github/components/connect-github-button'
import { REQUIRED_SCOPES } from '@/features/github/constants/github.constants'

type SubmitRepositoryPageProps = {
  searchParams: Promise<{ challengeId?: string | string[] }>
}

export default async function SubmitRepositoryPage(props: SubmitRepositoryPageProps) {
  const searchParams = await props.searchParams
  const challengeId = typeof searchParams.challengeId === 'string' ? searchParams.challengeId : null
  if (!challengeId) redirect('/challenges')

  const [challenge, github] = await Promise.all([
    serverApiFetch<ProjectChallenge>(`/challenges/${challengeId}`),
    serverApiFetch<GitHubAccount>('/github/account').catch(() => ({ connected: false } as GitHubAccount)),
  ])
  const githubReady = github.connected && REQUIRED_SCOPES.every((scope) => github.scopes.includes(scope))

  return (
    <div className="px-10 py-8 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Submit repository</h1>
      <p className="mt-2 text-sm text-muted-foreground">{challenge.title}</p>

      <Card className="mt-8">
        <CardContent className="p-6">
          {githubReady ? (
            <SubmitRepositoryForm challengeId={challenge.id} />
          ) : (
            <div>
              <h2 className="font-semibold">
                {github.connected ? 'Reconnect GitHub to continue' : 'Connect GitHub to continue'}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Praxis needs repository read access before it can verify this challenge.
              </p>
              <div className="mt-5">
                <ConnectGitHubButton
                  nextPath={`/submit?challengeId=${challenge.id}`}
                  label={github.connected ? 'Reconnect GitHub' : 'Connect GitHub'}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
