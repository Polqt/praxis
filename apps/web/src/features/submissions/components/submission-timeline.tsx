'use client'

import { IconCheck, IconX } from '@tabler/icons-react'
import { PIPELINE_STAGES, TERMINAL_STAGE_LABELS, TERMINAL_STATUSES } from '@/features/submissions/constants'
import { formatDate } from '@/lib/praxis-format'
import type { ProjectSubmission, ProjectSubmissionEvent, SubmissionStatus } from '@praxis/shared'

type Props = {
  submission: ProjectSubmission
  events: ProjectSubmissionEvent[]
}

type StepState = 'completed' | 'active' | 'pending' | 'failed'

function getTimestamp(stageIndex: number, events: ProjectSubmissionEvent[]): string | null {
  const stage = PIPELINE_STAGES[stageIndex]
  if (!stage) return null
  if (stage.toStatus === null) return events[0]?.createdAt ?? null
  return events.find((e) => e.toStatus === stage.toStatus)?.createdAt ?? null
}

const FAILED_STATUSES = ['failed', 'ingestion_failed', 'analysis_failed', 'report_generation_failed', 'expired']

export function SubmissionTimeline({ submission, events }: Props) {
  const status = submission.status
  const isTerminal = TERMINAL_STATUSES.includes(status)
  const isFailed = FAILED_STATUSES.includes(status)
  const pipelineStatusIndex = PIPELINE_STAGES.findIndex((s) => s.toStatus === status)
  const terminalLabel = TERMINAL_STAGE_LABELS[status as SubmissionStatus] ?? statusLabel(status)

  const allStages = [
    ...PIPELINE_STAGES,
    ...(isTerminal ? [{ key: 'terminal', label: terminalLabel, toStatus: status as SubmissionStatus }] : []),
  ]

  function getState(index: number): StepState {
    if (index === allStages.length - 1 && isTerminal) {
      return isFailed ? 'failed' : 'completed'
    }
    if (isFailed) {
      if (index < pipelineStatusIndex) return 'completed'
      if (index === pipelineStatusIndex) return 'failed'
      return 'pending'
    }
    if (isTerminal) return 'completed'
    if (index === 0) return events.length > 0 ? 'completed' : 'active'
    if (pipelineStatusIndex === -1) return index === 0 ? 'active' : 'pending'
    if (index < pipelineStatusIndex) return 'completed'
    if (index === pipelineStatusIndex) return 'active'
    return 'pending'
  }

  return (
    <div className="space-y-0">
      {allStages.map((stage, index) => {
        const state = getState(index)
        const isLast = index === allStages.length - 1

        const ts = state === 'completed' || state === 'failed'
          ? (stage.key === 'terminal'
            ? (events.find((e) => e.toStatus === status)?.createdAt ?? null)
            : getTimestamp(index, events))
          : null

        return (
          <div key={stage.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={[
                'size-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10',
                state === 'completed' ? 'bg-green-500 border-green-500' : '',
                state === 'active' ? 'bg-primary border-primary' : '',
                state === 'failed' ? 'bg-destructive border-destructive' : '',
                state === 'pending' ? 'bg-background border-border' : '',
              ].join(' ')}>
                {state === 'completed' && <IconCheck size={13} className="text-white" strokeWidth={2.5} />}
                {state === 'active' && <span className="size-2 rounded-full bg-white animate-pulse" />}
                {state === 'failed' && <IconX size={13} className="text-white" strokeWidth={2.5} />}
                {state === 'pending' && <span className="size-2 rounded-full bg-muted-foreground/30" />}
              </div>
              {!isLast && (
                <div className={[
                  'w-0.5 flex-1 my-1',
                  state === 'completed' ? 'bg-green-500' : 'bg-border',
                ].join(' ')} style={{ minHeight: '24px' }} />
              )}
            </div>

            <div className={['pb-6 flex-1 min-w-0', isLast ? 'pb-0' : ''].join(' ')}>
              <div className="flex items-center justify-between gap-4 pt-0.5">
                <span className={[
                  'text-sm font-medium',
                  state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                ].join(' ')}>
                  {stage.label}
                </span>
                {ts && (
                  <span className="text-xs text-muted-foreground shrink-0" suppressHydrationWarning>{formatDate(ts)}</span>
                )}
              </div>
              {state === 'active' && (
                <p className="text-xs text-muted-foreground mt-1">In progress...</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
