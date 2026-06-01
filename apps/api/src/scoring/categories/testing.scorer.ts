import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { TestingSignals } from '../signals/testing.signals'
import { buildTestingNarrative } from '../narratives/narrative-builder'

const FLOOR_CONDITION = (s: TestingSignals) => s.testFileCount === 0

function baseScoreFromCount(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 3
  if (count <= 5) return 6
  return 8
}

export class TestingScorer implements CategoryScorer<TestingSignals> {
  score(signals: TestingSignals): CategoryScore {
    const isFloor = FLOOR_CONDITION(signals)

    const baseScore = baseScoreFromCount(signals.testFileCount)
    const integrationBonus = signals.hasIntegrationTests ? 1 : 0
    const e2eBonus = signals.hasE2eTests ? 1 : 0
    const coverageBonus = signals.hasCoverageConfig ? 1 : 0
    const totalBonus = integrationBonus + e2eBonus + coverageBonus

    const rawScore = baseScore + totalBonus
    const finalScore = Math.min(10, rawScore)

    const status = isFloor ? 'floor' : finalScore >= 5 ? 'pass' : 'fail'

    return {
      score: finalScore,
      narrative: buildTestingNarrative(signals),
      citations: signals.testFilePaths,
      status,
      signals: {
        testFileCount: signals.testFileCount,
        testDirectoryCount: signals.testDirectoryCount,
        hasIntegrationTests: signals.hasIntegrationTests,
        hasE2eTests: signals.hasE2eTests,
        hasCoverageConfig: signals.hasCoverageConfig,
      },
    }
  }
}
