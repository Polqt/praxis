export interface SecuritySignals {
  usesEnvironmentVariables: boolean
  hasValidationLibrary: boolean
  hasAuthImplementation: boolean
  hasSecretDetectionIssues: boolean
  validationLibraryName: string | null
  authPatternPaths: string[]
  suspiciousFilePaths: string[]
}
