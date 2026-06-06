import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { repositoryAiReviews, repositoryIngestions } from '../database/schema'
import type { RepositoryAnalysisData } from '../verification/analysis/repository-analysis.types'
import type { RepositoryIngestionData } from '../verification/ingestion/repository-ingestion.types'

const PROMPT_VERSION = 'ai-evidence-review-v2'
const MAX_FILE_HINTS = 80
const MAX_CONTENT_CHARS = 600

type MissedEvidence = {
  category: string
  path: string
  reason: string
  confidence: number
}

type ReviewData = {
  possibleMissedEvidence: MissedEvidence[]
}

const SYSTEM_PROMPT = `You are an AI evidence reviewer for Praxis. Evaluate each rubric category against the repository tree and deterministic signals before selecting possible missed evidence. Do not score the project or change verdicts. Return only JSON with possibleMissedEvidence. Every item must cite an existing path from the input.`

function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): string {
  const lower = model.toLowerCase()
  const rates = lower.includes('haiku')
    ? { inputPerMillion: 0.8, outputPerMillion: 4 }
    : lower.includes('sonnet')
      ? { inputPerMillion: 3, outputPerMillion: 15 }
      : { inputPerMillion: 5, outputPerMillion: 25 }
  const cost = (inputTokens / 1_000_000) * rates.inputPerMillion + (outputTokens / 1_000_000) * rates.outputPerMillion
  return cost.toFixed(6)
}

function buildInput(analysis: RepositoryAnalysisData, ingestion: RepositoryIngestionData) {
  return {
    deterministicAnalysis: analysis,
    files: ingestion.files.slice(0, MAX_FILE_HINTS).map((file) => ({
      path: file.path,
      kind: file.kind,
      contentHint: file.content?.slice(0, MAX_CONTENT_CHARS),
    })),
  }
}

function hashInput(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

@Injectable()
export class AiEvidenceReviewService {
  private readonly logger = new Logger(AiEvidenceReviewService.name)
  private readonly client: Anthropic | null
  private readonly model: string

  constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
  ) {
    const apiKey = this.config.get<string>('anthropic.apiKey')
    this.model = this.config.get<string>('anthropic.model') ?? 'claude-haiku-4-5'
    this.client = apiKey ? new Anthropic({ apiKey }) : null
  }

  get enabled(): boolean {
    return this.client !== null
  }

  async review(repositoryAnalysisId: string, repositoryIngestionId: string, analysis: RepositoryAnalysisData) {
    if (!this.client) return null

    const ingestionRows = await this.db.db
      .select({ ingestedData: repositoryIngestions.ingestedData })
      .from(repositoryIngestions)
      .where(eq(repositoryIngestions.id, repositoryIngestionId))
      .limit(1)

    const ingestion = ingestionRows[0]?.ingestedData as RepositoryIngestionData | undefined
    if (!ingestion) return null

    const input = buildInput(analysis, ingestion)
    const inputHash = hashInput(input)
    const startedAt = Date.now()

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 1_000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Review this input and return JSON only:\n${JSON.stringify(input)}`,
        }],
      })

      const text = message.content[0]?.type === 'text' ? message.content[0].text : '{}'
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) as ReviewData : { possibleMissedEvidence: [] }
      const validPaths = new Set(input.files.map((file) => file.path))
      const safeReview: ReviewData = {
        possibleMissedEvidence: Array.isArray(parsed.possibleMissedEvidence)
          ? parsed.possibleMissedEvidence.slice(0, 20).filter((item) =>
              typeof item.category === 'string' &&
              typeof item.path === 'string' &&
              validPaths.has(item.path) &&
              typeof item.reason === 'string' &&
              typeof item.confidence === 'number' &&
              item.confidence >= 0 &&
              item.confidence <= 1,
            )
          : [],
      }

      const inputTokens = message.usage.input_tokens ?? 0
      const outputTokens = message.usage.output_tokens ?? 0
      const rows = await this.db.db.insert(repositoryAiReviews).values({
        repositoryAnalysisId,
        model: this.model,
        promptVersion: PROMPT_VERSION,
        inputHash,
        reviewData: safeReview,
        inputTokens,
        outputTokens,
        estimatedCostUsd: estimateCostUsd(this.model, inputTokens, outputTokens),
        latencyMs: Date.now() - startedAt,
        status: 'success',
      }).onConflictDoNothing().returning()

      return rows[0] ?? null
    } catch (err) {
      this.logger.warn('AI evidence review failed', {
        repositoryAnalysisId,
        message: err instanceof Error ? err.message : String(err),
      })
      await this.db.db.insert(repositoryAiReviews).values({
        repositoryAnalysisId,
        model: this.model,
        promptVersion: PROMPT_VERSION,
        inputHash,
        reviewData: { possibleMissedEvidence: [] },
        latencyMs: Date.now() - startedAt,
        status: 'failure',
        errorMessage: err instanceof Error ? err.message.slice(0, 500) : 'unknown',
      }).onConflictDoNothing()
      return null
    }
  }
}
