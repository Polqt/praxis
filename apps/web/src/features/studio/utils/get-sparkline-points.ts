import {
  SCORE_CHART_HEIGHT,
  SCORE_CHART_WIDTH,
} from '@/features/studio/constants'

export function getSparklinePoints(scores: number[]): string {
  const minimum = Math.min(...scores)
  const maximum = Math.max(...scores)
  const range = maximum - minimum || 1

  return scores
    .map((score, index) => {
      const x = (index / (scores.length - 1)) * SCORE_CHART_WIDTH
      const y =
        SCORE_CHART_HEIGHT -
        ((score - minimum) / range) * (SCORE_CHART_HEIGHT - 4) -
        2
      return `${x},${y}`
    })
    .join(' ')
}
