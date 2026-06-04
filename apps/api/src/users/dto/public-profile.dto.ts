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

export class VerifiedSkillDto {
  name: string
  awardedAt: string
}

export class PublicProfileDto {
  username: string
  bio: string | null
  verifiedSkills: VerifiedSkillDto[]
  reportsCount: number
  challengesCompleted: number
  latestReports: ProfileReportDto[]
}
