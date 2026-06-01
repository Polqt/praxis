export class ProfileReportDto {
  id: string
  repositoryName: string
  challengeTitle: string
  challengeCategory: string
  verdict: string
  verifiedAt: string
}

export class PublicProfileDto {
  username: string
  verifiedSkills: string[]
  reportsCount: number
  verificationsCount: number
  challengesCompleted: number
  latestReports: ProfileReportDto[]
}
