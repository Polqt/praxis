import { IconSparkles, IconAlertTriangle } from '@tabler/icons-react'
import { SECTION_LABEL_CLASS } from '../constants'
import type { AiReview } from '../types'

type Props = {
  review: AiReview | null
}

export function AiEvidenceReviewSection({ review }: Props) {
  if (!review) return null

  const missed = review.possibleMissedEvidence ?? []
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-start gap-3">
        <IconSparkles size={16} className="text-muted-foreground mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className={SECTION_LABEL_CLASS}>AI evidence second pass</p>
          <p className="text-sm text-muted-foreground mt-2">
            Advisory only. This review can identify evidence the deterministic analyzer may have missed, but it does not change scores or verdicts.
          </p>
        </div>
      </div>

      {review.status !== 'success' ? (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <IconAlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span>{review.errorMessage ?? 'AI review did not complete for this report.'}</span>
        </div>
      ) : missed.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No possible missed evidence was found.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {missed.map((item) => (
            <div key={`${item.category}-${item.path}`} className="rounded-md border bg-muted/30 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{item.category}</p>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {Math.round(item.confidence * 100)}% confidence
                </span>
              </div>
              <p className="mt-1 text-xs font-mono text-muted-foreground break-all">{item.path}</p>
              <p className="mt-2 text-xs text-muted-foreground">{item.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
