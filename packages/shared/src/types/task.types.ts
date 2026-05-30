export type Language = 'python'

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'FAILED'

export interface Task {
  id: string
  title: string
  description: string
  language: Language
  difficulty: Difficulty
  starterCode: string
  skillTags: string[]
  createdAt: string
}

export interface TaskWithStatus extends Task {
  status: TaskStatus
  latestCode: string | null
  attempts: number
  feedback: string | null
  verifiedAt: string | null
}
