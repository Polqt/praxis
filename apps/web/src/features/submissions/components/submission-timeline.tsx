'use client'

import { motion } from 'framer-motion'
import { IconCheck, IconX, IconRefresh } from '@tabler/icons-react'
import { PIPELINE_STAGES, TERMINAL_STAGE_LABELS, TERMINAL_STATUSES, FAILED_STATUSES } from '../constants'
import { formatDate, statusLabel } from '@/lib/praxis-format'
import { staggerContainer, fadeUp } from '@/lib/animations'
import type { ProjectSubmission, ProjectSubmissionEvent, SubmissionStatus } from '@praxis/shared'

const EXTRA_EVENT_LABELS: Record<string, string> = {
  submission_cancelled: 'Cancelled',
  submission_requeued:  'Re-queued',
  submission_retried:   'Retried',
}

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

const TIMELINE_FAILED_STATUSES = [...FAILED_STATUSES, 'expired'] as const

export function SubmissionTimeline({ submission, events }: Props) {
  const status = submission.status
  const isTerminal = TERMINAL_STATUSES.includes(status)
  const isFailed = TIMELINE_FAILED_STATUSES.includes(status as typeof TIMELINE_FAILED_STATUSES[number])
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

  const extraEvents = events.filter((e) => e.reason && EXTRA_EVENT_LABELS[e.reason])

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-0"
    >
      {extraEvents.length > 0 && (
        <div className="mb-4 space-y-2">
          {extraEvents.map((e) => (
            <motion.div key={e.id} variants={fadeUp} className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <IconRefresh size={13} className="shrink-0" />
              <span className="font-medium text-foreground">{EXTRA_EVENT_LABELS[e.reason!]}</span>
              <span suppressHydrationWarning>{formatDate(e.createdAt)}</span>
            </motion.div>
          ))}
          <div className="border-t border-border my-3" />
        </div>
      )}
      {allStages.map((stage, index) => {
        const state = getState(index)
        const isLast = index === allStages.length - 1

        const ts = state === 'completed' || state === 'failed'
          ? (stage.key === 'terminal'
            ? (events.find((e) => e.toStatus === status)?.createdAt ?? null)
            : getTimestamp(index, events))
          : null

        return (
          <motion.div key={stage.key} variants={fadeUp} className="flex gap-4">
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
          </motion.div>
        )
      })}
    </motion.div>
  )
}
