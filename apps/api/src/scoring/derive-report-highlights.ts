const STRENGTH_THRESHOLD = 8
const IMPROVEMENT_THRESHOLD = 6

export function deriveStrengths(scores: Record<string, { score: number }>): string[] {
  return Object.entries(scores)
    .filter(([, v]) => v.score >= STRENGTH_THRESHOLD)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 4)
    .map(([name]) => `Strong result in ${name}`)
}

export function deriveImprovements(scores: Record<string, { score: number }>): string[] {
  return Object.entries(scores)
    .filter(([, v]) => v.score <= IMPROVEMENT_THRESHOLD)
    .sort(([, a], [, b]) => a.score - b.score)
    .slice(0, 4)
    .map(([name]) => `Improve coverage in ${name}`)
}
