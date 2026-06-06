const { readdirSync, statSync } = require('node:fs')
const { join } = require('node:path')
const { spawnSync } = require('node:child_process')

function collectSpecs(directory) {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry)
      return statSync(path).isDirectory()
        ? collectSpecs(path)
        : path.endsWith('.spec.ts') ? [path] : []
    })
    .sort()
}

const tsNodeBin = require.resolve('ts-node/dist/bin.js')
for (const spec of collectSpecs(join(__dirname, '..', 'src'))) {
  console.log(`RUN ${spec}`)
  const result = spawnSync(process.execPath, [tsNodeBin, spec], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
