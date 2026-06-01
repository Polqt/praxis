import * as assert from 'node:assert/strict'
import { DeploymentScorer } from './deployment.scorer'
import { weakDeployment, weakRepoFixture } from '../fixtures/weak-repo.fixture'
import { averageDeployment, averageRepoFixture } from '../fixtures/average-repo.fixture'
import { strongDeployment, strongRepoFixture } from '../fixtures/strong-repo.fixture'
import type { DeploymentSignals } from '../signals/deployment.signals'

const scorer = new DeploymentScorer()

// Weak fixture — no CI, no Dockerfile → floor
const weakResult = scorer.score(weakDeployment)
const { min: weakMin, max: weakMax } = weakRepoFixture.expectedScoreRanges.deployment
assert.ok(weakResult.score >= weakMin && weakResult.score <= weakMax,
  `Weak score ${weakResult.score} not in [${weakMin}, ${weakMax}]`)
assert.equal(weakResult.status, 'floor', 'No CI and no Dockerfile must produce floor status')
assert.ok(weakResult.narrative.toLowerCase().includes('no deployment'),
  `Weak narrative must mention no deployment config, got: "${weakResult.narrative}"`)

// Average fixture — Dockerfile + CI → 5
const avgResult = scorer.score(averageDeployment)
const { min: avgMin, max: avgMax } = averageRepoFixture.expectedScoreRanges.deployment
assert.ok(avgResult.score >= avgMin && avgResult.score <= avgMax,
  `Average score ${avgResult.score} not in [${avgMin}, ${avgMax}]`)
assert.ok(avgResult.narrative.includes('Dockerfile'),
  `Average narrative must mention Dockerfile, got: "${avgResult.narrative}"`)
assert.ok(avgResult.narrative.includes('CI workflow'),
  `Average narrative must mention CI workflow, got: "${avgResult.narrative}"`)

// Strong fixture — all signals → 10
const strongResult = scorer.score(strongDeployment)
const { min: strongMin, max: strongMax } = strongRepoFixture.expectedScoreRanges.deployment
assert.ok(strongResult.score >= strongMin && strongResult.score <= strongMax,
  `Strong score ${strongResult.score} not in [${strongMin}, ${strongMax}]`)
assert.ok(strongResult.narrative.includes('deployment workflow'),
  `Strong narrative must mention deployment workflow, got: "${strongResult.narrative}"`)

// Floor condition explicit test
const floorSignals: DeploymentSignals = {
  hasDockerfile: false, hasDockerCompose: false, hasCiWorkflow: false,
  hasDeploymentWorkflow: false, hasInfrastructureConfig: false, detectedDeploymentFiles: [],
}
assert.equal(scorer.score(floorSignals).status, 'floor', 'No Docker + no CI must be floor')

// Dockerfile alone does NOT trigger floor
const dockerfileOnly: DeploymentSignals = {
  ...floorSignals, hasDockerfile: true, detectedDeploymentFiles: ['Dockerfile'],
}
assert.notEqual(scorer.score(dockerfileOnly).status, 'floor', 'Dockerfile alone must not be floor')

console.log('deployment.scorer: all tests passed')
