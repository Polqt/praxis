export interface ProfileReport {
  id: string
  submissionId: string
  repositoryName: string
  challengeTitle: string
  challengeCategory: string
  verdict: string
  submissionStatus: string
  verifiedAt: string
  publicToken: string | null
  compositeScore: number | null
}

export interface VerifiedSkill {
  name: string
  awardedAt: string
  sourceReport: ProfileReport | null
}

export interface PublicProfile {
  username: string
  bio: string | null
  verifiedSkills: VerifiedSkill[]
  reportsCount: number
  verifiedProjectsCount?: number
  publishedReportsCount?: number
  needsImprovementCount?: number
  challengesCompleted: number
  latestReports: ProfileReport[]
}

export type LeaderboardPeriod = 'all' | 'month' | 'week'
