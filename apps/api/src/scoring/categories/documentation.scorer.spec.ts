import * as assert from 'node:assert/strict'
import { DocumentationScorer } from './documentation.scorer'
import { weakDocumentation, weakRepoFixture } from '../fixtures/weak-repo.fixture'
import { averageDocumentation, averageRepoFixture } from '../fixtures/average-repo.fixture'
import { strongDocumentation, strongRepoFixture } from '../fixtures/strong-repo.fixture'
import type { DocumentationSignals } from '../signals/documentation.signals'

const scorer = new DocumentationScorer()

// Weak fixture — README only → 2 points
const weakResult = scorer.score(weakDocumentation)
const { min: weakMin, max: weakMax } = weakRepoFixture.expectedScoreRanges.documentation
assert.ok(weakResult.score >= weakMin && weakResult.score <= weakMax,
  `Weak score ${weakResult.score} not in [${weakMin}, ${weakMax}]`)
assert.ok(weakResult.narrative.includes('README'),
  `Weak narrative must mention README, got: "${weakResult.narrative}"`)
assert.ok(weakResult.narrative.toLowerCase().includes('not found'),
  `Weak narrative must list missing docs, got: "${weakResult.narrative}"`)
assert.ok(!weakResult.narrative.toLowerCase().includes('detected: setup instructions'),
  `Weak narrative must not claim setup instructions as detected, got: "${weakResult.narrative}"`)

// Average fixture
const avgResult = scorer.score(averageDocumentation)
const { min: avgMin, max: avgMax } = averageRepoFixture.expectedScoreRanges.documentation
assert.ok(avgResult.score >= avgMin && avgResult.score <= avgMax,
  `Average score ${avgResult.score} not in [${avgMin}, ${avgMax}]`)
assert.ok(avgResult.narrative.includes('setup instructions'),
  `Average narrative must mention setup instructions, got: "${avgResult.narrative}"`)
assert.ok(avgResult.narrative.toLowerCase().includes('api documentation'),
  `Average narrative must note missing API docs, got: "${avgResult.narrative}"`)

// Strong fixture — all signals → 10
const strongResult = scorer.score(strongDocumentation)
const { min: strongMin, max: strongMax } = strongRepoFixture.expectedScoreRanges.documentation
assert.ok(strongResult.score >= strongMin && strongResult.score <= strongMax,
  `Strong score ${strongResult.score} not in [${strongMin}, ${strongMax}]`)
assert.ok(strongResult.narrative.includes('API documentation'),
  `Strong narrative must mention API documentation, got: "${strongResult.narrative}"`)

// Floor condition — no README
const noReadme: DocumentationSignals = { ...weakDocumentation, hasReadme: false, detectedDocFiles: [] }
const floorResult = scorer.score(noReadme)
assert.equal(floorResult.status, 'floor', 'Missing README must produce floor status')
assert.equal(floorResult.score, 0, 'Missing README must score 0')
assert.ok(floorResult.narrative.toLowerCase().includes('no readme'),
  `Floor narrative must mention no README, got: "${floorResult.narrative}"`)

// README only scores 2, not 10
const readmeOnly: DocumentationSignals = {
  hasReadme: true, readmeWordCount: 50, hasSetupInstructions: false, hasApiDocs: false,
  hasArchitectureDocs: false, hasContributionDocs: false, detectedDocFiles: ['README.md'],
}
assert.equal(scorer.score(readmeOnly).score, 2, 'README only must score exactly 2')

console.log('documentation.scorer: all tests passed')
