import Link from 'next/link'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ProjectSubmission } from '@praxis/shared'
import { formatDate, repoName, statusLabel } from '@/lib/praxis-format'

export default async function StudioSubmissionsPage() {
  const submissions = await serverApiFetch<ProjectSubmission[]>('/submissions').catch(() => [])

  return (
    <div className="px-10 py-8 max-w-5xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Submissions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track every repository submitted for Praxis verification.
          </p>
        </div>
        <Button asChild>
          <Link href="/challenges">Submit Repository</Link>
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardContent className="p-5 flex items-center justify-between gap-6">
              <div className="min-w-0">
                <p className="font-medium truncate">{repoName(submission.githubRepoFullName)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {submission.githubRepoFullName} • {formatDate(submission.submittedAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant="outline">{statusLabel(submission.status)}</Badge>
                <Button variant="outline" asChild>
                  <Link href={`/submissions/${submission.id}`}>View Submission</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {submissions.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No submissions yet. Choose the Backend Engineering standard and submit a repository.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
