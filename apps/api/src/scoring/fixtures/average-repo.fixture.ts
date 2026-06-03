import type { TestingSignals } from '../signals/testing.signals'
import type { DocumentationSignals } from '../signals/documentation.signals'
import type { DeploymentSignals } from '../signals/deployment.signals'
import type { SecuritySignals } from '../signals/security.signals'
import type { ArchitectureSignals } from '../signals/architecture.signals'

export const averageTesting: TestingSignals = {
  testFileCount: 4,
  testDirectoryCount: 1,
  hasIntegrationTests: false,
  hasE2eTests: false,
  hasCoverageConfig: false,
  testFilePaths: ['tests/auth.spec.ts', 'tests/users.spec.ts', 'tests/orders.spec.ts', 'tests/health.spec.ts'],
  executionResult: null,
}

export const averageDocumentation: DocumentationSignals = {
  hasReadme: true,
  hasSetupInstructions: true,
  hasApiDocs: false,
  hasArchitectureDocs: false,
  hasContributionDocs: false,
  detectedDocFiles: ['README.md'],
}

export const averageDeployment: DeploymentSignals = {
  hasDockerfile: true,
  hasDockerCompose: false,
  hasCiWorkflow: true,
  hasDeploymentWorkflow: false,
  hasInfrastructureConfig: false,
  detectedDeploymentFiles: ['Dockerfile', '.github/workflows/ci.yml'],
}

export const averageSecurity: SecuritySignals = {
  usesEnvironmentVariables: true,
  hasValidationLibrary: false,
  hasAuthImplementation: true,
  hasSecretDetectionIssues: false,
  validationLibraryName: null,
  authPatternPaths: ['src/auth/auth.service.ts'],
  suspiciousFilePaths: [],
}

export const averageArchitecture: ArchitectureSignals = {
  hasFolderOrganization: true,
  hasSeparationOfConcerns: true,
  hasFeatureModules: false,
  hasTestOrganization: true,
  hasConfigOrganization: false,
  topLevelDirectories: ['src', 'tests', 'docs'],
  featureModulePaths: [],
}

export const averageRepoFixture = {
  label: 'average',
  testing: averageTesting,
  documentation: averageDocumentation,
  deployment: averageDeployment,
  security: averageSecurity,
  architecture: averageArchitecture,
  expectedScoreRanges: {
    testing: { min: 6, max: 6 },
    documentation: { min: 4, max: 4 },
    deployment: { min: 5, max: 5 },
    security: { min: 5, max: 5 },
    architecture: { min: 7, max: 7 },
  },
}
