export const SCORE_HIGH_THRESHOLD = 8
export const SCORE_MID_THRESHOLD = 6

/** Returns the Tailwind background class for a 0–10 score bar. */
export function scoreBarColor(score: number): string {
  if (score >= SCORE_HIGH_THRESHOLD) return 'bg-green-500'
  if (score >= SCORE_MID_THRESHOLD) return 'bg-amber-500'
  return 'bg-red-500'
}
