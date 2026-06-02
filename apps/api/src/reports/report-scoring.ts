import type { Verdict } from '@praxis/shared'
import type { RepositoryIngestionData } from '../verification/ingestion/repository-ingestion.types'
import { TestingScorer } from '../scoring/categories/testing.scorer'
import { DocumentationScorer } from '../scoring/categories/documentation.scorer'
import { DeploymentScorer } from '../scoring/categories/deployment.scorer'
import { SecurityScorer } from '../scoring/categories/security.scorer'
import { ArchitectureScorer } from '../scoring/categories/architecture.scorer'
import { AuthenticationScorer } from '../scoring/categories/authentication.scorer'
import { DatabaseScorer } from '../scoring/categories/database.scorer'
import {
  extractTestingSignals,
  extractDocumentationSignals,
  extractDeploymentSignals,
  extractSecuritySignals,
  extractArchitectureSignals,
  extractAuthenticationSignals,
  extractDatabaseSignals,
} from '../scoring/signals/signal-extractor'

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

function scoreCategoryByName(categoryName: string, ingestionData: RepositoryIngestionData) {
  const name = categoryName.toLowerCase()

  if (name.includes('testing')) {
    return testingScorer.score(extractTestingSignals(ingestionData))
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

  return securityScorer.score(extractSecuritySignals(ingestionData))
}

function deriveStrengths(categoryScores: Record<string, { score: number; status: string }>): string[] {
  return Object.entries(categoryScores)
    .filter(([, v]) => v.score >= 8)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 4)
    .map(([name]) => `Strong result in ${name}`)
}

function deriveImprovements(categoryScores: Record<string, { score: number; status: string }>): string[] {
  return Object.entries(categoryScores)
    .filter(([, v]) => v.score <= 6)
    .sort(([, a], [, b]) => a.score - b.score)
    .slice(0, 4)
    .map(([name]) => `Improve coverage in ${name}`)
}

export function scoreReport(
  rubric: Rubric,
  ingestionData: RepositoryIngestionData,
  passingThreshold: number,
) {
  const categoryScores: Record<string, {
    score: number
    narrative: string
    citations: string[]
    status: string
    minimumScore: number
    signals: Record<string, unknown>
  }> = {}
  let weighted = 0
  let floorFailed = false

  for (const category of rubric.categories) {
    const result = scoreCategoryByName(category.name, ingestionData)

    const isFloor = result.status === 'floor'
    if (isFloor || result.score < category.floor) floorFailed = true

    weighted += result.score * category.weight
    categoryScores[category.name] = {
      score: result.score,
      narrative: result.narrative,
      citations: result.citations,
      status: result.status,
      minimumScore: category.floor,
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
