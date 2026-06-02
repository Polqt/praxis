export type ReportStatus = 'verified' | 'insufficient' | 'failed'

export interface ScoreItem {
  category: string
  score: number
  narrative: string
  citations: string[]
  status?: 'pass' | 'fail' | 'floor'
  minimumScore?: number
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
}
