import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { DocumentationSignals } from '../signals/documentation.signals'
import { buildDocumentationNarrative } from '../narratives/narrative-builder'

const FLOOR_CONDITION = (s: DocumentationSignals) => !s.hasReadme

// README depth thresholds (word count)
const README_DEPTH_SUBSTANTIAL = 150  // meaningful docs
const README_DEPTH_MINIMAL = 30       // basically empty

// A substantial README that also contains setup instructions scores full marks.
// A long README without setup (e.g. auto-generated scaffold boilerplate) only scores 1.
function readmeDepthPoints(signals: DocumentationSignals): number {
  if (!signals.hasReadme) return 0
  if (signals.readmeWordCount < README_DEPTH_MINIMAL) return 0  // effectively empty
  if (signals.readmeWordCount >= README_DEPTH_SUBSTANTIAL && signals.hasSetupInstructions) return 2
  return 1  // long but no setup, or short with some content
}

export class DocumentationScorer implements CategoryScorer<DocumentationSignals> {
  score(signals: DocumentationSignals): CategoryScore {
    const isFloor = FLOOR_CONDITION(signals)

    const readmePoints = readmeDepthPoints(signals)
    const setupPoints = signals.hasSetupInstructions ? 2 : 0
    const apiPoints = signals.hasApiDocs ? 2 : 0
    const architecturePoints = signals.hasArchitectureDocs ? 2 : 0
    const contributionPoints = signals.hasContributionDocs ? 2 : 0

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
        readmeWordCount: signals.readmeWordCount,
        hasSetupInstructions: signals.hasSetupInstructions,
        hasApiDocs: signals.hasApiDocs,
        hasArchitectureDocs: signals.hasArchitectureDocs,
        hasContributionDocs: signals.hasContributionDocs,
      },
    }
  }
}
