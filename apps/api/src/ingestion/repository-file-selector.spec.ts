import * as assert from 'node:assert/strict'
import { classifyRepositoryFile, selectRepositoryFiles } from './repository-file-selector'

assert.equal(classifyRepositoryFile('package.json'), 'manifest')
assert.equal(classifyRepositoryFile('.github/workflows/ci.yml'), 'ci')
assert.equal(classifyRepositoryFile('src/auth/session.ts'), 'auth')
assert.equal(classifyRepositoryFile('prisma/migrations/001_init.sql'), 'migration')
assert.equal(classifyRepositoryFile('README.md'), 'doc')
assert.equal(classifyRepositoryFile('src/user.test.ts'), 'test')
assert.equal(classifyRepositoryFile('Dockerfile'), 'docker')
assert.equal(classifyRepositoryFile('src/index.ts'), 'source')
assert.equal(classifyRepositoryFile('image.png'), null)

const selected = selectRepositoryFiles([
  { path: 'package.json', type: 'blob', size: 100, sha: '1' },
  { path: 'src/index.ts', type: 'blob', size: 100, sha: '2' },
  { path: 'large.ts', type: 'blob', size: 999_999, sha: '3' },
  { path: 'nested', type: 'tree', sha: '4' },
], { maxSelectedFiles: 2, maxFileBytes: 1_000 })

assert.deepEqual(selected.files.map((file) => file.path), ['package.json', 'src/index.ts'])
assert.equal(selected.skipped.find((file) => file.path === 'large.ts')?.reason, 'file_too_large')
