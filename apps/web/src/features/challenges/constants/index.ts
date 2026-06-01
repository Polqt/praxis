import type { ChallengeDifficulty } from '@/features/challenges/types'

export const DIFFICULTY_BADGE_CLASS: Record<ChallengeDifficulty, string> = {
  junior: 'bg-muted text-muted-foreground border-border',
  intermediate: 'bg-secondary text-secondary-foreground border-border',
  senior: 'bg-muted text-foreground border-border',
}

export const DIFFICULTY_LABEL: Record<ChallengeDifficulty, string> = {
  junior: 'Junior',
  intermediate: 'Intermediate',
  senior: 'Senior',
}
