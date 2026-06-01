import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { ArchitectureSignals } from '../signals/architecture.signals'
import { buildArchitectureNarrative } from '../narratives/narrative-builder'

const FLOOR_CONDITION = (s: ArchitectureSignals) => !s.hasFolderOrganization

const FOLDER_ORGANIZATION_POINTS = 2
const SEPARATION_OF_CONCERNS_POINTS = 3
const FEATURE_MODULES_POINTS = 2
const TEST_ORGANIZATION_POINTS = 2
const CONFIG_ORGANIZATION_POINTS = 1

export class ArchitectureScorer implements CategoryScorer<ArchitectureSignals> {
  score(signals: ArchitectureSignals): CategoryScore {
    const isFloor = FLOOR_CONDITION(signals)

    const folderPoints = signals.hasFolderOrganization ? FOLDER_ORGANIZATION_POINTS : 0
    const separationPoints = signals.hasSeparationOfConcerns ? SEPARATION_OF_CONCERNS_POINTS : 0
    const featurePoints = signals.hasFeatureModules ? FEATURE_MODULES_POINTS : 0
    const testOrgPoints = signals.hasTestOrganization ? TEST_ORGANIZATION_POINTS : 0
    const configPoints = signals.hasConfigOrganization ? CONFIG_ORGANIZATION_POINTS : 0

    const rawScore = folderPoints + separationPoints + featurePoints + testOrgPoints + configPoints
    const finalScore = Math.min(10, rawScore)

    const status = isFloor ? 'floor' : finalScore >= 5 ? 'pass' : 'fail'

    return {
      score: finalScore,
      narrative: buildArchitectureNarrative(signals),
      citations: signals.featureModulePaths,
      status,
      signals: {
        hasFolderOrganization: signals.hasFolderOrganization,
        hasSeparationOfConcerns: signals.hasSeparationOfConcerns,
        hasFeatureModules: signals.hasFeatureModules,
        hasTestOrganization: signals.hasTestOrganization,
        hasConfigOrganization: signals.hasConfigOrganization,
        topLevelDirectoryCount: signals.topLevelDirectories.length,
        featureModuleCount: signals.featureModulePaths.length,
      },
    }
  }
}
