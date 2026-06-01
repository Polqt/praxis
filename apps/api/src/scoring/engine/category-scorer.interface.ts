export type CategoryStatus = 'pass' | 'fail' | 'floor'

export interface CategoryScore {
  score: number
  narrative: string
  citations: string[]
  status: CategoryStatus
  signals: Record<string, unknown>
}

export interface CategoryScorer<TSignals> {
  score(signals: TSignals): CategoryScore
}
