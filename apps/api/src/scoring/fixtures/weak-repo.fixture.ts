import type { TestingSignals } from '../signals/testing.signals'
import type { DocumentationSignals } from '../signals/documentation.signals'
import type { DeploymentSignals } from '../signals/deployment.signals'
import type { SecuritySignals } from '../signals/security.signals'
import type { ArchitectureSignals } from '../signals/architecture.signals'

export const weakTesting: TestingSignals = {
  testFileCount: 1,
  testDirectoryCount: 0,
  hasIntegrationTests: false,
  hasE2eTests: false,
  hasCoverageConfig: false,
  testFilePaths: ['app.test.ts'],
  executionResult: null,
}

export const weakDocumentation: DocumentationSignals = {
  hasReadme: true,
  readmeWordCount: 10,
  hasSetupInstructions: false,
  hasApiDocs: false,
  hasArchitectureDocs: false,
  hasContributionDocs: false,
  detectedDocFiles: ['README.md'],
}

export const weakDeployment: DeploymentSignals = {
  hasDockerfile: false,
  hasDockerCompose: false,
  hasCiWorkflow: false,
  hasDeploymentWorkflow: false,
  hasInfrastructureConfig: false,
  detectedDeploymentFiles: [],
}

export const weakSecurity: SecuritySignals = {
  usesEnvironmentVariables: false,
  hasValidationLibrary: false,
  hasAuthImplementation: false,
  hasSecretDetectionIssues: false,
  validationLibraryName: null,
  authPatternPaths: [],
  suspiciousFilePaths: [],
}

export const weakArchitecture: ArchitectureSignals = {
  hasFolderOrganization: false,
  hasSeparationOfConcerns: false,
  hasFeatureModules: false,
  hasTestOrganization: false,
  hasConfigOrganization: false,
  topLevelDirectories: ['src'],
  featureModulePaths: [],
}

export const weakRepoFixture = {
  label: 'weak',
  testing: weakTesting,
  documentation: weakDocumentation,
  deployment: weakDeployment,
  security: weakSecurity,
  architecture: weakArchitecture,
  expectedScoreRanges: {
    testing: { min: 3, max: 3 },
    documentation: { min: 2, max: 2 },
    deployment: { min: 0, max: 0 },
    security: { min: 0, max: 0 },
    architecture: { min: 0, max: 0 },
  },
}
