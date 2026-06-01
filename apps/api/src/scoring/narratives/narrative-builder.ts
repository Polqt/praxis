import type { TestingSignals } from '../signals/testing.signals'
import type { DocumentationSignals } from '../signals/documentation.signals'
import type { DeploymentSignals } from '../signals/deployment.signals'
import type { SecuritySignals } from '../signals/security.signals'
import type { ArchitectureSignals } from '../signals/architecture.signals'

export function buildTestingNarrative(s: TestingSignals): string {
  if (s.testFileCount === 0) {
    return 'No test files were found. Testing evidence is required for verification.'
  }

  const examples = s.testFilePaths.slice(0, 2)
  const exampleClause = examples.length > 0
    ? ` including ${examples.join(' and ')}`
    : ''

  const suiteTypes: string[] = []
  if (s.hasIntegrationTests) suiteTypes.push('integration')
  if (s.hasE2eTests) suiteTypes.push('end-to-end')

  const suiteClause = suiteTypes.length > 0
    ? ` across unit and ${suiteTypes.join(' and ')} suites`
    : ''

  const noSuiteClause = !s.hasIntegrationTests && !s.hasE2eTests
    ? ' No integration or end-to-end test suites were found.'
    : ''

  const coverageClause = s.hasCoverageConfig ? ' Coverage configuration is present.' : ''

  return `Detected ${s.testFileCount} test file${s.testFileCount === 1 ? '' : 's'}${suiteClause}${exampleClause}.${noSuiteClause}${coverageClause}`
}

export function buildDocumentationNarrative(s: DocumentationSignals): string {
  if (!s.hasReadme) {
    return 'No README was detected. A README is required as a baseline documentation signal.'
  }

  const detected: string[] = ['README']
  const missing: string[] = []

  if (s.hasSetupInstructions) detected.push('setup instructions')
  else missing.push('setup instructions')

  if (s.hasApiDocs) detected.push('API documentation')
  else missing.push('API documentation')

  if (s.hasArchitectureDocs) detected.push('architecture documentation')
  else missing.push('architecture documentation')

  if (s.hasContributionDocs) detected.push('contribution guidelines')
  else missing.push('contribution guidelines')

  const detectedClause = `Detected: ${detected.join(', ')}.`
  const missingClause = missing.length > 0 ? ` Not found: ${missing.join(', ')}.` : ''

  return `${detectedClause}${missingClause}`
}

export function buildDeploymentNarrative(s: DeploymentSignals): string {
  const detected: string[] = []
  const missing: string[] = []

  if (s.hasDockerfile) detected.push('Dockerfile')
  else missing.push('Dockerfile')

  if (s.hasDockerCompose) detected.push('Docker Compose')

  if (s.hasCiWorkflow) detected.push('CI workflow')
  else missing.push('CI workflow')

  if (s.hasDeploymentWorkflow) detected.push('deployment workflow')
  else missing.push('deployment workflow')

  if (s.hasInfrastructureConfig) detected.push('infrastructure configuration')

  if (detected.length === 0) {
    return 'No deployment or CI configuration was detected. A Dockerfile or CI workflow is required for verification.'
  }

  const detectedClause = `Detected deployment assets: ${detected.join(', ')}.`
  const missingClause = missing.length > 0 ? ` Not detected: ${missing.join(', ')}.` : ''

  const exampleFiles = s.detectedDeploymentFiles.slice(0, 3)
  const fileClause = exampleFiles.length > 0
    ? ` Representative files: ${exampleFiles.join(', ')}.`
    : ''

  return `${detectedClause}${missingClause}${fileClause}`
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
