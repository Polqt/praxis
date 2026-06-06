import type { ScoreItem, SkillTier } from '@/features/reports/types'

export function getSkillTier(
  skillName: string,
  scores: ScoreItem[],
): SkillTier {
  const matchingScore = scores.find(
    (score) => score.category.toLowerCase() === skillName.toLowerCase(),
  )

  if (!matchingScore) return 'standard'
  if (matchingScore.score >= 8) return 'gold'
  if (matchingScore.score >= 6) return 'standard'
  return 'muted'
}
