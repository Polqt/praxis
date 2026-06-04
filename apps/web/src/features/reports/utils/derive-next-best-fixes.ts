import type { ScoreItem } from '../types'

const CATEGORY_FIXES: Record<string, string> = {
  Testing: 'Add backend tests that exercise real routes or service logic.',
  'Database Design': 'Add clear model, schema, migration, or relationship evidence.',
  Deployment: 'Add deployment evidence such as Docker, CI, or production config.',
  Authentication: 'Add protected routes, token/session handling, or auth middleware evidence.',
  'API Design': 'Add request validation, route organization, and API boundary evidence.',
  Documentation: 'Add a README with setup, environment, API, and deployment notes.',
}

export function deriveNextBestFixes(scores: ScoreItem[], limit = 3): string[] {
  return [...scores]
    .filter((score) => score.status === 'floor' || score.score < (score.minimumScore ?? 0) || score.score <= 5)
    .sort((a, b) => {
      const aGap = Math.max((a.minimumScore ?? 0) - a.score, 0)
      const bGap = Math.max((b.minimumScore ?? 0) - b.score, 0)
      if (aGap !== bGap) return bGap - aGap
      return a.score - b.score
    })
    .slice(0, limit)
    .map((score) => CATEGORY_FIXES[score.category] ?? `Improve evidence for ${score.category}.`)
}
