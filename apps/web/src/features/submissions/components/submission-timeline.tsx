'use client'

import { SECTION_LABEL } from '@/features/studio/constants/studio.constants'
import { EVENT_TYPE_LABELS, PIPELINE_STAGES, IN_PROGRESS_STATUSES } from '@/features/submissions/constants'
import type { Submission, SubmissionEvent, SubmissionStatus } from '@/features/submissions/types'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const ORDERED_STATUSES: Array<SubmissionStatus | 'created'> = [
  'created',
  'queued',
  'ingesting',
  'analyzing',
  'generating_report',
  'verified',
]

function currentStatusIndex(status: SubmissionStatus): number {
  return ORDERED_STATUSES.indexOf(status)
}

type TimelineEvent = {
  key: string
  label: string
  time: string | null
  metadata: Record<string, unknown> | null
  state: 'completed' | 'active' | 'pending'
}

function buildTimeline(submission: Submission): TimelineEvent[] {
  const isInProgress = IN_PROGRESS_STATUSES.includes(submission.status)
  const currentIdx = currentStatusIndex(submission.status)

  if (!isInProgress) {
    return submission.events.map((e) => ({
      key: e.id,
      label: EVENT_TYPE_LABELS[e.type] ?? e.type,
      time: e.createdAt,
      metadata: e.metadata,
      state: 'completed' as const,
    }))
  }

  const completedEvents: TimelineEvent[] = submission.events.map((e) => ({
    key: e.id,
    label: EVENT_TYPE_LABELS[e.type] ?? e.type,
    time: e.createdAt,
    metadata: e.metadata,
    state: 'completed' as const,
  }))

  const pendingStages = PIPELINE_STAGES.filter((stage) => {
    const idx = ORDERED_STATUSES.indexOf(stage.status)
    return idx > currentIdx
  })

  const pendingEvents: TimelineEvent[] = pendingStages.map((stage) => ({
    key: `pending-${stage.status}`,
    label: stage.label,
    time: null,
    metadata: null,
    state: 'pending' as const,
  }))

  if (completedEvents.length > 0) {
    completedEvents[completedEvents.length - 1] = {
      ...completedEvents[completedEvents.length - 1],
      state: 'active',
      time: null,
    }
  }

  return [...completedEvents, ...pendingEvents]
}

type Props = {
  submission: Submission
}

export function SubmissionTimeline({ submission }: Props) {
  const events = buildTimeline(submission)

  return (
    <div>
      <p className={`${SECTION_LABEL} mb-5`}>Verification timeline</p>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events yet.</p>
      ) : (
        <div className="relative">
          {events.map((event, i) => {
            const isLast = i === events.length - 1

            return (
              <div key={event.key} className="flex gap-4">
                <div className="w-20 shrink-0 text-right pt-0.5">
                  {event.time && (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {formatTime(event.time)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full shrink-0 flex items-center justify-center mt-0.5">
                    {event.state === 'completed' && (
                      <span className="size-2.5 rounded-full bg-green-500 inline-block" />
                    )}
                    {event.state === 'active' && (
                      <span className="size-3 rounded-full bg-primary animate-pulse inline-block" />
                    )}
                    {event.state === 'pending' && (
                      <span className="size-2.5 rounded-full border border-muted-foreground/30 inline-block" />
                    )}
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-border/60 my-1" style={{ minHeight: '24px' }} />
                  )}
                </div>

                <div className="pb-5 min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      event.state === 'completed'
                        ? 'text-foreground font-medium'
                        : event.state === 'active'
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {event.label}
                  </p>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {Object.entries(event.metadata)
                        .filter(([, v]) => v !== null && v !== undefined)
                        .map(([k, v]) => `${k}: ${String(v)}`)
                        .join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
