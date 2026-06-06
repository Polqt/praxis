import type {
  Challenge,
  ChallengeDifficulty,
} from '@/features/challenges/types'
import type { ProjectChallenge } from '@praxis/shared'

const DIFFICULTY_MAP: Record<string, ChallengeDifficulty> = {
  beginner: 'junior',
  intermediate: 'intermediate',
  advanced: 'senior',
}

export function toChallenge(raw: ProjectChallenge): Challenge {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.projectType === 'frontend' ? 'frontend' : 'backend',
    difficulty: DIFFICULTY_MAP[raw.difficulty] ?? 'intermediate',
    skills: raw.rubric.categories.map((category) => category.name),
  }
}
