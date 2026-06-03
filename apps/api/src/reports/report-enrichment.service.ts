import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'

interface CategoryScoreEntry {
  score: number
  narrative: string
  citations: string[]
  status: string
  minimumScore: number
  signals: Record<string, unknown>
}

interface EnrichmentInput {
  categoryScores: Record<string, CategoryScoreEntry>
  verdict: string
  compositeScore: number
  repositoryName: string
  challengeTitle: string
}

interface EnrichmentResult {
  categoryScores: Record<string, CategoryScoreEntry>
  publicSummary: string
  strengths: string[]
  improvements: string[]
}

const SYSTEM_PROMPT = `You are a senior engineer writing concise, honest verification report narratives for a developer skill platform. You receive deterministic signal data extracted from a real GitHub repository and write clear prose that explains what was found and why it matters. Be direct and specific. Never invent signals that aren't in the data. Never pad with filler. Max 2 sentences per category narrative.`

function buildCategoryPrompt(
  categoryName: string,
  score: number,
  minimumScore: number,
  status: string,
  citations: string[],
  signals: Record<string, unknown>,
): string {
  const citationList = citations.slice(0, 5).join(', ') || 'none'
  const signalSummary = JSON.stringify(signals, null, 0).slice(0, 400)
  const floorNote = status === 'floor' ? ` (floor threshold of ${minimumScore} not met — this alone causes insufficient verdict)` : ''

  return `Category: ${categoryName}
Score: ${score}/10${floorNote}
Cited files: ${citationList}
Signals: ${signalSummary}

Write a 1–2 sentence narrative explaining what was found in this category and what the developer should know. Be specific to the signals above.`
}

function buildSummaryPrompt(
  verdict: string,
  compositeScore: number,
  challengeTitle: string,
  repositoryName: string,
  strengths: string[],
  weaknesses: string[],
): string {
  return `Repository: ${repositoryName}
Challenge: ${challengeTitle}
Verdict: ${verdict}
Composite score: ${compositeScore}/10
Top strengths: ${strengths.join(', ') || 'none'}
Areas below threshold: ${weaknesses.join(', ') || 'none'}

Write a single sentence public summary (max 25 words) that honestly describes this verification result. Do not mention the word "deterministic".`
}

@Injectable()
export class ReportEnrichmentService {
  private readonly logger = new Logger(ReportEnrichmentService.name)
  private readonly client: Anthropic | null

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('anthropic.apiKey')
    this.client = apiKey ? new Anthropic({ apiKey }) : null

    if (!this.client) {
      this.logger.warn('ANTHROPIC_API_KEY not set — AI narrative enrichment disabled')
    }
  }

  get enabled(): boolean {
    return this.client !== null
  }

  async enrich(input: EnrichmentInput): Promise<EnrichmentResult> {
    if (!this.client) {
      return this.passthrough(input)
    }

    try {
      return await this.runEnrichment(input)
    } catch (err) {
      this.logger.error('AI enrichment failed — falling back to deterministic narratives', {
        error: err instanceof Error ? err.message : String(err),
        repository: input.repositoryName,
      })
      return this.passthrough(input)
    }
  }

  private async runEnrichment(input: EnrichmentInput): Promise<EnrichmentResult> {
    const enrichedScores = { ...input.categoryScores }
    const strengths: string[] = []
    const improvements: string[] = []

    // Enrich each category narrative in parallel
    const categoryEntries = Object.entries(input.categoryScores)
    const narrativeResults = await Promise.all(
      categoryEntries.map(async ([name, entry]) => {
        const prompt = buildCategoryPrompt(
          name,
          entry.score,
          entry.minimumScore,
          entry.status,
          entry.citations,
          entry.signals,
        )
        const narrative = await this.callClaude(prompt)
        return { name, narrative }
      }),
    )

    for (const { name, narrative } of narrativeResults) {
      enrichedScores[name] = { ...enrichedScores[name], narrative }

      const entry = enrichedScores[name]
      if (entry.score >= 8) strengths.push(name)
      if (entry.score <= 5 || entry.status === 'floor') improvements.push(name)
    }

    const summaryPrompt = buildSummaryPrompt(
      input.verdict,
      input.compositeScore,
      input.challengeTitle,
      input.repositoryName,
      strengths,
      improvements,
    )
    const publicSummary = await this.callClaude(summaryPrompt)

    this.logger.log(`AI enrichment complete for ${input.repositoryName} — ${categoryEntries.length} categories`)

    return { categoryScores: enrichedScores, publicSummary, strengths, improvements }
  }

  private async callClaude(userPrompt: string): Promise<string> {
    const message = await this.client!.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const block = message.content[0]
    if (block.type !== 'text') return ''
    return block.text.trim()
  }

  private passthrough(input: EnrichmentInput): EnrichmentResult {
    const strengths = Object.entries(input.categoryScores)
      .filter(([, v]) => v.score >= 8)
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 4)
      .map(([name]) => `Strong result in ${name}`)

    const improvements = Object.entries(input.categoryScores)
      .filter(([, v]) => v.score <= 6)
      .sort(([, a], [, b]) => a.score - b.score)
      .slice(0, 4)
      .map(([name]) => `Improve coverage in ${name}`)

    const publicSummary = input.verdict === 'verified'
      ? 'This project meets the Praxis verification threshold.'
      : 'This project does not yet meet the Praxis verification threshold.'

    return {
      categoryScores: input.categoryScores,
      publicSummary,
      strengths,
      improvements,
    }
  }
}
