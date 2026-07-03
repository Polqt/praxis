import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { and, eq, gte } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { projectSubmissions, repositoryIngestions } from '../../database/schema'
import { GitHubApiService } from '../../github/github-api.service'
import { GitHubService } from '../../github/github.service'
import { selectRepositoryFiles } from './repository-file-selector'
import { RepositoryIngestionData } from './repository-ingestion.types'

@Injectable()
export class RepositoryIngestionService {
  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
    private readonly githubService: GitHubService,
    private readonly githubApi: GitHubApiService,
  ) {}

  async ingestSubmission(submissionId: string) {
    const submission = await this.getSubmission(submissionId)
    const cached = await this.findCached(submission.githubRepoId, submission.commitSha)
    if (cached) return cached

    const { accessToken } = await this.githubService.getActiveToken(submission.userId)
    const parts = submission.githubRepoFullName.split('/')
    const owner = parts[0]
    const repo = parts[1]
    const repository = await this.githubApi.getRepository(accessToken, owner, repo)
    if (!repository) throw new Error('GitHub repository not found during ingestion')

    const tree = await this.githubApi.getTree(accessToken, owner, repo, submission.commitSha)
    const limits = this.limits()
    const selected = selectRepositoryFiles(tree.tree.slice(0, limits.maxTreeFiles), limits)

    // Fetch file contents in parallel batches instead of one request at a time.
    // The total byte cap is still applied in selection order after each batch.
    const FETCH_CONCURRENCY = 8
    let totalBytes = 0
    const files = []
    for (let i = 0; i < selected.files.length; i += FETCH_CONCURRENCY) {
      const batch = selected.files.slice(i, i + FETCH_CONCURRENCY)
      const contents = await Promise.all(batch.map((file) =>
        totalBytes > limits.maxTotalBytes
          ? Promise.resolve(null)
          : this.githubApi.getFileContent(accessToken, owner, repo, file.path, submission.commitSha),
      ))
      for (let j = 0; j < batch.length; j++) {
        const file = batch[j]
        const content = contents[j]
        if (content === null || totalBytes + Buffer.byteLength(content) > limits.maxTotalBytes) {
          selected.skipped.push({ path: file.path, reason: 'total_byte_limit_reached' })
          continue
        }
        totalBytes += Buffer.byteLength(content)
        files.push({ path: file.path, kind: file.kind, size: file.size, content })
      }
    }

    const ingestedData: RepositoryIngestionData = {
      repository: {
        id: repository.id,
        fullName: repository.full_name,
        defaultBranch: repository.default_branch,
        commitSha: submission.commitSha,
      },
      files,
      skipped: selected.skipped,
      limits,
    }

    const inserted = await this.db.db.insert(repositoryIngestions).values({
      githubRepoId: submission.githubRepoId,
      commitSha: submission.commitSha,
      repoFullName: submission.githubRepoFullName,
      ingestedData,
    }).onConflictDoNothing().returning()

    return inserted[0] ?? await this.findCached(submission.githubRepoId, submission.commitSha)
  }

  private async getSubmission(submissionId: string) {
    const rows = await this.db.db.select().from(projectSubmissions).where(eq(projectSubmissions.id, submissionId)).limit(1)
    if (!rows[0]) throw new Error('Submission not found')
    return rows[0]
  }

  private async findCached(githubRepoId: number, commitSha: string) {
    const ttlCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7-day TTL
    const rows = await this.db.db.select().from(repositoryIngestions).where(and(
      eq(repositoryIngestions.githubRepoId, githubRepoId),
      eq(repositoryIngestions.commitSha, commitSha),
      gte(repositoryIngestions.createdAt, ttlCutoff),
    )).limit(1)
    return rows[0]
  }

  private limits() {
    return {
      maxTreeFiles: this.config.get<number>('verificationPipeline.maxTreeFiles')!,
      maxSelectedFiles: this.config.get<number>('verificationPipeline.maxSelectedFiles')!,
      maxFileBytes: this.config.get<number>('verificationPipeline.maxFileBytes')!,
      maxTotalBytes: this.config.get<number>('verificationPipeline.maxTotalBytes')!,
    }
  }
}
