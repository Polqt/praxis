import type { ProjectSubmission, SourceType } from './submission.types'

export interface User {
  id: string
  supabaseUid: string
  email: string
  username: string | null
  usernameUpdatedAt?: string | null
  createdAt: string
}

export interface Skill {
  id: string
  trackId: string
  name: string
  category: string
  createdAt: string
}

export interface UserSkill {
  id: string
  userId: string
  skill: Skill
  sourceType: SourceType
  awardedAt: string
}

export interface DashboardStats {
  totalVerified: number
  totalAttempts: number
  verifiedSkills: UserSkill[]
  recentSubmissions: ProjectSubmission[]
}
