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
}

export interface PublicProfile {
  username: string
  verifiedSkills: VerifiedSkill[]
  reportsCount: number
  verificationsCount: number
  challengesCompleted: number
  latestReports: ProfileReport[]
}
