'use strict'

const { spawnSync } = require('node:child_process')
const { readdirSync, statSync } = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..', 'src')
const API_DIR = path.resolve(__dirname, '..')
const tsNodeBin = path.resolve(API_DIR, 'node_modules', 'ts-node', 'dist', 'bin.js')
const tsConfig = path.resolve(API_DIR, 'tsconfig.json')

function findSpecs(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findSpecs(full))
    } else if (entry.endsWith('.spec.ts')) {
      results.push(full)
    }
  }
  return results
}

const specs = findSpecs(ROOT)

if (specs.length === 0) {
  console.log('No spec files found.')
  process.exit(0)
}

let passed = 0
let failed = 0
const failures = []

for (const spec of specs) {
  const rel = path.relative(ROOT, spec)
  const result = spawnSync(process.execPath, [
    tsNodeBin,
    '--project', tsConfig,
    '--transpile-only',
    spec,
  ], { cwd: API_DIR, encoding: 'utf8' })

  if (result.status === 0 && !result.error) {
    console.log(`  ✓ ${rel}`)
    passed++
  } else {
    const output = ((result.stdout || '') + (result.stderr || '')).trim()
    console.error(`  ✗ ${rel}`)
    if (output) console.error(output)
    failures.push(rel)
    failed++
  }
}

console.log(`\n${passed} passed, ${failed} failed`)

if (failed > 0) {
  console.error('\nFailed specs:')
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
