import Link from 'next/link'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { GitHubAccount, ProjectChallenge, ProjectSubmission, User } from '@praxis/shared'
import { formatDate, repoName, statusLabel } from '@/lib/praxis-format'

export default async function StudioPage() {
  const [user, githubAccount, challenges, submissions] = await Promise.all([
    serverApiFetch<User>('/users/me'),
    serverApiFetch<GitHubAccount>('/github/account').catch(() => null),
    serverApiFetch<ProjectChallenge[]>('/challenges').catch(() => []),
    serverApiFetch<ProjectSubmission[]>('/submissions').catch(() => []),
  ])

  const challenge = challenges[0]
  const latest = submissions[0]
  const githubUsername = githubAccount && 'githubUsername' in githubAccount
    ? githubAccount.githubUsername
    : null

  return (
    <div className="px-10 py-8 max-w-6xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Studio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Verify a real backend repository and publish proof of work.
          </p>
        </div>
        <Badge variant={githubUsername ? 'default' : 'outline'}>
          {githubUsername ? `GitHub: ${githubUsername}` : 'GitHub not connected'}
        </Badge>
      </div>

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 mt-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Backend Engineering</p>
            <h2 className="mt-3 text-xl font-semibold">{challenge?.title ?? 'Build a Production REST API'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Submit any production-style backend repository: inventory API, booking API, CRM backend, auth service, or similar.
            </p>
            <div className="mt-5 flex gap-3">
              {challenge && (
                <>
                  <Button asChild>
                    <Link href={`/studio/challenges/${challenge.id}`}>Open standard</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/studio/submit?challengeId=${challenge.id}`}>Submit repository</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Latest submission</p>
            {latest ? (
              <div className="mt-3">
                <p className="font-medium">{repoName(latest.githubRepoFullName)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(latest.submittedAt)}</p>
                <Badge className="mt-4 capitalize" variant="outline">{statusLabel(latest.status)}</Badge>
                <div className="mt-5">
                  <Button variant="outline" asChild>
                    <Link href={`/studio/submissions/${latest.id}`}>View timeline</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No repository submitted yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
