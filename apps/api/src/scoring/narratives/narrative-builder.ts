import type { TestingSignals } from '../signals/testing.signals'
import type { DocumentationSignals } from '../signals/documentation.signals'
import type { DeploymentSignals } from '../signals/deployment.signals'
import type { SecuritySignals } from '../signals/security.signals'
import type { ArchitectureSignals } from '../signals/architecture.signals'
import type { AuthenticationSignals } from '../signals/authentication.signals'
import type { DatabaseSignals } from '../signals/database.signals'

export function buildTestingNarrative(s: TestingSignals): string {
  const exec = s.executionResult

  if (exec && !exec.timedOut) {
    const total = exec.passed + exec.failed + exec.skipped
    if (total > 0) {
      const langLabel = exec.language === 'javascript' ? 'JS' : exec.language
      const passRate = exec.failed === 0
        ? 'all passing'
        : `${exec.passed} passed, ${exec.failed} failed`
      const coverageClause = s.hasCoverageConfig ? ' Coverage configuration is present.' : ''
      return `${langLabel} test suite executed: ${total} test${total === 1 ? '' : 's'} found, ${passRate}.${coverageClause}`
    }
  }

  if (exec?.timedOut) {
    return `Test suite timed out during sandbox execution. Scoring based on ${s.testFileCount} detected test file${s.testFileCount === 1 ? '' : 's'}.`
  }

  if (s.testFileCount === 0) {
    return 'No test files were found. Testing evidence is required for verification.'
  }

  const examples = s.testFilePaths.slice(0, 2)
  const exampleClause = examples.length > 0 ? ` including ${examples.join(' and ')}` : ''

  const suiteTypes: string[] = []
  if (s.hasIntegrationTests) suiteTypes.push('integration')
  if (s.hasE2eTests) suiteTypes.push('end-to-end')

  const suiteClause = suiteTypes.length > 0 ? ` across unit and ${suiteTypes.join(' and ')} suites` : ''
  const noSuiteClause = !s.hasIntegrationTests && !s.hasE2eTests ? ' No integration or end-to-end test suites were found.' : ''
  const coverageClause = s.hasCoverageConfig ? ' Coverage configuration is present.' : ''

  return `Detected ${s.testFileCount} test file${s.testFileCount === 1 ? '' : 's'}${suiteClause}${exampleClause}.${noSuiteClause}${coverageClause}`
}

export function buildDocumentationNarrative(s: DocumentationSignals): string {
  if (!s.hasReadme) {
    return 'No README file was found in this repository. A README is the baseline documentation signal and is required for any documentation score.'
  }

  const depthNote = s.readmeWordCount >= 150
    ? 'The README is substantial and contains meaningful content.'
    : s.readmeWordCount >= 30
    ? 'The README exists but is brief — consider expanding it with more detail.'
    : 'The README exists but appears nearly empty.'

  const extras: string[] = []
  if (s.hasSetupInstructions) extras.push('setup instructions')
  if (s.hasApiDocs) extras.push('API documentation')
  if (s.hasArchitectureDocs) extras.push('architecture docs')
  if (s.hasContributionDocs) extras.push('contribution guidelines')

  const extrasNote = extras.length > 0
    ? ` Additional documentation found: ${extras.join(', ')}.`
    : ' No additional documentation files (API docs, architecture notes, or contribution guide) were detected.'

  return `${depthNote}${extrasNote}`
}

export function buildDeploymentNarrative(s: DeploymentSignals): string {
  if (!s.hasDockerfile && !s.hasCiWorkflow) {
    return 'No Dockerfile or CI workflow was detected. At least one of these is required to demonstrate deployment readiness.'
  }

  const found: string[] = []
  if (s.hasDockerfile) found.push('a Dockerfile')
  if (s.hasDockerCompose) found.push('Docker Compose')
  if (s.hasCiWorkflow) found.push('a CI workflow')
  if (s.hasDeploymentWorkflow) found.push('a deployment workflow')
  if (s.hasInfrastructureConfig) found.push('infrastructure configuration')

  const foundClause = `This repository includes ${found.join(', ')}.`

  const missing: string[] = []
  if (!s.hasDockerfile) missing.push('a Dockerfile')
  if (!s.hasCiWorkflow) missing.push('CI configuration')

  const missingClause = missing.length > 0 ? ` Missing: ${missing.join(' and ')}.` : ''

  return `${foundClause}${missingClause}`
}

export function buildSecurityNarrative(s: SecuritySignals): string {
  const parts: string[] = []

  if (s.hasSecretDetectionIssues) {
    const paths = s.suspiciousFilePaths.slice(0, 2).join(', ')
    parts.push(`Secret detection issue identified${paths ? ` in ${paths}` : ''}. Exposed credentials or committed secrets prevent verification.`)
  }

  if (s.hasAuthImplementation) {
    const authPaths = s.authPatternPaths.slice(0, 2).join(', ')
    parts.push(`Authentication implementation detected${authPaths ? ` (${authPaths})` : ''}.`)
  } else {
    parts.push('No authentication implementation was detected.')
  }

  if (s.hasValidationLibrary && s.validationLibraryName) {
    parts.push(`Input validation library detected: ${s.validationLibraryName}.`)
  } else {
    parts.push('No input validation library was detected.')
  }

  if (s.usesEnvironmentVariables) {
    parts.push('Environment variable usage detected.')
  } else {
    parts.push('No environment variable usage was detected.')
  }

  return parts.join(' ')
}

