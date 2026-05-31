import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { and, eq } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { projectSubmissions, repositoryIngestions } from '../../database/schema'
import { GitHubApiService } from '../../github/github-api.service'
import { GitHubService } from '../../github/github.service'
import { parseRepoFullName } from '../../submissions/submissions.util'
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
    const { owner, repo } = parseRepoFullName(submission.githubRepoFullName)
    const repository = await this.githubApi.getRepository(accessToken, owner, repo)
    if (!repository) throw new Error('GitHub repository not found during ingestion')

    const tree = await this.githubApi.getTree(accessToken, owner, repo, submission.commitSha)
    const limits = this.limits()
    const selected = selectRepositoryFiles(tree.tree.slice(0, limits.maxTreeFiles), limits)
    let totalBytes = 0

    const files = []
    for (const file of selected.files) {
      if (totalBytes + file.size > limits.maxTotalBytes) {
        selected.skipped.push({ path: file.path, reason: 'total_byte_limit_reached' })
        continue
      }
      const content = await this.githubApi.getFileContent(accessToken, owner, repo, file.path, submission.commitSha)
      totalBytes += Buffer.byteLength(content)
      files.push({ path: file.path, kind: file.kind, size: file.size, content })
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

    const ingestion = inserted[0] ?? await this.findCached(submission.githubRepoId, submission.commitSha)
    await this.db.db.update(projectSubmissions)
      .set({ ingestedData })
      .where(eq(projectSubmissions.id, submissionId))

    return ingestion
  }

  private async getSubmission(submissionId: string) {
    const rows = await this.db.db.select().from(projectSubmissions).where(eq(projectSubmissions.id, submissionId)).limit(1)
    if (!rows[0]) throw new Error('Submission not found')
    return rows[0]
  }

  private async findCached(githubRepoId: number, commitSha: string) {
    const rows = await this.db.db.select().from(repositoryIngestions).where(and(
      eq(repositoryIngestions.githubRepoId, githubRepoId),
      eq(repositoryIngestions.commitSha, commitSha),
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
