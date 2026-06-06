import type { RepositoryIngestionData, IngestedFile } from '../../verification/ingestion/repository-ingestion.types'
import type { TestingSignals, TestExecutionResult } from './testing.signals'
import type { DocumentationSignals } from './documentation.signals'
import type { DeploymentSignals } from './deployment.signals'
import type { SecuritySignals } from './security.signals'
import type { ArchitectureSignals } from './architecture.signals'
import type { AuthenticationSignals } from './authentication.signals'
import type { DatabaseSignals } from './database.signals'
import type { ComponentArchitectureSignals } from './component-architecture.signals'
import type { StateManagementSignals } from './state-management.signals'
import type { AccessibilitySignals } from './accessibility.signals'
import type { StylingSignals } from './styling.signals'
import type { FrontendPerformanceSignals } from './frontend-performance.signals'
import type { FrontendTestingSignals } from './frontend-testing.signals'

const VALIDATION_LIBRARIES = ['class-validator', 'joi', 'zod', 'yup', 'ajv', 'superstruct']
const JWT_LIBRARIES = ['jsonwebtoken', 'jose', '@nestjs/jwt', 'passport-jwt', 'express-jwt', 'jwt-simple']
const PASSWORD_LIBRARIES = ['bcrypt', 'bcryptjs', 'argon2', 'scrypt', 'crypto-js']
const ORM_LIBRARIES = ['prisma', 'typeorm', 'drizzle-orm', 'knex', 'sequelize', 'mongoose', 'mikro-orm', '@mikro-orm']
const GUARD_MIDDLEWARE_PATTERN = /\.(guard|middleware|interceptor)\.(ts|js)$|guards\/|middlewares\/|Guard|Middleware/
const SESSION_TOKEN_PATTERN = /jwt\.sign|jwt\.verify|createToken|verifyToken|Bearer |passport\.use|session\(/i
const MIGRATION_PATH_PATTERN = /migrations?\/|migration\.|\.migration\.(ts|js)|schema\.prisma|_migration\.ts/i
const SCHEMA_FILE_PATTERN = /schema\.(ts|js|prisma)|entity\.(ts|js)|model\.(ts|js)|\.model\.ts|\.entity\.ts/i
const RELATION_PATTERN = /@ManyToOne|@OneToMany|@OneToOne|@ManyToMany|@Relation|@Column|references\(\)|belongsTo|hasMany|hasOne|belongsToMany/i
const TRANSACTION_PATTERN = /\.transaction\(|BEGIN|COMMIT|ROLLBACK|withTransaction|@Transaction/i
const SEED_PATTERN = /seed\.(ts|js|sql)|seeds\/|seeders\/|fixtures\//i

const STATE_LIBRARIES = ['redux', '@reduxjs/toolkit', 'zustand', 'jotai', 'recoil', 'mobx', 'xstate', 'valtio']
const STYLING_LIBRARIES = ['tailwindcss', 'styled-components', '@emotion/react', 'sass', 'less', 'css-modules', 'stitches', 'vanilla-extract', 'unocss']
const COMPONENT_FILE_PATTERN = /\.(tsx|jsx)$/
const CUSTOM_HOOK_PATTERN = /use[A-Z]\w+\.(ts|tsx)$|\/hooks\/use[A-Z]/
const ARIA_PATTERN = /aria-\w+|role=["']\w/i
const SEMANTIC_HTML_PATTERN = /<(main|nav|header|footer|article|section|aside|figure|figcaption|time|mark|details|summary)\b/i
const ALT_PATTERN = /alt=["'][^"']/i
const A11Y_CONFIG_PATTERN = /eslint-plugin-jsx-a11y|axe-core|\.a11y\./i
const RESPONSIVE_PATTERN = /sm:|md:|lg:|xl:|@media|breakpoint/i
const LAZY_PATTERN = /React\.lazy|dynamic\(|import\(|Suspense/i
const CODE_SPLIT_PATTERN = /dynamic\(|React\.lazy|import\(/i
const IMAGE_OPT_PATTERN = /next\/image|<Image|sharp|imagemin/i
const CONTEXT_PATTERN = /createContext|useContext|React\.createContext/i
const GLOBAL_STYLE_PATTERN = /globals?\.(css|scss|less)|_app\.(tsx|jsx)|layout\.(tsx|jsx)/i

const SETUP_KEYWORDS = /install|setup|getting started|prerequisites/i
const API_DOC_PATHS = /openapi\.ya?ml|swagger\.ya?ml|api\.md|docs\/(api|swagger)/i
const ARCHITECTURE_DOC_PATHS = /architecture\.md|docs\/architecture|\/adr\//i
const CONTRIBUTION_DOC_PATHS = /contributing\.md|\.github\/contributing/i
const INTEGRATION_TEST_PATHS = /integration/i
const E2E_TEST_PATHS = /e2e|end.to.end|cypress|playwright/i
const COVERAGE_CONFIG_PATHS = /\.nycrc|jest\.config|vitest\.config|coverage/i
// Matches both directory-based layers (/services/, /controllers/) and NestJS file-based layers (*.service.ts, *.controller.ts)
const LAYER_DIRS = /\/(controllers?|services?|repositories?|models?|routes?|handlers?|middlewares?|resolvers?)(\.|\/|$)|\.(controller|service|repository|handler|middleware|resolver|model|route)\.(ts|js)/i
const CI_DEPLOY_KEYWORDS = /deploy|release|publish/i
const INFRA_PATHS = /\.tf$|kubernetes|k8s|helm|pulumi/i
const ENV_PATTERNS = /process\.env|\.env\.example|\.env\b/i
const SECRET_PATTERNS = /-----BEGIN (RSA |EC )?PRIVATE KEY-----|api[_-]?key\s*=\s*['"][A-Za-z0-9]{16,}|secret[_-]?key\s*=\s*['"][A-Za-z0-9]{16,}/i

function byKind(files: IngestedFile[], kind: IngestedFile['kind']) {
  return files.filter((f) => f.kind === kind)
}

function top(paths: string[], n: number) {
  return paths.slice(0, n)
}

export function extractTestingSignals(
  data: RepositoryIngestionData,
  executionResult: TestExecutionResult | null = null,
): TestingSignals {
  const testFiles = byKind(data.files, 'test')
  const testDirs = new Set(testFiles.map((f) => f.path.split('/').slice(0, -1).join('/')))

  const allPaths = testFiles.map((f) => f.path)
  const allContent = testFiles.map((f) => `${f.path}\n${f.content ?? ''}`).join('\n')

  return {
    testFileCount: testFiles.length,
    testDirectoryCount: testDirs.size,
    hasIntegrationTests: INTEGRATION_TEST_PATHS.test(allPaths.join('\n')),
    hasE2eTests: E2E_TEST_PATHS.test(allPaths.join('\n')),
    hasCoverageConfig: COVERAGE_CONFIG_PATHS.test(data.files.map((f) => f.path).join('\n')) ||
      COVERAGE_CONFIG_PATHS.test(allContent),
    testFilePaths: top(allPaths, 5),
    executionResult,
  }
}

export function extractDocumentationSignals(data: RepositoryIngestionData): DocumentationSignals {
  const docFiles = byKind(data.files, 'doc')
  const docPaths = docFiles.map((f) => f.path)
  const readmeFile = docFiles.find((f) => /readme/i.test(f.path))

  const readmeContent = readmeFile?.content ?? ''

  const readmeWordCount = readmeContent.trim()
    ? readmeContent.trim().split(/\s+/).length
    : 0

  return {
    hasReadme: !!readmeFile,
    readmeWordCount,
    hasSetupInstructions: SETUP_KEYWORDS.test(readmeContent),
    hasApiDocs: API_DOC_PATHS.test(docPaths.join('\n')) ||
      API_DOC_PATHS.test(data.files.map((f) => f.path).join('\n')),
    hasArchitectureDocs: ARCHITECTURE_DOC_PATHS.test(docPaths.join('\n')) ||
      ARCHITECTURE_DOC_PATHS.test(data.files.map((f) => f.path).join('\n')),
    hasContributionDocs: CONTRIBUTION_DOC_PATHS.test(docPaths.join('\n')) ||
      CONTRIBUTION_DOC_PATHS.test(data.files.map((f) => f.path).join('\n')),
    detectedDocFiles: top(docPaths, 5),
  }
}

export function extractDeploymentSignals(data: RepositoryIngestionData): DeploymentSignals {
  const dockerFiles = byKind(data.files, 'docker')
  const ciFiles = byKind(data.files, 'ci')
  const deployFiles = byKind(data.files, 'deployment')

  const allPaths = data.files.map((f) => f.path)
  const dockerPaths = dockerFiles.map((f) => f.path)
  const ciPaths = ciFiles.map((f) => f.path)

  const hasDockerfile = dockerPaths.some((p) => /^dockerfile$/i.test(p.split('/').at(-1) ?? ''))
  const hasDockerCompose = dockerPaths.some((p) => /docker-compose/i.test(p))
  // deployment-kind files (railway.toml, render.yaml, vercel.json) are explicit deploy targets
  const hasDeploymentWorkflow = ciPaths.some((p) => CI_DEPLOY_KEYWORDS.test(p)) ||
    ciFiles.some((f) => CI_DEPLOY_KEYWORDS.test(f.content ?? '')) ||
    deployFiles.length > 0
  const hasInfrastructureConfig = INFRA_PATHS.test(allPaths.join('\n'))

  const detectedFiles = [
    ...dockerPaths,
    ...ciPaths,
    ...deployFiles.map((f) => f.path),
  ]

  return {
    hasDockerfile,
    hasDockerCompose,
    hasCiWorkflow: ciFiles.length > 0,
    hasDeploymentWorkflow,
    hasInfrastructureConfig,
    detectedDeploymentFiles: top(detectedFiles, 5),
  }
}

export function extractSecuritySignals(data: RepositoryIngestionData): SecuritySignals {
  const authFiles = byKind(data.files, 'auth')
  const manifestFiles = byKind(data.files, 'manifest')
  const allPaths = data.files.map((f) => f.path).join('\n')
  const allContent = data.files.map((f) => `${f.path}\n${f.content ?? ''}`).join('\n')

  const manifestContent = manifestFiles.map((f) => f.content ?? '').join('\n')
  const detectedLibrary = VALIDATION_LIBRARIES.find((lib) => manifestContent.includes(`"${lib}"`)) ?? null

  // Suspicious: .env files not gitignored, or hardcoded secrets in source
  const envFiles = data.files.filter((f) => /^\.env$|\.env\.local|\.env\.production/.test(f.path))
  const hasCommittedEnv = envFiles.length > 0
  const sourceContent = byKind(data.files, 'source').map((f) => f.content ?? '').join('\n')
  const hasHardcodedSecrets = SECRET_PATTERNS.test(sourceContent)
  const suspiciousFilePaths = [
    ...envFiles.map((f) => f.path),
    ...byKind(data.files, 'source').filter((f) => SECRET_PATTERNS.test(f.content ?? '')).map((f) => f.path),
  ]

  return {
    usesEnvironmentVariables: ENV_PATTERNS.test(allContent) || ENV_PATTERNS.test(allPaths),
    hasValidationLibrary: !!detectedLibrary,
    hasAuthImplementation: authFiles.length > 0,
    hasSecretDetectionIssues: hasCommittedEnv || hasHardcodedSecrets,
    validationLibraryName: detectedLibrary,
    authPatternPaths: top(authFiles.map((f) => f.path), 5),
    suspiciousFilePaths: top(suspiciousFilePaths, 5),
  }
}

export function extractArchitectureSignals(data: RepositoryIngestionData): ArchitectureSignals {
  const allPaths = data.files.map((f) => f.path)

  // Top-level directories under src/ or project root
  const topLevelSet = new Set<string>()
  for (const p of allPaths) {
    const parts = p.split('/')
    if (parts.length > 1) topLevelSet.add(parts[0])
  }
  const PRIORITY_DIRS = new Set(['src', 'test', 'tests', 'lib', 'app', 'pkg'])
  const topLevelDirectories = Array.from(topLevelSet).sort((a, b) => {
    const aPriority = PRIORITY_DIRS.has(a) ? 0 : 1
    const bPriority = PRIORITY_DIRS.has(b) ? 0 : 1
    return aPriority - bPriority || a.localeCompare(b)
  })

  // Folder organization: more than 1 meaningful subdirectory
  const hasFolderOrganization = topLevelDirectories.length > 1

  // Separation of concerns: recognizable layer directories
  const hasSeparationOfConcerns = LAYER_DIRS.test(allPaths.join('\n'))

  // Feature modules: directories containing multiple files each
  // Use depth-3 grouping for paths through a 'src' or 'features' intermediate so that
  // monorepo structures like backend/src/features/auth are grouped at the feature level,
  // not collapsed into backend/src.
  const dirFileCounts = new Map<string, number>()
  for (const p of allPaths) {
    const parts = p.split('/')
    const depth = parts.length > 3 && (parts[1] === 'src' || parts[2] === 'features' || parts[1] === 'features')
      ? 4
      : 2
    const dir = parts.slice(0, depth).join('/')
    dirFileCounts.set(dir, (dirFileCounts.get(dir) ?? 0) + 1)
  }
  const featureModulePaths = Array.from(dirFileCounts.entries())
    .filter(([dir, count]) => count > 1 && dir.includes('/') && !dir.startsWith('.'))
    .map(([dir]) => dir)

  // Test organization: tests in a dedicated directory or __tests__
  const testPaths = allPaths.filter((p) => /\.spec\.|\.test\.|__tests__/.test(p))
  const testDirs = new Set(testPaths.map((p) => p.split('/')[0]))
  // Require at least one test file before claiming organized tests (avoids vacuous-true on repos with no tests)
  const hasTestOrganization = testPaths.length > 0 && (testDirs.size === 1 || testPaths.every((p) => p.includes('__tests__')))

  // Config organization: config files follow a pattern
  const configPaths = allPaths.filter((p) => /config\.(ts|js|json|yaml)|\.config\./i.test(p))
  const hasConfigOrganization = configPaths.length > 1

  return {
    hasFolderOrganization,
    hasSeparationOfConcerns,
    hasFeatureModules: featureModulePaths.length >= 2,
    hasTestOrganization,
    hasConfigOrganization,
    topLevelDirectories,
    featureModulePaths: top(featureModulePaths, 10),
  }
}

export function extractAuthenticationSignals(data: RepositoryIngestionData): AuthenticationSignals {
  const authFiles = byKind(data.files, 'auth')
  const manifestFiles = byKind(data.files, 'manifest')
  const manifestContent = manifestFiles.map((f) => f.content ?? '').join('\n')
  const allPaths = data.files.map((f) => f.path).join('\n')
  const allContent = data.files.map((f) => `${f.path}\n${f.content ?? ''}`).join('\n')

  const detectedJwtLibs = JWT_LIBRARIES.filter((lib) => manifestContent.includes(`"${lib}"`))
  const detectedPasswordLibs = PASSWORD_LIBRARIES.filter((lib) => manifestContent.includes(`"${lib}"`))

  const guardFiles = data.files.filter((f) => GUARD_MIDDLEWARE_PATTERN.test(f.path))
  const hasGuardOrMiddleware = guardFiles.length > 0

  const sourceAndAuthContent = [
    ...byKind(data.files, 'source'),
    ...authFiles,
  ].map((f) => f.content ?? '').join('\n')

  const authFilePaths = top([
    ...authFiles.map((f) => f.path),
    ...guardFiles.map((f) => f.path),
  ], 5)

  return {
    hasAuthFiles: authFiles.length > 0,
    hasJwtLibrary: detectedJwtLibs.length > 0,
    hasPasswordHashingLibrary: detectedPasswordLibs.length > 0,
    hasGuardOrMiddleware,
    hasSessionOrTokenPattern: SESSION_TOKEN_PATTERN.test(allContent) || SESSION_TOKEN_PATTERN.test(allPaths),
    authFilePaths,
    detectedAuthLibraries: [...detectedJwtLibs, ...detectedPasswordLibs],
  }
}

export function extractDatabaseSignals(data: RepositoryIngestionData): DatabaseSignals {
  const allPaths = data.files.map((f) => f.path)
  const manifestFiles = byKind(data.files, 'manifest')
  const manifestContent = manifestFiles.map((f) => f.content ?? '').join('\n')
  const migrationFiles = byKind(data.files, 'migration')
  const allContent = data.files.map((f) => `${f.path}\n${f.content ?? ''}`).join('\n')

  const migrationPaths = [
    ...migrationFiles.map((f) => f.path),
    ...allPaths.filter((p) => MIGRATION_PATH_PATTERN.test(p) && !migrationFiles.find((m) => m.path === p)),
  ]

  const detectedOrm = ORM_LIBRARIES.find((lib) => manifestContent.includes(`"${lib}"`) || manifestContent.includes(`'${lib}'`)) ?? null

  const schemaFiles = data.files.filter((f) => SCHEMA_FILE_PATTERN.test(f.path))
  const sourceFiles = byKind(data.files, 'source')
  const sourceContent = sourceFiles.map((f) => f.content ?? '').join('\n')

  return {
    hasMigrationFiles: migrationPaths.length > 0,
    migrationFileCount: migrationPaths.length,
    hasOrmLibrary: !!detectedOrm,
    hasSchemaDefinitions: schemaFiles.length > 0,
    hasRelationPatterns: RELATION_PATTERN.test(sourceContent) || RELATION_PATTERN.test(allContent),
    hasTransactionPatterns: TRANSACTION_PATTERN.test(sourceContent),
    hasSeedData: SEED_PATTERN.test(allPaths.join('\n')),
    detectedOrmLibrary: detectedOrm,
    detectedMigrationPaths: top(migrationPaths, 5),
  }
}

export function extractComponentArchitectureSignals(data: RepositoryIngestionData): ComponentArchitectureSignals {
  const componentFiles = data.files.filter((f) => COMPONENT_FILE_PATTERN.test(f.path))
  const allPaths = data.files.map((f) => f.path)
  const hasComponentDirectory = allPaths.some((p) => /\/components?\//i.test(p))
  const hasIndexExports = allPaths.some((p) => /\/index\.(ts|tsx|js|jsx)$/.test(p))
  const hasSharedComponents = allPaths.some((p) => /\/(shared|common|ui)\//i.test(p))
  const allContent = componentFiles.map((f) => f.content ?? '').join('\n')
  const hasPropTypes = /PropTypes\.|: React\.FC|interface \w+Props/.test(allContent)

  return {
    hasComponentDirectory,
    componentFileCount: componentFiles.length,
    hasIndexExports,
    hasPropTypes,
    hasSharedComponents,
    componentFilePaths: top(componentFiles.map((f) => f.path), 5),
  }
}

export function extractStateManagementSignals(data: RepositoryIngestionData): StateManagementSignals {
  const manifestFiles = byKind(data.files, 'manifest')
  const manifestContent = manifestFiles.map((f) => f.content ?? '').join('\n')
  const allContent = data.files.map((f) => f.content ?? '').join('\n')
  const detectedLib = STATE_LIBRARIES.find((lib) => manifestContent.includes(`"${lib}"`)) ?? null
  const hasContextApi = CONTEXT_PATTERN.test(allContent)
  const hookFiles = data.files.filter((f) => CUSTOM_HOOK_PATTERN.test(f.path))

  return {
    hasStateLibrary: !!detectedLib,
    detectedStateLibrary: detectedLib,
    hasContextApi,
    hasCustomHooks: hookFiles.length > 0,
    customHookPaths: top(hookFiles.map((f) => f.path), 5),
  }
}

export function extractAccessibilitySignals(data: RepositoryIngestionData): AccessibilitySignals {
  const sourceFiles = byKind(data.files, 'source')
  const componentFiles = data.files.filter((f) => COMPONENT_FILE_PATTERN.test(f.path))
  const allContent = [...sourceFiles, ...componentFiles].map((f) => f.content ?? '').join('\n')
  const manifestContent = byKind(data.files, 'manifest').map((f) => f.content ?? '').join('\n')
  const a11yFiles = data.files.filter((f) => A11Y_CONFIG_PATTERN.test(f.path))

  return {
    hasAriaAttributes: ARIA_PATTERN.test(allContent),
    hasSemanticHtml: SEMANTIC_HTML_PATTERN.test(allContent),
    hasAltAttributes: ALT_PATTERN.test(allContent),
    hasA11yLintConfig: A11Y_CONFIG_PATTERN.test(manifestContent) || a11yFiles.length > 0,
    detectedA11yFiles: top(a11yFiles.map((f) => f.path), 3),
  }
}

export function extractStylingSignals(data: RepositoryIngestionData): StylingSignals {
  const manifestFiles = byKind(data.files, 'manifest')
  const manifestContent = manifestFiles.map((f) => f.content ?? '').join('\n')
  const allContent = data.files.map((f) => f.content ?? '').join('\n')
  const allPaths = data.files.map((f) => f.path)
  const detectedLib = STYLING_LIBRARIES.find((lib) => manifestContent.includes(`"${lib}"`)) ?? null
  const stylingFiles = data.files.filter((f) => /\.(css|scss|less|styl)$/.test(f.path))

  return {
    hasStylingApproach: !!detectedLib || stylingFiles.length > 0,
    detectedStylingLibrary: detectedLib,
    hasGlobalStyles: GLOBAL_STYLE_PATTERN.test(allPaths.join('\n')),
    hasResponsivePatterns: RESPONSIVE_PATTERN.test(allContent),
    stylingFilePaths: top(stylingFiles.map((f) => f.path), 5),
  }
}

export function extractFrontendPerformanceSignals(data: RepositoryIngestionData): FrontendPerformanceSignals {
  const allContent = data.files.map((f) => f.content ?? '').join('\n')
  const allPaths = data.files.map((f) => f.path).join('\n')

  return {
    hasImageOptimization: IMAGE_OPT_PATTERN.test(allContent) || IMAGE_OPT_PATTERN.test(allPaths),
    hasLazyLoading: LAZY_PATTERN.test(allContent),
    hasCodeSplitting: CODE_SPLIT_PATTERN.test(allContent),
    hasBundleConfig: /next\.config\.|vite\.config\.|webpack\.config\./.test(allPaths),
    hasNextConfig: /next\.config\.(ts|js|mjs)/.test(allPaths),
  }
}

export function extractFrontendTestingSignals(
  data: RepositoryIngestionData,
  executionResult: TestExecutionResult | null = null,
): FrontendTestingSignals {
  const testFiles = byKind(data.files, 'test')
  const allPaths = testFiles.map((f) => f.path)
  const hasComponentTests = testFiles.some((f) => COMPONENT_FILE_PATTERN.test(f.path) || /\.(spec|test)\.(tsx|jsx)$/.test(f.path))
  const hasE2eTests = E2E_TEST_PATHS.test(allPaths.join('\n'))
  const hasCoverageConfig = COVERAGE_CONFIG_PATHS.test(data.files.map((f) => f.path).join('\n'))

  return {
    testFileCount: testFiles.length,
    hasComponentTests,
    hasE2eTests,
    hasCoverageConfig,
    testFilePaths: top(allPaths, 5),
    executionResult,
  }
}
