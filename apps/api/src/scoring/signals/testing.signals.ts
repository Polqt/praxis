export interface TestExecutionResult {
  passed: number
  failed: number
  skipped: number
  timedOut: boolean
  language: string
}

export interface TestingSignals {
  testFileCount: number
  testDirectoryCount: number
  hasIntegrationTests: boolean
  hasE2eTests: boolean
  hasCoverageConfig: boolean
  testFilePaths: string[]
  executionResult: TestExecutionResult | null
}
