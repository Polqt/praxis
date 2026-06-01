import * as assert from 'node:assert/strict'
import { TestingScorer } from './testing.scorer'
import { weakTesting, weakRepoFixture } from '../fixtures/weak-repo.fixture'
import { averageTesting, averageRepoFixture } from '../fixtures/average-repo.fixture'
import { strongTesting, strongRepoFixture } from '../fixtures/strong-repo.fixture'
import type { TestingSignals } from '../signals/testing.signals'

const scorer = new TestingScorer()

// Weak fixture
const weakResult = scorer.score(weakTesting)
const { min: weakMin, max: weakMax } = weakRepoFixture.expectedScoreRanges.testing
assert.ok(weakResult.score >= weakMin && weakResult.score <= weakMax,
  `Weak score ${weakResult.score} not in [${weakMin}, ${weakMax}]`)
assert.ok(weakResult.narrative.includes('1 test file'),
  `Weak narrative must reference 1 test file, got: "${weakResult.narrative}"`)
assert.ok(weakResult.narrative.includes('app.test.ts'),
  `Weak narrative must reference test file path, got: "${weakResult.narrative}"`)
assert.ok(!weakResult.narrative.toLowerCase().includes('no test files'),
  'Weak narrative should not say no test files (there is 1)')

// Average fixture
const avgResult = scorer.score(averageTesting)
const { min: avgMin, max: avgMax } = averageRepoFixture.expectedScoreRanges.testing
assert.ok(avgResult.score >= avgMin && avgResult.score <= avgMax,
  `Average score ${avgResult.score} not in [${avgMin}, ${avgMax}]`)
assert.ok(avgResult.narrative.includes('4 test files'),
  `Average narrative must reference 4 test files, got: "${avgResult.narrative}"`)
assert.ok(avgResult.narrative.toLowerCase().includes('no integration'),
  `Average narrative must note no integration tests, got: "${avgResult.narrative}"`)

// Strong fixture
const strongResult = scorer.score(strongTesting)
const { min: strongMin, max: strongMax } = strongRepoFixture.expectedScoreRanges.testing
assert.ok(strongResult.score >= strongMin && strongResult.score <= strongMax,
  `Strong score ${strongResult.score} not in [${strongMin}, ${strongMax}]`)
assert.ok(strongResult.narrative.toLowerCase().includes('coverage configuration'),
  `Strong narrative must mention coverage config, got: "${strongResult.narrative}"`)
assert.ok(strongResult.narrative.toLowerCase().includes('integration'),
  `Strong narrative must mention integration suites, got: "${strongResult.narrative}"`)

// Floor condition
const zeroFiles: TestingSignals = { ...weakTesting, testFileCount: 0, testFilePaths: [] }
const floorResult = scorer.score(zeroFiles)
assert.equal(floorResult.status, 'floor', 'Zero test files must produce floor status')
assert.equal(floorResult.score, 0, 'Zero test files must score 0')
assert.ok(floorResult.narrative.toLowerCase().includes('no test files'),
  `Floor narrative must say no test files, got: "${floorResult.narrative}"`)
assert.ok(!floorResult.narrative.toLowerCase().includes('test files detected'),
  `Floor narrative must not say "test files detected", got: "${floorResult.narrative}"`)

// Bonus: integration tests score higher than without
const withoutIntegration: TestingSignals = { ...averageTesting, hasIntegrationTests: false }
const withIntegration: TestingSignals = { ...averageTesting, hasIntegrationTests: true }
const noIntegScore = scorer.score(withoutIntegration).score
const withIntegScore = scorer.score(withIntegration).score
assert.ok(withIntegScore > noIntegScore,
  `Integration bonus must increase score: ${withIntegScore} > ${noIntegScore}`)

console.log('testing.scorer: all tests passed')
