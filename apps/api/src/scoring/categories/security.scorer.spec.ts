import * as assert from 'node:assert/strict'
import { SecurityScorer } from './security.scorer'
import { weakSecurity, weakRepoFixture } from '../fixtures/weak-repo.fixture'
import { averageSecurity, averageRepoFixture } from '../fixtures/average-repo.fixture'
import { strongSecurity, strongRepoFixture } from '../fixtures/strong-repo.fixture'
import type { SecuritySignals } from '../signals/security.signals'

const scorer = new SecurityScorer()

// Weak fixture
const weakResult = scorer.score(weakSecurity)
const { min: weakMin, max: weakMax } = weakRepoFixture.expectedScoreRanges.security
assert.ok(weakResult.score >= weakMin && weakResult.score <= weakMax,
  `Weak score ${weakResult.score} not in [${weakMin}, ${weakMax}]`)
assert.ok(weakResult.narrative.toLowerCase().includes('no authentication'),
  `Weak narrative must note no auth, got: "${weakResult.narrative}"`)
assert.ok(weakResult.narrative.toLowerCase().includes('no input validation'),
  `Weak narrative must note no validation, got: "${weakResult.narrative}"`)

// Average fixture
const avgResult = scorer.score(averageSecurity)
const { min: avgMin, max: avgMax } = averageRepoFixture.expectedScoreRanges.security
assert.ok(avgResult.score >= avgMin && avgResult.score <= avgMax,
  `Average score ${avgResult.score} not in [${avgMin}, ${avgMax}]`)
assert.ok(avgResult.narrative.toLowerCase().includes('authentication implementation detected'),
  `Average narrative must confirm auth detected, got: "${avgResult.narrative}"`)

// Strong fixture
const strongResult = scorer.score(strongSecurity)
const { min: strongMin, max: strongMax } = strongRepoFixture.expectedScoreRanges.security
assert.ok(strongResult.score >= strongMin && strongResult.score <= strongMax,
  `Strong score ${strongResult.score} not in [${strongMin}, ${strongMax}]`)
assert.ok(strongResult.narrative.includes('class-validator'),
  `Strong narrative must name validation library, got: "${strongResult.narrative}"`)

// Floor condition — secret detection issue
const secretIssue: SecuritySignals = {
  ...strongSecurity,
  hasSecretDetectionIssues: true,
  suspiciousFilePaths: ['.env'],
}
const floorResult = scorer.score(secretIssue)
assert.equal(floorResult.status, 'floor', 'Secret detection issues must produce floor status')
assert.ok(floorResult.narrative.toLowerCase().includes('secret detection issue'),
  `Floor narrative must reference secret issue, got: "${floorResult.narrative}"`)

// Score is never negative
const worstCase: SecuritySignals = {
  usesEnvironmentVariables: false, hasValidationLibrary: false, hasAuthImplementation: false,
  hasSecretDetectionIssues: true, validationLibraryName: null,
  authPatternPaths: [], suspiciousFilePaths: ['.env'],
}
assert.ok(scorer.score(worstCase).score >= 0, 'Score must never be negative')

console.log('security.scorer: all tests passed')
