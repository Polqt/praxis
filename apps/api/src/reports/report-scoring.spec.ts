import * as assert from 'node:assert/strict'
import { scoreReport } from './report-scoring'

const rubric = {
  categories: [
    { name: 'Testing', weight: 50, floor: 5 },
    { name: 'Deployment', weight: 50, floor: 0 },
  ],
}

const passing = scoreReport(rubric, {
  analyzerVersion: 'deterministic-v1',
  hardSignals: {
    tests: { present: true, confidence: 1, citations: ['src/a.test.ts'] },
    ci: { present: true, confidence: 1, citations: ['.github/workflows/ci.yml'] },
    envUsage: { present: true, confidence: 1, citations: ['src/config.ts'] },
    migrations: { present: true, confidence: 1, citations: ['prisma/migrations/1.sql'] },
    auth: { present: true, confidence: 1, citations: ['src/auth.ts'] },
    documentation: { present: true, confidence: 1, citations: ['README.md'] },
    dependencyRisk: { level: 'low', citations: ['package.json'] },
    deployment: { present: true, confidence: 1, citations: ['Dockerfile'] },
  },
}, 70)

assert.equal(passing.verdict, 'verified')
assert.equal(passing.compositeScore, 100)

const floorFailure = scoreReport(rubric, {
  ...passing.analysisData,
  hardSignals: {
    ...passing.analysisData.hardSignals,
    tests: { present: false, confidence: 0, citations: [] },
  },
}, 70)

assert.equal(floorFailure.verdict, 'insufficient')
assert.equal(floorFailure.categoryScores.Testing.score, 0)
