export type SubmissionStatus =
  | 'queued'
  | 'ingesting'
  | 'analyzing'
  | 'generating_report'
  | 'verified'
  | 'insufficient'
  | 'failed'

export type FilterBucket = 'all' | 'verified' | 'in_progress' | 'failed'

export interface SubmissionEvent {
  id: string
  type: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface Submission {
  id: string
  repositoryUrl: string
  repositoryName: string
  branch: string
  commitSha: string
  challengeId: string
  challengeTitle: string
  challengeCategory: string
  status: SubmissionStatus
  createdAt: string
  lastAnalyzedAt: string | null
  events: SubmissionEvent[]
}
