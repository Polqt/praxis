import type { Verdict } from '@praxis/shared'
import { RepositoryAnalysisData } from '../verification/analysis/repository-analysis.types'

interface Rubric {
  categories: { name: string; weight: number; floor: number }[]
}

export function scoreReport(rubric: Rubric, analysisData: RepositoryAnalysisData, passingThreshold: number) {
  const categoryScores: Record<string, { score: number; narrative: string; citations: string[] }> = {}
  let weighted = 0
  let floorFailed = false

  for (const category of rubric.categories) {
    const signal = signalForCategory(category.name, analysisData)
    const score = signal.present ? 10 : 0
    if (score < category.floor) floorFailed = true
    weighted += score * category.weight
    categoryScores[category.name] = {
      score,
      narrative: signal.present
        ? `${category.name} evidence found.`
        : `${category.name} evidence was not found.`,
      citations: signal.citations,
    }
  }

  const compositeScore = Math.round(weighted / 10)
  const verdict: Verdict = floorFailed || compositeScore < passingThreshold ? 'insufficient' : 'verified'

  return {
    compositeScore,
    verdict,
    categoryScores,
    publicSummary: verdict === 'verified'
      ? 'This project meets the deterministic Praxis verification threshold.'
      : 'This project does not yet meet the deterministic Praxis verification threshold.',
    analysisData,
  }
}

function signalForCategory(categoryName: string, analysisData: RepositoryAnalysisData) {
  const name = categoryName.toLowerCase()
  if (name.includes('test')) return analysisData.hardSignals.tests
  if (name.includes('deploy')) return analysisData.hardSignals.deployment
  if (name.includes('security') || name.includes('auth')) return analysisData.hardSignals.auth
  if (name.includes('architecture')) return analysisData.hardSignals.migrations
  if (name.includes('documentation')) {
    return {
      present: true,
      confidence: 0.5,
      citations: analysisData.hardSignals.deployment.citations,
    }
  }
  return analysisData.hardSignals.ci.present
    ? analysisData.hardSignals.ci
    : analysisData.hardSignals.envUsage
}
