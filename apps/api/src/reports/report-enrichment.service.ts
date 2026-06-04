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

const SYSTEM_PROMPT = `You are a senior engineer writing concise, honest verification report narratives for a developer skill platform. You receive deterministic signal data extracted from a real GitHub repository and write clear prose that explains what was found and why it matters. Be direct and specific. Never invent signals that aren't in the data. Never pad with filler. Max 2 sentences per category narrative. When asked for JSON, respond with only the raw JSON object — no markdown fences, no explanation.`

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
Composite score: ${compositeScore}/100
Top strengths: ${strengths.join(', ') || 'none'}
Areas below threshold: ${weaknesses.join(', ') || 'none'}

Write a single sentence public summary (max 25 words) that honestly describes this verification result. Do not mention the word "deterministic".`
}

@Injectable()
export class ReportEnrichmentService {
  private readonly logger = new Logger(ReportEnrichmentService.name)
  private readonly client: Anthropic | null
  private readonly model: string

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('anthropic.apiKey')
    this.model = this.config.get<string>('anthropic.model') ?? 'claude-haiku-4-5'
    this.client = apiKey ? new Anthropic({ apiKey, defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' } }) : null

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
    const categoryEntries = Object.entries(input.categoryScores)

    // Build a single user message containing all categories + summary request.
    // One call with prompt caching is far cheaper than N+1 separate calls.
    const categoryBlocks = categoryEntries.map(([name, entry]) =>
      buildCategoryPrompt(name, entry.score, entry.minimumScore, entry.status, entry.citations, entry.signals)
    ).join('\n\n---\n\n')

    const strengths = categoryEntries.filter(([, v]) => v.score >= 8).map(([n]) => n)
    const improvements = categoryEntries.filter(([, v]) => v.score <= 5 || v.status === 'floor').map(([n]) => n)

    const summaryBlock = buildSummaryPrompt(
      input.verdict,
      input.compositeScore,
      input.challengeTitle,
      input.repositoryName,
      strengths,
      improvements,
    )

    const combinedPrompt = `${categoryBlocks}

---

${summaryBlock}

Respond with a JSON object in exactly this shape (no markdown, no extra text):
{"narratives":{"<categoryName>":"<1-2 sentence narrative>"},"publicSummary":"<single sentence>"}`

    const raw = await this.callClaude(combinedPrompt, 1500)

    let parsed: { narratives: Record<string, string>; publicSummary: string } | null = null
    try {
      // Extract the JSON from the response (Claude may include minor framing)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
    } catch {
      this.logger.warn(`AI enrichment: failed to parse JSON response, falling back to passthrough`)
    }

    if (!parsed) return this.passthrough(input)

    const enrichedScores = { ...input.categoryScores }
    for (const [name] of categoryEntries) {
      const narrative = parsed.narratives?.[name]
      if (narrative) {
        enrichedScores[name] = { ...enrichedScores[name], narrative }
      }
    }

    this.logger.log(`AI enrichment complete for ${input.repositoryName} — ${categoryEntries.length} categories (1 call)`)

    return {
      categoryScores: enrichedScores,
      publicSummary: parsed.publicSummary || this.passthrough(input).publicSummary,
      strengths,
      improvements,
    }
  }

  private async callClaude(userPrompt: string, maxTokens = 200): Promise<string> {
    const message = await this.client!.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          // Cache the system prompt — it's identical across all calls in a report batch.
          // Reduces token cost by ~80% on repeated calls within the 5-minute cache window.
          cache_control: { type: 'ephemeral' },
        },
      ],
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
