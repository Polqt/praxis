import type { ChallengeDifficulty } from '@/features/challenges/types'

export const DIFFICULTY_CLASS: Record<ChallengeDifficulty, string> = {
  junior: 'bg-muted text-muted-foreground border-border',
  intermediate: 'bg-secondary text-secondary-foreground border-border',
  senior: 'bg-muted text-foreground border-border',
}

export const DIFFICULTY_LABEL: Record<ChallengeDifficulty, string> = {
  junior: 'Junior',
  intermediate: 'Intermediate',
  senior: 'Senior',
}

export const MARQUEE_TEXT =
  'REAL PROJECTS · VERIFIED SKILLS · PROOF OF WORK · NO RESUMES · REAL PROJECTS · VERIFIED SKILLS · PROOF OF WORK · NO RESUMES · '

export const MARQUEE_DURATION_S = 28

export const TERMINAL_MOCKUP = {
  project: 'acme-corp/inventory-api',
  author: 'verified',
  commits: '142 over 8 months',
  tests: 'present',
  deploy: 'confirmed',
  aiGen: 'none detected',
  result: 'VERIFIED',
} as const
