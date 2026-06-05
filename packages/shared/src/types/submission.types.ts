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
  | 'cancelled'

export type ProjectType = 'backend' | 'frontend'

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

export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface ProjectChallenge {
  id: string
  trackId: string
  title: string
  description: string
  projectType: ProjectType
  difficulty: ChallengeDifficulty
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
  viewedAt: string | null
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
  githubRepoFullName?: string
  commitSha: string
  challengeTitle: string
  compositeScore: number
  verdict: Verdict
  categoryScores: Record<string, { score: number; narrative: string; citations: string[]; status?: string; minimumScore?: number; signals?: Record<string, unknown> }>
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
  viewCount?: number
  skillProgress?: {
    name: string
    score: number
    minimumScore: number
    pointsNeeded: number
    eligible: boolean
    awarded: boolean
    matchedSkillId: string | null
  }[]
  aiReview?: {
    status: string
    model: string
    promptVersion: string
    possibleMissedEvidence: {
      category: string
      path: string
      reason: string
      confidence: number
    }[]
    inputTokens: number
    outputTokens: number
    estimatedCostUsd: string | null
    latencyMs: number | null
    errorMessage: string | null
    createdAt: string
  } | null
  previousSubmission?: {
    previousSubmissionId: string
    previousCommitSha: string
    currentCommitSha: string
    previousCompositeScore: number
    currentCompositeScore: number
    compositeDelta: number
    categories: {
      category: string
      previousScore: number
      currentScore: number
      delta: number
    }[]
    changedFiles: {
      path: string
      status: 'added' | 'removed' | 'changed'
    }[]
  } | null
}
