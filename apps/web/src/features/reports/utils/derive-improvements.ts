import type { ScoreItem } from '@/features/reports/types'
import { SCORE_MID_THRESHOLD } from '@/features/reports/constants'

// Scores <= threshold need improvement; return bottom 4 by score ascending
export function deriveImprovements(scores: ScoreItem[]): string[] {
  return scores
    .filter((s) => s.score <= SCORE_MID_THRESHOLD || s.status === 'floor')
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((s) => `Improve coverage in ${s.category}`)
}
