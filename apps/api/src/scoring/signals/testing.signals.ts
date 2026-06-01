export interface TestingSignals {
  testFileCount: number
  testDirectoryCount: number
  hasIntegrationTests: boolean
  hasE2eTests: boolean
  hasCoverageConfig: boolean
  testFilePaths: string[]
}
