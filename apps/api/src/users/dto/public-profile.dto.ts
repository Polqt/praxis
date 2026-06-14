export interface ProfileReportDto {
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

export interface VerifiedSkillDto {
  name: string
  awardedAt: string
  sourceReport: ProfileReportDto | null
}

export interface PublicProfileDto {
  username: string
  bio: string | null
  verifiedSkills: VerifiedSkillDto[]
  reportsCount: number
  verifiedProjectsCount: number
  publishedReportsCount: number
  needsImprovementCount: number
  challengesCompleted: number
  latestReports: ProfileReportDto[]
}
