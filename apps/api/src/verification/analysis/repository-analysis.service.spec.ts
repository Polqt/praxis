import * as assert from 'node:assert/strict'
import { RepositoryAnalysisService } from './repository-analysis.service'
import { ANALYZER_VERSION } from './repository-analysis.types'

const service = new RepositoryAnalysisService(undefined as never)
const analysis = service.analyzeData({
  repository: { id: 1, fullName: 'a/b', defaultBranch: 'main', commitSha: 'abc' },
  files: [
    { path: 'package.json', kind: 'manifest', size: 10, content: '{"dependencies":{"express":"^4.0.0"}}' },
    { path: '.github/workflows/ci.yml', kind: 'ci', size: 10, content: 'pnpm test' },
    { path: 'src/auth/session.ts', kind: 'auth', size: 10, content: 'process.env.JWT_SECRET' },
    { path: 'README.md', kind: 'doc', size: 10, content: 'API setup docs' },
    { path: 'src/user.test.ts', kind: 'test', size: 10, content: 'test("x")' },
    { path: 'prisma/migrations/001.sql', kind: 'migration', size: 10, content: 'create table users' },
    { path: 'Dockerfile', kind: 'docker', size: 10, content: 'FROM node' },
  ],
  skipped: [],
  limits: { maxTreeFiles: 500, maxSelectedFiles: 80, maxFileBytes: 100, maxTotalBytes: 1000 },
})

assert.equal(analysis.analyzerVersion, ANALYZER_VERSION)
assert.equal(analysis.hardSignals.tests.present, true)
assert.equal(analysis.hardSignals.ci.present, true)
assert.equal(analysis.hardSignals.envUsage.present, true)
assert.equal(analysis.hardSignals.migrations.present, true)
assert.equal(analysis.hardSignals.auth.present, true)
assert.equal(analysis.hardSignals.deployment.present, true)
assert.equal(analysis.hardSignals.documentation.present, true)
assert.equal(analysis.hardSignals.dependencyRisk.level, 'low')
assert.deepEqual(analysis.hardSignals.tests.citations, ['src/user.test.ts'])
