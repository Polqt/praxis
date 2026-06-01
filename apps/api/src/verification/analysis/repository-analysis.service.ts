import { Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { projectSubmissions, repositoryAnalyses, repositoryIngestions } from '../../database/schema'
import { RepositoryIngestionData } from '../ingestion/repository-ingestion.types'
import { ANALYZER_VERSION, RepositoryAnalysisData } from './repository-analysis.types'

@Injectable()
export class RepositoryAnalysisService {
  constructor(private readonly db: DatabaseService) {}

  analyzeData(data: RepositoryIngestionData): RepositoryAnalysisData {
    const citations = (kind: string, pattern?: RegExp) => data.files
      .filter((file) => file.kind === kind || (pattern && pattern.test(`${file.path}\n${file.content ?? ''}`)))
      .map((file) => file.path)

    const envCitations = data.files
      .filter((file) => /process\.env|\.env|secret|config/i.test(`${file.path}\n${file.content ?? ''}`))
      .map((file) => file.path)

    return {
      analyzerVersion: ANALYZER_VERSION,
      hardSignals: {
        tests: this.signal(citations('test')),
        ci: this.signal(citations('ci')),
        envUsage: this.signal(envCitations),
        migrations: this.signal(citations('migration')),
        auth: this.signal(citations('auth')),
        documentation: this.signal(citations('doc')),
        dependencyRisk: {
          level: data.files.some((file) => file.path.toLowerCase().includes('package.json')) ? 'low' : 'medium',
          citations: citations('manifest'),
        },
        deployment: this.signal([...citations('deployment'), ...citations('docker')]),
      },
    }
  }

  async analyzeIngestion(repositoryIngestionId: string) {
    const cached = await this.findCached(repositoryIngestionId)
    if (cached) return cached

    const ingestions = await this.db.db
      .select()
      .from(repositoryIngestions)
      .where(eq(repositoryIngestions.id, repositoryIngestionId))
      .limit(1)
    if (!ingestions[0]) throw new Error('Repository ingestion not found')

    const analysisData = this.analyzeData(ingestions[0].ingestedData as RepositoryIngestionData)
    const inserted = await this.db.db.insert(repositoryAnalyses).values({
      repositoryIngestionId,
      analyzerVersion: ANALYZER_VERSION,
      analysisData,
    }).onConflictDoNothing().returning()

    return inserted[0] ?? await this.findCached(repositoryIngestionId)
  }

  async analyzeSubmission(submissionId: string) {
    const submissions = await this.db.db.select().from(projectSubmissions)
      .where(eq(projectSubmissions.id, submissionId))
      .limit(1)
    if (!submissions[0]) throw new Error('Submission not found')

    const ingestions = await this.db.db.select().from(repositoryIngestions).where(and(
      eq(repositoryIngestions.githubRepoId, submissions[0].githubRepoId),
      eq(repositoryIngestions.commitSha, submissions[0].commitSha),
    )).limit(1)
    if (!ingestions[0]) throw new Error('Repository ingestion not found')

    return this.analyzeIngestion(ingestions[0].id)
  }

  private signal(citations: string[]) {
    return {
      present: citations.length > 0,
      confidence: citations.length > 0 ? 1 : 0,
      citations,
    }
  }

  private async findCached(repositoryIngestionId: string) {
    const rows = await this.db.db.select().from(repositoryAnalyses).where(and(
      eq(repositoryAnalyses.repositoryIngestionId, repositoryIngestionId),
      eq(repositoryAnalyses.analyzerVersion, ANALYZER_VERSION),
    )).limit(1)
    return rows[0]
  }
}
