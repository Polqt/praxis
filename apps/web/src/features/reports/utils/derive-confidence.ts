import type { ScoreItem } from '../types'

export function deriveConfidence(score: Pick<ScoreItem, 'citations' | 'signals'>): ScoreItem['confidence'] {
  const citations = score.citations.length
  const signalValues = Object.values(score.signals ?? {})
  const strongSignals = signalValues.filter((value) => value === true || (typeof value === 'number' && value > 0)).length

  if (citations >= 3 || (citations >= 2 && strongSignals >= 2)) return 'high'
  if (citations >= 1 || strongSignals >= 1) return 'medium'
  return 'low'
}
