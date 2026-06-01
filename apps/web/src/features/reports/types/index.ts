export type ReportStatus = 'verified' | 'insufficient' | 'failed'

export interface ScoreItem {
  category: string
  score: number
}

export interface EvidenceItem {
  label: string
  files: string[]
}

export interface Report {
  id: string
  submissionId: string
  repositoryUrl: string
  repositoryName: string
  commitSha: string
  challengeId: string
  challengeTitle: string
  status: ReportStatus
  summary: string
  scores: ScoreItem[]
  skills: string[]
  evidence: EvidenceItem[]
  strengths: string[]
  improvements: string[]
  generatedAt: string
  modelVersion: string
}
