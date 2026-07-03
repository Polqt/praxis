import * as assert from 'node:assert/strict'
import { parseTestOutput } from './repository-execution.service'

// pytest prints failures before passes: "=== 1 failed, 2 passed in 0.5s ==="
assert.deepEqual(
  parseTestOutput('=== 1 failed, 2 passed in 0.51s ===', 'python', 1),
  { passed: 2, failed: 1, skipped: 0 },
)
assert.deepEqual(
  parseTestOutput('=== 5 passed in 0.20s ===', 'python', 0),
  { passed: 5, failed: 0, skipped: 0 },
)
assert.deepEqual(
  parseTestOutput('=== 3 passed, 1 skipped in 0.30s ===', 'python', 0),
  { passed: 3, failed: 0, skipped: 1 },
)

// Django test runner
assert.deepEqual(
  parseTestOutput('Ran 4 tests in 0.1s\n\nOK', 'python', 0),
  { passed: 4, failed: 0, skipped: 0 },
)

// Jest summary line
assert.deepEqual(
  parseTestOutput('Tests: 1 failed, 7 passed, 8 total', 'typescript', 1),
  { passed: 7, failed: 1, skipped: 0 },
)

// Mocha summary
assert.deepEqual(
  parseTestOutput('  10 passing (2s)\n  1 failing', 'javascript', 1),
  { passed: 10, failed: 1, skipped: 0 },
)

// Unparseable output with non-zero exit counts as one failure
assert.deepEqual(
  parseTestOutput('garbage output', 'python', 2),
  { passed: 0, failed: 1, skipped: 0 },
)
