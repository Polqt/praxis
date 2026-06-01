import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { SecuritySignals } from '../signals/security.signals'
import { buildSecurityNarrative, buildApiDesignNarrative } from '../narratives/narrative-builder'

const FLOOR_CONDITION = (s: SecuritySignals) => s.hasSecretDetectionIssues

const ENV_POINTS = 2
const VALIDATION_POINTS = 2
const AUTH_POINTS = 3
const SECRET_PENALTY = 3

export class SecurityScorer implements CategoryScorer<SecuritySignals> {
  score(signals: SecuritySignals, context: 'security' | 'api-design' = 'security'): CategoryScore {
    const isFloor = FLOOR_CONDITION(signals)

    const envPoints = signals.usesEnvironmentVariables ? ENV_POINTS : 0
    const validationPoints = signals.hasValidationLibrary ? VALIDATION_POINTS : 0
    const authPoints = signals.hasAuthImplementation ? AUTH_POINTS : 0
    const secretPenalty = signals.hasSecretDetectionIssues ? SECRET_PENALTY : 0

    const rawScore = envPoints + validationPoints + authPoints - secretPenalty
    const finalScore = Math.min(10, Math.max(0, rawScore))

    const status = isFloor ? 'floor' : finalScore >= 5 ? 'pass' : 'fail'
    const narrative = context === 'api-design'
      ? buildApiDesignNarrative(signals)
      : buildSecurityNarrative(signals)

    return {
      score: finalScore,
      narrative,
      citations: [...signals.authPatternPaths, ...signals.suspiciousFilePaths],
      status,
      signals: {
        usesEnvironmentVariables: signals.usesEnvironmentVariables,
        hasValidationLibrary: signals.hasValidationLibrary,
        hasAuthImplementation: signals.hasAuthImplementation,
        hasSecretDetectionIssues: signals.hasSecretDetectionIssues,
        validationLibraryName: signals.validationLibraryName,
      },
    }
  }
}
