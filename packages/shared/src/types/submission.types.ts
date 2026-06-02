export type SubmissionStatus =
  | 'created'
  | 'queued'
  | 'ingesting'
  | 'ingestion_failed'
  | 'analyzing'
  | 'analysis_failed'
  | 'generating_report'
  | 'report_generation_failed'
  | 'verified'
  | 'insufficient'
  | 'failed'
  | 'expired'

export type ProjectType = 'backend'

export type Verdict = 'verified' | 'insufficient' | 'failed'

export type SourceType = 'project'

export interface Track {
  id: string
  slug: string
  name: string
  description: string
  createdAt: string
}

export interface RubricCategory {
  name: string
  weight: number
  floor: number
  score?: number
  narrative?: string
  citations?: string[]
}

export interface ProjectChallenge {
  id: string
  trackId: string
  title: string
  description: string
  projectType: ProjectType
  rubric: { categories: RubricCategory[] }
  passingThreshold: number
  version: number
  isActive: boolean
  createdAt: string
}

export interface ProjectSubmission {
  id: string
  userId: string
  challengeId: string
  githubRepoFullName: string
  githubRepoId: number
  commitSha: string
  status: SubmissionStatus
  submittedAt: string
  ingestedAt: string | null
  analyzedAt: string | null
  completedAt: string | null
  attempts: number
  failureReason: string | null
  rubricVersion: number
}

export interface ProjectSubmissionEvent {
  id: string
  submissionId: string
  fromStatus: SubmissionStatus | null
  toStatus: SubmissionStatus
  reason: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface VerificationReport {
  id: string
  submissionId: string
  repositoryName: string
  compositeScore: number
  verdict: Verdict
  categoryScores: Record<string, { score: number; narrative: string; citations: string[]; status?: string; minimumScore?: number }>
  publicSummary: string | null
  strengths: string[]
  improvements: string[]
  analyzerVersion: string
  scoringVersion: string
  reportGeneratorVersion: string | null
  rubricVersion: number | null
  generatedAt: string
  isPublic: boolean
  publicToken: string | null
}
