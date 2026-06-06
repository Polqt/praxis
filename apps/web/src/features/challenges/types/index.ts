export type ChallengeCategory = 'frontend' | 'backend'

export type ChallengeDifficulty = 'junior' | 'intermediate' | 'senior'
export type ChallengeSubmissionStatus = 'verified' | 'in-progress' | 'attempted'

export interface Challenge {
  id: string
  title: string
  description: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  skills: string[]
}
