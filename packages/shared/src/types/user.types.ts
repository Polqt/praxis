import type { TaskWithStatus } from './task.types'

export interface User {
  id: string
  supabaseUid: string
  email: string
  username: string | null
  createdAt: string
}

export interface Skill {
  id: string
  name: string
  category: string
}

export interface UserSkill {
  id: string
  userId: string
  skill: Skill
  verifiedAt: string
}

export interface DashboardStats {
  totalVerified: number
  totalAttempts: number
  verifiedSkills: UserSkill[]
  recentTasks: TaskWithStatus[]
}
