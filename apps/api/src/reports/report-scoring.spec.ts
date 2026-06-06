import * as assert from 'node:assert/strict'
import { scoreReport } from './report-scoring'
import type { RepositoryIngestionData } from '../verification/ingestion/repository-ingestion.types'

const rubric = {
  categories: [
    { name: 'Testing', weight: 50, floor: 5 },
    { name: 'Deployment', weight: 50, floor: 0 },
  ],
}

const richIngestion: RepositoryIngestionData = {
  repository: { id: 1, fullName: 'org/repo', defaultBranch: 'main', commitSha: 'abc123' },
  files: [
    { path: 'tests/auth.spec.ts', kind: 'test', size: 100 },
    { path: 'tests/users.spec.ts', kind: 'test', size: 100 },
    { path: 'tests/orders.spec.ts', kind: 'test', size: 100 },
    { path: 'tests/health.spec.ts', kind: 'test', size: 100 },
    { path: 'tests/integration/auth.integration.spec.ts', kind: 'test', size: 100 },
    { path: 'tests/integration/users.integration.spec.ts', kind: 'test', size: 100 },
    { path: 'src/components/table.test.tsx', kind: 'test', size: 100 },
    { path: 'Dockerfile', kind: 'docker', size: 200 },
    { path: '.github/workflows/ci.yml', kind: 'ci', size: 100 },
    { path: '.github/workflows/deploy.yml', kind: 'ci', size: 100 },
    { path: 'README.md', kind: 'doc', size: 500, content: 'Getting started\n\nInstall dependencies...' },
    { path: 'src/auth/auth.service.ts', kind: 'auth', size: 300 },
    { path: 'package.json', kind: 'manifest', size: 200, content: '{"dependencies":{"class-validator":"^0.14.0"}}' },
    { path: '.env.example', kind: 'source', size: 50, content: 'DATABASE_URL=\nSECRET_KEY=' },
    { path: 'src/controllers/users.controller.ts', kind: 'source', size: 300 },
    { path: 'src/services/users.service.ts', kind: 'source', size: 300 },
    { path: 'src/repositories/users.repository.ts', kind: 'source', size: 300 },
  ],
  skipped: [],
  limits: { maxTreeFiles: 500, maxSelectedFiles: 100, maxFileBytes: 1000000, maxTotalBytes: 10000000 },
}

const passing = scoreReport(rubric, richIngestion, 70)
assert.equal(passing.verdict, 'verified', `Expected verified but got ${passing.verdict}`)
assert.ok(passing.compositeScore >= 70, `Composite score ${passing.compositeScore} below threshold`)
assert.ok(passing.categoryScores.Testing.score >= 5, `Testing score too low: ${passing.categoryScores.Testing.score}`)
assert.ok(passing.categoryScores.Deployment.score >= 5, `Deployment score too low: ${passing.categoryScores.Deployment.score}`)
assert.equal(passing.categoryScores.Testing.weight, 50)

// Narratives reference actual signal values, not generic strings
assert.ok(!passing.categoryScores.Testing.narrative.includes('evidence found'),
  `Narrative must not be generic: "${passing.categoryScores.Testing.narrative}"`)
assert.ok(passing.categoryScores.Testing.narrative.match(/\d+ test file/),
  `Testing narrative must reference file count: "${passing.categoryScores.Testing.narrative}"`)

const executed = scoreReport(rubric, richIngestion, 70, {
  passed: 20,
  failed: 0,
  skipped: 1,
  timedOut: false,
  language: 'typescript',
})
assert.equal(executed.categoryScores.Testing.score, 10)
assert.equal(
  (executed.categoryScores.Testing.signals.execution as { passed: number }).passed,
  20,
)

// Floor failure: no test files
const noTestIngestion: RepositoryIngestionData = {
  ...richIngestion,
  files: richIngestion.files.filter((f) => f.kind !== 'test'),
}
const floorFailure = scoreReport(rubric, noTestIngestion, 70)
assert.equal(floorFailure.verdict, 'insufficient', 'No test files must produce insufficient verdict')
assert.equal(floorFailure.categoryScores.Testing.score, 0)

const frontendRubric = {
  categories: [{ name: 'Frontend Testing', weight: 100, floor: 3 }],
}
const frontendResult = scoreReport(frontendRubric, richIngestion, 50)
assert.equal(
  frontendResult.categoryScores['Frontend Testing'].signals.hasComponentTests,
  true,
  'Frontend Testing must use the frontend-specific scorer',
)

console.log('report-scoring: all tests passed')
