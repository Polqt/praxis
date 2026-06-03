import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

export interface SubmissionExpiredPayload {
  toEmail: string
  username: string
  repositoryName: string
  challengeTitle: string
  resubmitUrl: string
}

export interface ReportReadyPayload {
  toEmail: string
  username: string
  repositoryName: string
  challengeTitle: string
  compositeScore: number
  verdict: 'verified' | 'insufficient' | 'failed'
  reportUrl: string
  floorFailures: { category: string; score: number; minimumScore: number }[]
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private readonly fromEmail: string
  private readonly apiKey: string

  constructor(private readonly config: ConfigService) {
    this.apiKey = config.get<string>('notifications.resendApiKey') ?? ''
    this.fromEmail = config.get<string>('notifications.fromEmail') ?? 'onboarding@resend.dev'
  }

  async sendReportReady(payload: ReportReadyPayload): Promise<void> {
    if (!this.apiKey) {
      this.logger.warn('RESEND_API_KEY not set — skipping report ready email')
      return
    }
    const resend = new Resend(this.apiKey)
    const { toEmail, username, repositoryName, challengeTitle, compositeScore, verdict, reportUrl, floorFailures } = payload

    const verdictLabel = verdict === 'verified' ? 'Verified ✓' : verdict === 'insufficient' ? 'Insufficient' : 'Failed'
    const subject = `${repositoryName} scored ${compositeScore}/100 — ${verdictLabel} | Praxis`

    const floorSection = floorFailures.length > 0
      ? `
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#92400e;">Categories that missed the floor:</p>
        <ul style="margin:0 0 24px;padding-left:20px;">
          ${floorFailures.map((f) => `<li style="font-size:13px;color:#78350f;margin-bottom:4px;">${f.category}: scored ${f.score}/10, minimum required is ${f.minimumScore}/10</li>`).join('')}
        </ul>
      `
      : ''

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <div style="padding:24px 32px;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.1em;color:#6b7280;text-transform:uppercase;">Praxis</p>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Hi @${username},</p>
            <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111827;font-family:monospace;">${repositoryName}</h1>

            <div style="display:flex;gap:16px;margin-bottom:24px;">
              <div style="flex:1;background:#f3f4f6;border-radius:6px;padding:16px;">
                <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Score</p>
                <p style="margin:0;font-size:28px;font-weight:700;color:#111827;">${compositeScore}<span style="font-size:14px;font-weight:400;color:#9ca3af;">/100</span></p>
              </div>
              <div style="flex:1;background:${verdict === 'verified' ? '#f0fdf4' : '#fffbeb'};border:1px solid ${verdict === 'verified' ? '#bbf7d0' : '#fde68a'};border-radius:6px;padding:16px;">
                <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Verdict</p>
                <p style="margin:0;font-size:16px;font-weight:700;color:${verdict === 'verified' ? '#15803d' : '#b45309'};">${verdictLabel}</p>
              </div>
            </div>

            <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">Challenge: <strong style="color:#111827;">${challengeTitle}</strong></p>

            ${floorSection}

            <a href="${reportUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">View full report →</a>
          </div>
          <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">Verified by Praxis · <a href="https://praxisdev.vercel.app" style="color:#9ca3af;">praxisdev.vercel.app</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    try {
      await resend.emails.send({ from: this.fromEmail, to: toEmail, subject, html })
      this.logger.log(`Report ready email sent to ${toEmail} for ${repositoryName}`)
    } catch (err) {
      this.logger.error(`Failed to send report ready email to ${toEmail}`, err instanceof Error ? err.message : String(err))
    }
  }

  async sendSubmissionExpired(payload: SubmissionExpiredPayload): Promise<void> {
    if (!this.apiKey) return

    const resend = new Resend(this.apiKey)
    const { toEmail, username, repositoryName, challengeTitle, resubmitUrl } = payload
    const subject = `Your submission for ${repositoryName} expired | Praxis`

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <div style="padding:24px 32px;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.1em;color:#6b7280;text-transform:uppercase;">Praxis</p>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Hi @${username},</p>
            <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">Submission expired</h1>
            <p style="margin:0 0 8px;font-size:14px;color:#374151;">Your submission for <strong>${repositoryName}</strong> on the <strong>${challengeTitle}</strong> challenge stayed in progress too long and was automatically expired.</p>
            <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">This usually happens during high load. Submit again — it typically completes in 2–5 minutes.</p>
            <a href="${resubmitUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">Submit again →</a>
          </div>
          <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">Praxis · <a href="https://praxisdev.vercel.app" style="color:#9ca3af;">praxisdev.vercel.app</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    try {
      await resend.emails.send({ from: this.fromEmail, to: toEmail, subject, html })
      this.logger.log(`Expiry email sent to ${toEmail} for ${repositoryName}`)
    } catch (err) {
      this.logger.error(`Failed to send expiry email to ${toEmail}`, err instanceof Error ? err.message : String(err))
    }
  }
}
