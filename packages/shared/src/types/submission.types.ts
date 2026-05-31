export type SubmissionStatus =
  | 'created'
  | 'queued'
  | 'ingesting'
  | 'ingestion_failed'
  | 'analyzing'
  | 'analysis_failed'
  | 'generating_report'
  | 'report_generation_failed'
  | 'awaiting_human_review'
  | 'verified'
  | 'insufficient'
  | 'failed'
  | 'expired'

export type ProjectType = 'frontend' | 'backend' | 'fullstack'

export type Verdict = 'verified' | 'conditional' | 'insufficient' | 'failed'

export type SourceType = 'project' | 'task'

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
  // ingestedData is intentionally omitted — never exposed to the frontend
}

export interface VerificationReport {
  id: string
  submissionId: string
  compositeScore: number
  verdict: Verdict
  categoryScores: Record<string, { score: number; narrative: string; citations: string[] }>
  publicSummary: string | null
  aiModelVersion: string
  generatedAt: string
  isPublic: boolean
  publicToken: string | null
}
