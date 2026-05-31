export interface IngestedFile {
  path: string
  kind: 'manifest' | 'test' | 'ci' | 'docker' | 'deployment' | 'doc' | 'source' | 'migration' | 'auth'
  size: number
  content?: string
}

export interface RepositoryIngestionData {
  repository: {
    id: number
    fullName: string
    defaultBranch: string
    commitSha: string
  }
  files: IngestedFile[]
  skipped: {
    path: string
    reason: string
  }[]
  limits: {
    maxTreeFiles: number
    maxSelectedFiles: number
    maxFileBytes: number
    maxTotalBytes: number
  }
}

export interface GitHubTreeEntry {
  path: string
  type: 'blob' | 'tree'
  size?: number
  sha: string
}
