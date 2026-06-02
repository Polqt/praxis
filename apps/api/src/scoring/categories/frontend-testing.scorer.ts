import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { FrontendTestingSignals } from '../signals/frontend-testing.signals'

export class FrontendTestingScorer implements CategoryScorer<FrontendTestingSignals> {
  score(signals: FrontendTestingSignals): CategoryScore {
    if (signals.testFileCount === 0) {
      return {
        score: 0,
        narrative: 'No test files detected. Frontend testing evidence is required.',
        citations: [],
        status: 'floor',
        signals: { testFileCount: 0 },
      }
    }

    const base = signals.testFileCount <= 2 ? 3 : signals.testFileCount <= 5 ? 6 : 8
    let s = base
    if (signals.hasComponentTests) s += 1
    if (signals.hasE2eTests) s += 1
    if (signals.hasCoverageConfig) s += 1
    const score = Math.min(10, s)

    const parts = [`Detected ${signals.testFileCount} test file(s).`]
    if (signals.hasComponentTests) parts.push('Component tests present.')
    if (signals.hasE2eTests) parts.push('End-to-end tests detected.')
    if (signals.hasCoverageConfig) parts.push('Coverage configuration present.')

    return {
      score,
      narrative: parts.join(' '),
      citations: signals.testFilePaths,
      status: score >= 5 ? 'pass' : 'fail',
      signals: { testFileCount: signals.testFileCount, hasComponentTests: signals.hasComponentTests },
    }
  }
}
