import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { DocumentationSignals } from '../signals/documentation.signals'
import { buildDocumentationNarrative } from '../narratives/narrative-builder'

const FLOOR_CONDITION = (s: DocumentationSignals) => !s.hasReadme

const README_POINTS = 2
const SETUP_POINTS = 2
const API_DOCS_POINTS = 2
const ARCHITECTURE_POINTS = 2
const CONTRIBUTION_POINTS = 2

export class DocumentationScorer implements CategoryScorer<DocumentationSignals> {
  score(signals: DocumentationSignals): CategoryScore {
    const isFloor = FLOOR_CONDITION(signals)

    const readmePoints = signals.hasReadme ? README_POINTS : 0
    const setupPoints = signals.hasSetupInstructions ? SETUP_POINTS : 0
    const apiPoints = signals.hasApiDocs ? API_DOCS_POINTS : 0
    const architecturePoints = signals.hasArchitectureDocs ? ARCHITECTURE_POINTS : 0
    const contributionPoints = signals.hasContributionDocs ? CONTRIBUTION_POINTS : 0

    const rawScore = readmePoints + setupPoints + apiPoints + architecturePoints + contributionPoints
    const finalScore = Math.min(10, rawScore)

    const status = isFloor ? 'floor' : finalScore >= 5 ? 'pass' : 'fail'

    return {
      score: finalScore,
      narrative: buildDocumentationNarrative(signals),
      citations: signals.detectedDocFiles,
      status,
      signals: {
        hasReadme: signals.hasReadme,
        hasSetupInstructions: signals.hasSetupInstructions,
        hasApiDocs: signals.hasApiDocs,
        hasArchitectureDocs: signals.hasArchitectureDocs,
        hasContributionDocs: signals.hasContributionDocs,
      },
    }
  }
}
