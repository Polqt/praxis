import type { ScoreItem } from '@/features/reports/types'
import { SCORE_HIGH_THRESHOLD } from '@/features/reports/constants'

// Scores >= threshold are considered strong results; return top 4 by score descending
export function deriveStrengths(scores: ScoreItem[]): string[] {
  return scores
    .filter((s) => s.score >= SCORE_HIGH_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => `Strong result in ${s.category}`)
}
