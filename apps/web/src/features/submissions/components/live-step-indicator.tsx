'use client'

import { IconCheck, IconX } from '@tabler/icons-react'
import {
  FAILED_SUBMISSION_STATUS_SET,
  PIPELINE_STAGES,
  PIPELINE_STAGE_DESCRIPTIONS,
  TERMINAL_STATUSES,
} from '../constants'
import type { SubmissionStatus } from '@praxis/shared'
import type { SubmissionStepState } from '@/features/submissions/types'

type Props = {
  status: SubmissionStatus
}

function getStepState(index: number, currentStatusIndex: number, isFailed: boolean, isTerminal: boolean): SubmissionStepState {
  if (isFailed) {
    if (index < currentStatusIndex) return 'completed'
    if (index === currentStatusIndex) return 'failed'
    return 'pending'
  }
  if (isTerminal) return 'completed'
  if (index < currentStatusIndex) return 'completed'
  if (index === currentStatusIndex) return 'active'
  return 'pending'
}

export function LiveStepIndicator({ status }: Props) {
  const isTerminal = TERMINAL_STATUSES.includes(status)
  const isFailed = FAILED_SUBMISSION_STATUS_SET.has(status)
  const currentStatusIndex = PIPELINE_STAGES.findIndex((s) => s.toStatus === status)
  const activeStage = PIPELINE_STAGES[currentStatusIndex]

  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Verification progress</p>

      <div className="flex items-center gap-0 mb-4">
        {PIPELINE_STAGES.map((stage, index) => {
          const state = getStepState(index, currentStatusIndex, isFailed, isTerminal)
          const isLast = index === PIPELINE_STAGES.length - 1

          return (
            <div key={stage.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1">
                <div className={[
                  'size-6 rounded-full border-2 flex items-center justify-center shrink-0',
                  state === 'completed' ? 'bg-green-500 border-green-500' : '',
                  state === 'active'    ? 'bg-primary border-primary' : '',
                  state === 'failed'    ? 'bg-destructive border-destructive' : '',
                  state === 'pending'   ? 'bg-background border-border' : '',
                ].join(' ')}>
                  {state === 'completed' && <IconCheck size={11} className="text-white" strokeWidth={3} />}
                  {state === 'active'    && <span className="size-1.5 rounded-full bg-white animate-pulse" />}
                  {state === 'failed'    && <IconX size={11} className="text-white" strokeWidth={3} />}
                  {state === 'pending'   && <span className="size-1.5 rounded-full bg-muted-foreground/30" />}
                </div>
              </div>
              {!isLast && (
                <div className={[
                  'flex-1 h-0.5 mx-1',
                  state === 'completed' ? 'bg-green-500' : 'bg-border',
                ].join(' ')} />
              )}
            </div>
          )
        })}
      </div>

      {!isTerminal && activeStage && (
        <div className="flex items-start gap-2">
          <span className="size-1.5 rounded-full bg-primary animate-pulse shrink-0 mt-1.5" />
          <div>
            <p className="text-sm font-medium">{activeStage.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {PIPELINE_STAGE_DESCRIPTIONS[activeStage.key] ?? 'In progress…'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
