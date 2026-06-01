import * as assert from 'node:assert/strict'
import { ArchitectureScorer } from './architecture.scorer'
import { weakArchitecture, weakRepoFixture } from '../fixtures/weak-repo.fixture'
import { averageArchitecture, averageRepoFixture } from '../fixtures/average-repo.fixture'
import { strongArchitecture, strongRepoFixture } from '../fixtures/strong-repo.fixture'
import type { ArchitectureSignals } from '../signals/architecture.signals'

const scorer = new ArchitectureScorer()

// Weak fixture — flat structure → floor
const weakResult = scorer.score(weakArchitecture)
const { min: weakMin, max: weakMax } = weakRepoFixture.expectedScoreRanges.architecture
assert.ok(weakResult.score >= weakMin && weakResult.score <= weakMax,
  `Weak score ${weakResult.score} not in [${weakMin}, ${weakMax}]`)
assert.equal(weakResult.status, 'floor', 'Flat structure must produce floor status')
assert.ok(weakResult.narrative.toLowerCase().includes('flat'),
  `Weak narrative must mention flat structure, got: "${weakResult.narrative}"`)

// Average fixture
const avgResult = scorer.score(averageArchitecture)
const { min: avgMin, max: avgMax } = averageRepoFixture.expectedScoreRanges.architecture
assert.ok(avgResult.score >= avgMin && avgResult.score <= avgMax,
  `Average score ${avgResult.score} not in [${avgMin}, ${avgMax}]`)
assert.ok(avgResult.narrative.toLowerCase().includes('layer separation'),
  `Average narrative must mention layer separation, got: "${avgResult.narrative}"`)

// Strong fixture
const strongResult = scorer.score(strongArchitecture)
const { min: strongMin, max: strongMax } = strongRepoFixture.expectedScoreRanges.architecture
assert.ok(strongResult.score >= strongMin && strongResult.score <= strongMax,
  `Strong score ${strongResult.score} not in [${strongMin}, ${strongMax}]`)
assert.ok(strongResult.narrative.includes('src/users'),
  `Strong narrative must name feature modules, got: "${strongResult.narrative}"`)

// Floor condition
const flatRepo: ArchitectureSignals = {
  hasFolderOrganization: false, hasSeparationOfConcerns: false, hasFeatureModules: false,
  hasTestOrganization: false, hasConfigOrganization: false,
  topLevelDirectories: ['src'], featureModulePaths: [],
}
assert.equal(scorer.score(flatRepo).status, 'floor', 'No folder organization must be floor')

// Top-level directory count referenced in narrative
assert.ok(weakResult.narrative.includes('1 top-level director'),
  `Narrative must reference directory count, got: "${weakResult.narrative}"`)

console.log('architecture.scorer: all tests passed')
