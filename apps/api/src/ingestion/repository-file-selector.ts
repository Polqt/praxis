import { GitHubTreeEntry, IngestedFile } from './repository-ingestion.types'

const binaryExtensions = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|tar|mp4|mov|woff2?|ttf)$/i

export function classifyRepositoryFile(path: string): IngestedFile['kind'] | null {
  const normalized = path.toLowerCase()
  if (binaryExtensions.test(normalized)) return null
  if (/^(package\.json|pnpm-workspace\.yaml|go\.mod|requirements\.txt|pyproject\.toml|cargo\.toml)$/.test(normalized)) return 'manifest'
  if (normalized.startsWith('.github/workflows/') || normalized.includes('/workflows/')) return 'ci'
  if (normalized === 'dockerfile' || normalized.endsWith('/dockerfile') || normalized.includes('docker-compose')) return 'docker'
  if (normalized.includes('vercel.json') || normalized.includes('railway') || normalized.includes('render.yaml')) return 'deployment'
  if (normalized.includes('migration') || normalized.includes('schema.prisma')) return 'migration'
  if (normalized.includes('auth') || normalized.includes('jwt') || normalized.includes('session')) return 'auth'
  if (/(^|\/)(readme|docs?)(\/|\.|$)/.test(normalized) || normalized.endsWith('.md')) return 'doc'
  if (normalized.includes('.test.') || normalized.includes('.spec.') || normalized.includes('__tests__')) return 'test'
  if (/\.(ts|tsx|js|jsx|py|go|rs|java|kt|cs|rb|php)$/.test(normalized)) return 'source'
  return null
}

export function selectRepositoryFiles(
  tree: GitHubTreeEntry[],
  limits: { maxSelectedFiles: number; maxFileBytes: number },
) {
  const files: Array<Pick<IngestedFile, 'path' | 'kind' | 'size'> & { sha: string }> = []
  const skipped: { path: string; reason: string }[] = []

  for (const entry of tree) {
    if (entry.type !== 'blob') continue
    const kind = classifyRepositoryFile(entry.path)
    if (!kind) {
      skipped.push({ path: entry.path, reason: 'unsupported_file_type' })
      continue
    }
    if ((entry.size ?? 0) > limits.maxFileBytes) {
      skipped.push({ path: entry.path, reason: 'file_too_large' })
      continue
    }
    if (files.length >= limits.maxSelectedFiles) {
      skipped.push({ path: entry.path, reason: 'selected_file_limit_reached' })
      continue
    }
    files.push({ path: entry.path, kind, size: entry.size ?? 0, sha: entry.sha })
  }

  return { files, skipped }
}
