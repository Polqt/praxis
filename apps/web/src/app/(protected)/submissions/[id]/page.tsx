import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { ProjectSubmission, ProjectSubmissionEvent } from '@praxis/shared'
import { formatDate, githubRepoUrl, repoName, shortSha, statusLabel } from '@/lib/praxis-format'
import { SubmissionStatusMessage } from '@/features/submissions/components/submission-status-message'
import { SubmissionTimeline } from '@/features/submissions/components/submission-timeline'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SubmissionDetailPage(props: Props) {
  const { id } = await props.params
  const [submission, events] = await Promise.all([
    serverApiFetch<ProjectSubmission>(`/submissions/${id}`),
    serverApiFetch<ProjectSubmissionEvent[]>(`/submissions/${id}/events`).catch(() => []),
  ])

  return (
    <div className="px-10 py-8 max-w-5xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-mono">
            {repoName(submission.githubRepoFullName)}
          </h1>
          <a
            className="mt-2 block text-sm text-muted-foreground hover:underline"
            href={githubRepoUrl(submission.githubRepoFullName)}
            target="_blank"
            rel="noreferrer"
          >
            {submission.githubRepoFullName}
          </a>
        </div>
        <Badge className="capitalize" variant="outline">{statusLabel(submission.status)}</Badge>
      </div>

      <div className="mt-8 grid grid-cols-[320px_1fr] gap-6">
        <div>
          <Card>
            <CardContent className="p-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Repository</span>
                <span className="font-mono font-medium truncate">{repoName(submission.githubRepoFullName)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Commit</span>
                <span className="font-mono">{shortSha(submission.commitSha)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Submitted</span>
                <span>{formatDate(submission.submittedAt)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="capitalize text-xs">{statusLabel(submission.status)}</Badge>
              </div>
            </CardContent>
          </Card>

          <SubmissionStatusMessage submission={submission} />
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-5">Verification timeline</h2>
            <SubmissionTimeline submission={submission} events={events} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