export function buildApiDesignNarrative(s: SecuritySignals): string {
  const parts: string[] = []

  if (s.hasSecretDetectionIssues) {
    const paths = s.suspiciousFilePaths.slice(0, 2).join(', ')
    parts.push(`Secret detection issue identified${paths ? ` in ${paths}` : ''}. Exposed credentials or committed secrets prevent verification.`)
  }

  if (s.hasValidationLibrary && s.validationLibraryName) {
    parts.push(`Request validation via ${s.validationLibraryName} detected.`)
  } else {
    parts.push('No request validation library was detected in package dependencies.')
  }

  if (s.hasAuthImplementation) {
    parts.push('Protected routes with authentication middleware are present.')
  } else {
    parts.push('No authentication middleware was detected on routes.')
  }

  if (s.usesEnvironmentVariables) {
    parts.push('Configuration is managed via environment variables.')
  } else {
    parts.push('No environment variable configuration was detected.')
  }

  return parts.join(' ')
}

export function buildAuthenticationNarrative(s: AuthenticationSignals): string {
  if (!s.hasAuthFiles && !s.hasJwtLibrary && !s.hasSessionOrTokenPattern) {
    return 'No authentication implementation was detected — no auth files, JWT libraries, or token patterns were found. Authentication is required for this verification standard.'
  }

  const parts: string[] = []

  if (s.hasAuthFiles) {
    const examples = s.authFilePaths.slice(0, 2).join(', ')
    parts.push(`Authentication logic is present${examples ? ` in ${examples}` : ''}.`)
  }

  if (s.detectedAuthLibraries.length > 0) {
    parts.push(`Using ${s.detectedAuthLibraries.join(' and ')} for auth.`)
  } else if (s.hasSessionOrTokenPattern) {
    parts.push('Token or session handling code detected in source files.')
  }

  if (s.hasGuardOrMiddleware) {
    parts.push('Route protection via guards or middleware is in place.')
  } else {
    parts.push('No route guard or middleware was detected — endpoints may be unprotected.')
  }

  if (!s.hasPasswordHashingLibrary) {
    parts.push('No password hashing library was found.')
  }

  return parts.join(' ')
}

export function buildDatabaseNarrative(s: DatabaseSignals): string {
  if (!s.hasOrmLibrary && !s.hasMigrationFiles && !s.hasSchemaDefinitions) {
    return 'No database design evidence was found — no ORM, migration files, or schema definitions are present. A real persistence layer is required for this category.'
  }

  const parts: string[] = []

  if (s.detectedOrmLibrary) {
    parts.push(`${s.detectedOrmLibrary} is used for database access.`)
  } else {
    parts.push('No ORM library was detected.')
  }

  if (s.hasMigrationFiles) {
    parts.push(`${s.migrationFileCount} migration file${s.migrationFileCount === 1 ? '' : 's'} found — schema changes are version-controlled.`)
  } else {
    parts.push('No migration files were found.')
  }

  const extras: string[] = []
  if (s.hasRelationPatterns) extras.push('relational patterns')
  if (s.hasTransactionPatterns) extras.push('transaction handling')
  if (s.hasSeedData) extras.push('seed data')

  if (extras.length > 0) {
    parts.push(`Also detected: ${extras.join(', ')}.`)
  }

  return parts.join(' ')
}

export function buildArchitectureNarrative(s: ArchitectureSignals): string {
  if (!s.hasFolderOrganization) {
    return `Source code appears to be in a flat structure with ${s.topLevelDirectories.length} top-level director${s.topLevelDirectories.length === 1 ? 'y' : 'ies'}. Meaningful directory organization is required for verification.`
  }

  const parts: string[] = []

  const dirCount = s.topLevelDirectories.length
  parts.push(`Repository has ${dirCount} top-level director${dirCount === 1 ? 'y' : 'ies'} (${s.topLevelDirectories.slice(0, 3).join(', ')}${dirCount > 3 ? ', …' : ''}).`)

  if (s.hasSeparationOfConcerns) {
    parts.push('Layer separation detected (e.g. controllers, services, or equivalent patterns).')
  } else {
    parts.push('No clear layer separation was detected.')
  }

  if (s.hasFeatureModules && s.featureModulePaths.length > 0) {
    const examples = s.featureModulePaths.slice(0, 3).join(', ')
    parts.push(`Feature modules present: ${examples}.`)
  } else {
    parts.push('No feature module organization detected.')
  }

  if (s.hasTestOrganization) parts.push('Tests are organized in a dedicated directory or co-located consistently.')
  if (s.hasConfigOrganization) parts.push('Configuration files follow a consistent organization pattern.')

  return parts.join(' ')
}
