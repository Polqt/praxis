import Link from 'next/link'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ProjectSubmission, ProjectSubmissionEvent } from '@praxis/shared'
import { eventLabel, formatDate, githubRepoUrl, isTerminalSubmission, repoName, shortSha, statusLabel } from '@/lib/praxis-format'

type SubmissionTimelinePageProps = {
  params: Promise<{ id: string }>
}

export default async function SubmissionTimelinePage(props: SubmissionTimelinePageProps) {
  const { id } = await props.params
  const [submission, events] = await Promise.all([
    serverApiFetch<ProjectSubmission>(`/submissions/${id}`),
    serverApiFetch<ProjectSubmissionEvent[]>(`/submissions/${id}/events`).catch(() => []),
  ])

  return (
    <div className="px-10 py-8 max-w-5xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{repoName(submission.githubRepoFullName)}</h1>
          <a className="mt-2 block text-sm text-muted-foreground hover:underline" href={githubRepoUrl(submission.githubRepoFullName)} target="_blank">
            {submission.githubRepoFullName}
          </a>
        </div>
        <Badge className="capitalize" variant="outline">{statusLabel(submission.status)}</Badge>
      </div>

      <div className="mt-8 grid grid-cols-[320px_1fr] gap-6">
        <Card>
          <CardContent className="p-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Commit</span><span className="font-mono">{shortSha(submission.commitSha)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Submitted</span><span>{formatDate(submission.submittedAt)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Attempts</span><span>{submission.attempts}</span></div>
            {submission.failureReason && <p className="text-destructive text-xs">{submission.failureReason}</p>}
            {isTerminalSubmission(submission) && (
              <Button className="w-full mt-4" asChild>
                <Link href={`/reports/${submission.id}`}>View report</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold">Verification timeline</h2>
            <div className="mt-5 space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border-l pl-4">
                  <p className="text-sm font-medium capitalize">{eventLabel(event)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
                </div>
              ))}
              {events.length === 0 && <p className="text-sm text-muted-foreground">No events yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
