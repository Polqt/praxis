export type ChallengeCategory = 'frontend' | 'backend'

export type ChallengeDifficulty = 'junior' | 'intermediate' | 'senior'

export interface Challenge {
  id: string
  slug: string
  title: string
  description: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  skills: string[]
}
