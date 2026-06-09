import type {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeSubmissionStatus,
} from '@/features/challenges/types'

export const DIFFICULTY_CLASS: Record<ChallengeDifficulty, string> = {
  junior: 'bg-muted text-muted-foreground border-border',
  intermediate: 'bg-secondary text-secondary-foreground border-border',
  senior: 'bg-muted text-foreground border-border',
}

export const DIFFICULTY_LABEL: Record<ChallengeDifficulty, string> = {
  junior: 'Beginner',
  intermediate: 'Intermediate',
  senior: 'Advanced',
}

export const CHALLENGE_DIFFICULTIES: Array<ChallengeDifficulty | 'all'> = [
  'all',
  'junior',
  'intermediate',
  'senior',
]

export const CHALLENGE_CATEGORIES: ChallengeCategory[] = ['frontend', 'backend']
export const CHALLENGE_META_BADGE_CLASS =
  'rounded-sm border-border bg-background px-2 text-xs font-medium text-foreground'

export const CHALLENGE_STATUS_BADGE: Record<
  ChallengeSubmissionStatus,
  { label: string; className: string }
> = {
  verified: {
    label: 'Verified',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  'in-progress': {
    label: 'In progress',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  attempted: {
    label: 'Attempted',
    className: 'bg-muted text-muted-foreground border-border',
  },
}
