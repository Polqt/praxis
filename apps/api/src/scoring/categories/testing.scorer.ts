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
    const exec = signals.executionResult

    // When execution result is available, use real pass/fail as primary signal
    if (exec && !exec.timedOut) {
      const total = exec.passed + exec.failed + exec.skipped
      const isFloor = total === 0 && signals.testFileCount === 0

      let execScore: number
      if (total === 0) {
        execScore = baseScoreFromCount(signals.testFileCount)
      } else if (exec.failed === 0) {
        execScore = exec.passed >= 10 ? 10 : exec.passed >= 5 ? 9 : 8
      } else {
        const passRate = exec.passed / (exec.passed + exec.failed)
        execScore = Math.round(passRate * 8)
      }

      const coverageBonus = signals.hasCoverageConfig ? 1 : 0
      const finalScore = Math.min(10, execScore + coverageBonus)
      const status = isFloor ? 'floor' : finalScore >= 5 ? 'pass' : 'fail'

      return {
        score: finalScore,
        narrative: buildTestingNarrative(signals),
        citations: signals.testFilePaths,
        status,
        signals: {
          testFileCount: signals.testFileCount,
          hasIntegrationTests: signals.hasIntegrationTests,
          hasE2eTests: signals.hasE2eTests,
          hasCoverageConfig: signals.hasCoverageConfig,
          execution: { passed: exec.passed, failed: exec.failed, skipped: exec.skipped, language: exec.language },
        },
      }
    }

    // Fallback: deterministic file-detection scoring
    const isFloor = FLOOR_CONDITION(signals)
    const baseScore = baseScoreFromCount(signals.testFileCount)
    const integrationBonus = signals.hasIntegrationTests ? 1 : 0
    const e2eBonus = signals.hasE2eTests ? 1 : 0
    const coverageBonus = signals.hasCoverageConfig ? 1 : 0
    const finalScore = Math.min(10, baseScore + integrationBonus + e2eBonus + coverageBonus)
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
        execution: null,
      },
    }
  }
}
