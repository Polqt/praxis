export interface ProfileReport {
  id: string
  submissionId: string
  repositoryName: string
  challengeTitle: string
  challengeCategory: string
  verdict: string
  verifiedAt: string
}

export interface PublicProfile {
  username: string
  verifiedSkills: string[]
  reportsCount: number
  verificationsCount: number
  challengesCompleted: number
  latestReports: ProfileReport[]
}
