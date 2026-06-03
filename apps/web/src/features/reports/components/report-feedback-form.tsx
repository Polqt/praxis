'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconCheck, IconStar } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { fadeUp } from '@/lib/animations'

type Props = {
  submissionId: string
  challengeId?: string
}

export function ReportFeedbackForm({ submissionId, challengeId }: Props) {
  const [rating, setRating] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [missedEvidence, setMissedEvidence] = useState('')
  const [notes, setNotes] = useState('')
  const [wouldShare, setWouldShare] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (rating === null) return
    setSubmitting(true)
    setError(null)
    try {
      await apiClient.submitReportFeedback(submissionId, {
        accuracyRating: rating,
        missedEvidence: missedEvidence.trim() || undefined,
        notes: notes.trim() || undefined,
        wouldShare: wouldShare ?? undefined,
      })
      setSubmitted(true)
    } catch {
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div variants={fadeUp} className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <IconCheck size={16} className="text-green-500 shrink-0" />
          <p className="text-sm text-muted-foreground">Thanks for your feedback. It helps improve the verification engine.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/submissions">Back to submissions</Link>
          </Button>
          {challengeId && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/submit?challengeId=${challengeId}`}>Resubmit with improvements</Link>
            </Button>
          )}
        </div>
      </motion.div>
    )
  }

  const displayRating = hover ?? rating

  return (
    <motion.div variants={fadeUp} className="rounded-lg border bg-card p-5">
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Report feedback</p>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">How accurate was this report?</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                className="p-0.5 transition-colors"
                aria-label={`Rate ${n} out of 5`}
              >
                <IconStar
                  size={20}
                  className={displayRating !== null && n <= displayRating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}
                />
              </button>
            ))}
            {rating !== null && (
              <span className="text-xs text-muted-foreground ml-2">
                {['', 'Not accurate', 'Slightly off', 'Mostly accurate', 'Accurate', 'Very accurate'][rating]}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Would you share this report with an employer?</p>
          <div className="flex gap-2">
            {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => setWouldShare(value)}
                className={[
                  'h-8 px-4 text-xs font-medium border rounded-md transition-colors',
                  wouldShare === value
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">
            Did Praxis miss any evidence? <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            value={missedEvidence}
            onChange={(e) => setMissedEvidence(e.target.value)}
            placeholder="e.g. My tests are in /spec but weren't detected"
            rows={2}
            className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">
            Anything else? <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any other comments about this report"
            rows={2}
            className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleSubmit} disabled={rating === null || submitting} size="sm">
          {submitting ? 'Submitting…' : 'Submit feedback'}
        </Button>
      </div>
    </motion.div>
  )
}
