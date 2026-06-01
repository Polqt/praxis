export class ProfileReportDto {
  id: string
  submissionId: string
  repositoryName: string
  challengeTitle: string
  challengeCategory: string
  verdict: string
  verifiedAt: string
  publicToken: string | null
  compositeScore: number | null
}

export class PublicProfileDto {
  username: string
  verifiedSkills: string[]
  reportsCount: number
  verificationsCount: number
  challengesCompleted: number
  latestReports: ProfileReportDto[]
}
