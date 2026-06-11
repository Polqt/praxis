export type ReportStatus = 'verified' | 'insufficient' | 'failed'
export type SkillTier = 'gold' | 'standard' | 'muted'

export interface ReportShareSummary {
  verdict: 'verified' | 'insufficient'
  compositeScore: number
  challengeTitle: string
  publicToken: string | null
  bestCategory?: { name: string; score: number } | null
}

export interface ExecutionEvidence {
  passed: number
  failed: number
  skipped: number
  language: string
}

export interface CommandResult {
  phase: string
  label: string
  exitCode: number
  durationMs?: number | null
  timedOut: boolean
  stdout?: string
  stderr?: string
}

export interface CommandSummary {
  phase: string
  label: string
  exitCode: number
  timedOut: boolean
}

export interface ExecutionOutput {
  language: string
  framework?: string | null
  testCommand: string
  publicSummary?: string | null
  commandSummary?: CommandSummary[]
  exitCode: number
  passed: number
  failed: number
  skipped: number
  durationMs: number | null
  stdout: string | null
  stderr: string | null
  timedOut: boolean
  installResult?: CommandResult | null
  testResult?: CommandResult | null
  buildResult?: CommandResult | null
  lintResult?: CommandResult | null
  typecheckResult?: CommandResult | null
  doctorResult?: CommandResult | null
}

export interface ScoreItem {
  category: string
  score: number
  narrative: string
  citations: string[]
  status?: 'pass' | 'fail' | 'floor'
  minimumScore?: number
  weight?: number
  executionEvidence?: ExecutionEvidence | null
  signals?: Record<string, unknown>
  confidence?: 'high' | 'medium' | 'low'
}

export interface SkillProgressItem {
  name: string
  score: number
  minimumScore: number
  pointsNeeded: number
  eligible: boolean
  awarded: boolean
  matchedSkillId: string | null
}

export interface AiReview {
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
}

export interface PreviousSubmissionDelta {
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
}

export interface Report {
  id: string
  submissionId: string
  repositoryName: string
  commitSha: string
  challengeTitle: string
  status: ReportStatus
  compositeScore: number
  summary: string
  aiFallback: boolean
  scores: ScoreItem[]
  skills: string[]
  strengths: string[]
  improvements: string[]
  derivedStrengthsAndImprovements: boolean
  allCitedFiles: string[]
  generatedAt: string
  modelVersion: string
  isPublic: boolean
  publicToken: string | null
  skillProgress: SkillProgressItem[]
  aiReview: AiReview | null
  previousSubmission: PreviousSubmissionDelta | null
}
