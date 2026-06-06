import type { Verdict } from '@praxis/shared'
import { deriveStrengths, deriveImprovements } from '../scoring/derive-report-highlights'
import type { RepositoryIngestionData } from '../verification/ingestion/repository-ingestion.types'
import { TestingScorer } from '../scoring/categories/testing.scorer'
import { DocumentationScorer } from '../scoring/categories/documentation.scorer'
import { DeploymentScorer } from '../scoring/categories/deployment.scorer'
import { SecurityScorer } from '../scoring/categories/security.scorer'
import { ArchitectureScorer } from '../scoring/categories/architecture.scorer'
import { AuthenticationScorer } from '../scoring/categories/authentication.scorer'
import { DatabaseScorer } from '../scoring/categories/database.scorer'
import { ComponentArchitectureScorer } from '../scoring/categories/component-architecture.scorer'
import { StateManagementScorer } from '../scoring/categories/state-management.scorer'
import { AccessibilityScorer } from '../scoring/categories/accessibility.scorer'
import { StylingScorer } from '../scoring/categories/styling.scorer'
import { FrontendPerformanceScorer } from '../scoring/categories/frontend-performance.scorer'
import { FrontendTestingScorer } from '../scoring/categories/frontend-testing.scorer'
import {
  extractTestingSignals,
  extractDocumentationSignals,
  extractDeploymentSignals,
  extractSecuritySignals,
  extractArchitectureSignals,
  extractAuthenticationSignals,
  extractDatabaseSignals,
  extractComponentArchitectureSignals,
  extractStateManagementSignals,
  extractAccessibilitySignals,
  extractStylingSignals,
  extractFrontendPerformanceSignals,
  extractFrontendTestingSignals,
} from '../scoring/signals/signal-extractor'
import type { TestExecutionResult } from '../scoring/signals/testing.signals'

interface RubricCategory {
  name: string
  weight: number
  floor: number
}

interface Rubric {
  categories: RubricCategory[]
}

const testingScorer = new TestingScorer()
const documentationScorer = new DocumentationScorer()
const deploymentScorer = new DeploymentScorer()
const securityScorer = new SecurityScorer()
const architectureScorer = new ArchitectureScorer()
const authenticationScorer = new AuthenticationScorer()
const databaseScorer = new DatabaseScorer()
const componentArchitectureScorer = new ComponentArchitectureScorer()
const stateManagementScorer = new StateManagementScorer()
const accessibilityScorer = new AccessibilityScorer()
const stylingScorer = new StylingScorer()
const frontendPerformanceScorer = new FrontendPerformanceScorer()
const frontendTestingScorer = new FrontendTestingScorer()

function scoreCategoryByName(
  categoryName: string,
  ingestionData: RepositoryIngestionData,
  executionResult: TestExecutionResult | null = null,
) {
  const name = categoryName.toLowerCase()

  if (name.includes('frontend testing')) {
    return frontendTestingScorer.score(extractFrontendTestingSignals(ingestionData, executionResult))
  }
  if (name.includes('component architecture') || name.includes('component design')) {
    return componentArchitectureScorer.score(extractComponentArchitectureSignals(ingestionData))
  }
  if (name.includes('testing')) {
    return testingScorer.score(extractTestingSignals(ingestionData, executionResult))
  }
  if (name.includes('documentation')) {
    return documentationScorer.score(extractDocumentationSignals(ingestionData))
  }
  if (name.includes('deployment') || name.includes('ci/cd')) {
    return deploymentScorer.score(extractDeploymentSignals(ingestionData))
  }
  if (name.includes('api design')) {
    return securityScorer.score(extractSecuritySignals(ingestionData), 'api-design')
  }
  if (name.includes('authentication')) {
    return authenticationScorer.score(extractAuthenticationSignals(ingestionData))
  }
  if (name.includes('database design') || name.includes('database')) {
    return databaseScorer.score(extractDatabaseSignals(ingestionData))
  }
  if (name.includes('security')) {
    return securityScorer.score(extractSecuritySignals(ingestionData))
  }
  if (name.includes('architecture')) {
    return architectureScorer.score(extractArchitectureSignals(ingestionData))
  }
  if (name.includes('state management')) {
    return stateManagementScorer.score(extractStateManagementSignals(ingestionData))
  }
  if (name.includes('accessibility')) {
    return accessibilityScorer.score(extractAccessibilitySignals(ingestionData))
  }
  if (name.includes('styling') || name.includes('ui design')) {
    return stylingScorer.score(extractStylingSignals(ingestionData))
  }
  if (name.includes('performance')) {
    return frontendPerformanceScorer.score(extractFrontendPerformanceSignals(ingestionData))
  }
  return securityScorer.score(extractSecuritySignals(ingestionData))
}


export function scoreReport(
  rubric: Rubric,
  ingestionData: RepositoryIngestionData,
  passingThreshold: number,
  executionResult: TestExecutionResult | null = null,
) {
  const categoryScores: Record<string, {
    score: number
    narrative: string
    citations: string[]
    status: string
    minimumScore: number
    weight: number
    signals: Record<string, unknown>
  }> = {}
  let weighted = 0
  let floorFailed = false

  for (const category of rubric.categories) {
    const result = scoreCategoryByName(category.name, ingestionData, executionResult)

    const isFloor = result.status === 'floor'
    if (isFloor || result.score < category.floor) floorFailed = true

    weighted += result.score * category.weight
    categoryScores[category.name] = {
      score: result.score,
      narrative: result.narrative,
      citations: result.citations,
      status: result.status,
      minimumScore: category.floor,
      weight: category.weight,
      signals: result.signals,
    }
  }

  const compositeScore = Math.round(weighted / 10)
  const verdict: Verdict = floorFailed || compositeScore < passingThreshold ? 'insufficient' : 'verified'

  const strengths = deriveStrengths(categoryScores)
  const improvements = deriveImprovements(categoryScores)

  return {
    compositeScore,
    verdict,
    categoryScores,
    strengths,
    improvements,
    publicSummary: verdict === 'verified'
      ? 'This project meets the deterministic Praxis verification threshold.'
      : 'This project does not yet meet the deterministic Praxis verification threshold.',
  }
}
