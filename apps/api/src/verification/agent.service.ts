import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { SandboxResult } from './sandbox.service'

interface AgentAnalysis {
  verified: boolean
  message?: string
  feedback?: string
}

@Injectable()
export class AgentService {
  private client: Anthropic

  constructor(private config: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.config.get<string>('anthropic.apiKey'),
    })
  }

  async analyze(
    sandboxResult: SandboxResult,
    task: { title: string; language: string },
  ): Promise<AgentAnalysis> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: `You are the Praxis Verification Agent — a precise, encouraging code reviewer.
You have just run a user's code against automated tests in a secure sandbox.
Your ONLY job is to analyze the execution output and respond with a JSON object.
Rules:
- If all tests passed (stdout contains "ALL_TESTS_PASSED"):
  { "verified": true, "message": "<brief, enthusiastic, 1-sentence confirmation>" }
- If tests failed:
  { "verified": false, "feedback": "<what failed + a conceptual hint — never give the answer — max 3 sentences>" }
CRITICAL: Respond with raw JSON only. No markdown. No explanation outside the JSON.`,
        messages: [
          {
            role: 'user',
            content: `Task: ${task.title}
Language: ${task.language}

Execution stdout:
${sandboxResult.stdout || '(empty)'}

Execution stderr:
${sandboxResult.stderr || '(empty)'}

Exit code: ${sandboxResult.exitCode}`,
          },
        ],
      })

      const raw = (response.content[0] as { text: string }).text.trim()
      return JSON.parse(raw) as AgentAnalysis
    } catch {
      return sandboxResult.allTestsPassed
        ? { verified: true, message: 'All tests passed! Great work.' }
        : { verified: false, feedback: 'Some tests failed. Review your logic and try again.' }
    }
  }
}
