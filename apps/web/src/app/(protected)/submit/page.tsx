import { redirect } from 'next/navigation'
import { serverApiFetch } from '@/lib/api.server'
import type { GitHubAccount, ProjectChallenge } from '@praxis/shared'
import { SubmitClient } from '@/features/submissions/components/submit-client'
import { hasRequiredScopes } from '@/features/github/utils'

type Props = {
  searchParams: Promise<{ challengeId?: string | string[]; repo?: string | string[]; commit?: string | string[] }>
}

export default async function SubmitPage(props: Props) {
  const searchParams = await props.searchParams
  const challengeId = typeof searchParams.challengeId === 'string' ? searchParams.challengeId : null
  const repo = typeof searchParams.repo === 'string' ? searchParams.repo : ''
  const commit = typeof searchParams.commit === 'string' ? searchParams.commit : ''

  if (!challengeId) redirect('/challenges')

  let challenge: ProjectChallenge
  let github: GitHubAccount

  try {
    ;[challenge, github] = await Promise.all([
      serverApiFetch<ProjectChallenge>(`/challenges/${challengeId}`),
      serverApiFetch<GitHubAccount>('/github/account').catch(() => ({ connected: false } as GitHubAccount)),
    ])
  } catch {
    redirect('/challenges')
  }

  const githubConnected = github.connected
  const githubHasScopes = github.connected && hasRequiredScopes(github.scopes)

  return (
    <div className="px-4 py-6 sm:px-6 md:px-10 md:py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Submit repository</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submit a real repository for independent deterministic verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SubmitClient
            challenge={challenge}
            githubConnected={githubConnected}
            githubHasScopes={githubHasScopes}
            initialRepoUrl={repo}
            initialCommitSha={commit}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">What gets evaluated</p>
            <div className="space-y-2">
              {(challenge.rubric as { categories: { name: string; weight: number }[] }).categories.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="text-sm">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.weight}%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Passing score</span>
              <span className="text-xs font-semibold tabular-nums">{challenge.passingThreshold}/100</span>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">How it works</p>
            <ol className="space-y-2">
              {['Submit a GitHub repository URL', 'Praxis ingests your code', 'Signals are extracted deterministically', 'You receive a scored report with citations'].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="shrink-0 size-4 rounded-full bg-muted text-[10px] font-medium flex items-center justify-center text-foreground mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
