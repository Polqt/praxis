import type { TestExecutionResult } from './testing.signals'

export interface FrontendTestingSignals {
  testFileCount: number
  hasComponentTests: boolean
  hasE2eTests: boolean
  hasCoverageConfig: boolean
  testFilePaths: string[]
  executionResult: TestExecutionResult | null
}
