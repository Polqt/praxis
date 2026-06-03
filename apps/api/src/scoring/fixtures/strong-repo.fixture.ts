import type { TestingSignals } from '../signals/testing.signals'
import type { DocumentationSignals } from '../signals/documentation.signals'
import type { DeploymentSignals } from '../signals/deployment.signals'
import type { SecuritySignals } from '../signals/security.signals'
import type { ArchitectureSignals } from '../signals/architecture.signals'

export const strongTesting: TestingSignals = {
  testFileCount: 12,
  testDirectoryCount: 3,
  hasIntegrationTests: true,
  hasE2eTests: true,
  hasCoverageConfig: true,
  testFilePaths: [
    'tests/auth.spec.ts',
    'tests/users.integration.spec.ts',
    'tests/e2e/flows.e2e.ts',
    'tests/orders.spec.ts',
    'tests/health.spec.ts',
  ],
  executionResult: null,
}

export const strongDocumentation: DocumentationSignals = {
  hasReadme: true,
  readmeWordCount: 500,
  hasSetupInstructions: true,
  hasApiDocs: true,
  hasArchitectureDocs: true,
  hasContributionDocs: true,
  detectedDocFiles: ['README.md', 'docs/api.md', 'docs/architecture.md', 'CONTRIBUTING.md', 'openapi.yaml'],
}

export const strongDeployment: DeploymentSignals = {
  hasDockerfile: true,
  hasDockerCompose: true,
  hasCiWorkflow: true,
  hasDeploymentWorkflow: true,
  hasInfrastructureConfig: true,
  detectedDeploymentFiles: [
    'Dockerfile',
    'docker-compose.yml',
    '.github/workflows/ci.yml',
    '.github/workflows/deploy.yml',
    'infra/main.tf',
  ],
}

export const strongSecurity: SecuritySignals = {
  usesEnvironmentVariables: true,
  hasValidationLibrary: true,
  hasAuthImplementation: true,
  hasSecretDetectionIssues: false,
  validationLibraryName: 'class-validator',
  authPatternPaths: ['src/auth/auth.service.ts', 'src/auth/jwt.guard.ts'],
  suspiciousFilePaths: [],
}

export const strongArchitecture: ArchitectureSignals = {
  hasFolderOrganization: true,
  hasSeparationOfConcerns: true,
  hasFeatureModules: true,
  hasTestOrganization: true,
  hasConfigOrganization: true,
  topLevelDirectories: ['src', 'tests', 'docs', 'infra', 'config'],
  featureModulePaths: ['src/users', 'src/auth', 'src/orders', 'src/notifications'],
}

export const strongRepoFixture = {
  label: 'strong',
  testing: strongTesting,
  documentation: strongDocumentation,
  deployment: strongDeployment,
  security: strongSecurity,
  architecture: strongArchitecture,
  expectedScoreRanges: {
    testing: { min: 10, max: 10 },
    documentation: { min: 10, max: 10 },
    deployment: { min: 10, max: 10 },
    security: { min: 7, max: 7 },
    architecture: { min: 10, max: 10 },
  },
}
