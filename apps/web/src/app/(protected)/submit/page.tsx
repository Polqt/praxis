import Link from 'next/link'
import { serverApiFetch } from '@/lib/api.server'
import type { GitHubAccount, ProjectChallenge } from '@praxis/shared'
import { SubmitClient } from '@/features/submissions/components/submit-client'

const REQUIRED_SCOPES = ['read:user']

type Props = {
  searchParams: Promise<{ challengeId?: string | string[] }>
}

export default async function SubmitPage(props: Props) {
  const searchParams = await props.searchParams
  const challengeId = typeof searchParams.challengeId === 'string' ? searchParams.challengeId : null

  if (!challengeId) {
    return (
      <div className="max-w-150 mx-auto px-6 py-10">
        <p className="text-sm text-muted-foreground text-center">
          Invalid challenge. Please{' '}
          <Link href="/challenges" className="underline">select a challenge first</Link>.
        </p>
      </div>
    )
  }

  let challenge: ProjectChallenge
  let github: GitHubAccount

  try {
    [challenge, github] = await Promise.all([
      serverApiFetch<ProjectChallenge>(`/challenges/${challengeId}`),
      serverApiFetch<GitHubAccount>('/github/account').catch(() => ({ connected: false } as GitHubAccount)),
    ])
  } catch {
    return (
      <div className="max-w-150 mx-auto px-6 py-10">
        <p className="text-sm text-muted-foreground text-center">
          Invalid challenge. Please{' '}
          <Link href="/challenges" className="underline">select a challenge first</Link>.
        </p>
      </div>
    )
  }

  const githubReady = github.connected && REQUIRED_SCOPES.every((scope) => (github as Extract<GitHubAccount, { connected: true }>).scopes.includes(scope))

  return (
    <div className="max-w-150 mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Submit repository</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Submit a GitHub repository for independent verification.
      </p>

      <div className="mt-8">
        <SubmitClient challenge={challenge} githubReady={githubReady} />
      </div>
    </div>
  )
}
