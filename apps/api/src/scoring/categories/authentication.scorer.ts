import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { AuthenticationSignals } from '../signals/authentication.signals'
import { buildAuthenticationNarrative } from '../narratives/narrative-builder'

const FLOOR_CONDITION = (s: AuthenticationSignals) => !s.hasAuthFiles && !s.hasJwtLibrary && !s.hasSessionOrTokenPattern

const AUTH_FILES_POINTS = 3
const JWT_LIBRARY_POINTS = 2
const PASSWORD_HASHING_POINTS = 2
const GUARD_MIDDLEWARE_POINTS = 2
const SESSION_TOKEN_POINTS = 1

export class AuthenticationScorer implements CategoryScorer<AuthenticationSignals> {
  score(signals: AuthenticationSignals): CategoryScore {
    const isFloor = FLOOR_CONDITION(signals)

    const authFilesPoints = signals.hasAuthFiles ? AUTH_FILES_POINTS : 0
    const jwtPoints = signals.hasJwtLibrary ? JWT_LIBRARY_POINTS : 0
    const passwordPoints = signals.hasPasswordHashingLibrary ? PASSWORD_HASHING_POINTS : 0
    const guardPoints = signals.hasGuardOrMiddleware ? GUARD_MIDDLEWARE_POINTS : 0
    const sessionPoints = signals.hasSessionOrTokenPattern ? SESSION_TOKEN_POINTS : 0

    const rawScore = authFilesPoints + jwtPoints + passwordPoints + guardPoints + sessionPoints
    const finalScore = Math.min(10, rawScore)

    const status = isFloor ? 'floor' : finalScore >= 5 ? 'pass' : 'fail'

    return {
      score: finalScore,
      narrative: buildAuthenticationNarrative(signals),
      citations: signals.authFilePaths,
      status,
      signals: {
        hasAuthFiles: signals.hasAuthFiles,
        hasJwtLibrary: signals.hasJwtLibrary,
        hasPasswordHashingLibrary: signals.hasPasswordHashingLibrary,
        hasGuardOrMiddleware: signals.hasGuardOrMiddleware,
        hasSessionOrTokenPattern: signals.hasSessionOrTokenPattern,
        detectedAuthLibraries: signals.detectedAuthLibraries,
      },
    }
  }
}
