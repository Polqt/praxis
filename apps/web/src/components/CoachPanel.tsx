'use client'

import type { VerificationStatus } from '@/hooks/useVerification'
import { SkillChip } from './SkillChip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface CoachPanelProps {
  status: VerificationStatus
  feedback: string
  attempts: number
  skillTags: string[]
  onRetry: () => void
  onNextTask: () => void
}

export function CoachPanel({ status, feedback, attempts, skillTags, onRetry, onNextTask }: CoachPanelProps) {
  return (
    <div className={cn(
      'h-full flex flex-col p-6 border-l bg-card transition-colors',
      status === 'verified' && 'border-l-green-500',
      status === 'failed' && 'border-l-destructive',
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 pb-5 border-b">
        <StatusDot status={status} />
        <span className="text-sm font-semibold text-foreground">
          {status === 'idle'     && 'Praxis Agent'}
          {status === 'running'  && 'Analyzing...'}
          {status === 'verified' && 'Skill Verified!'}
          {status === 'failed'   && 'Not quite'}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        {status === 'idle' && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Write your solution and click <strong className="text-foreground">"Run & Verify"</strong> when ready.
            <br /><br />
            I'll execute your code in a live sandbox and tell you exactly what passes or fails.
          </p>
        )}

        {status === 'running' && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {(status === 'failed' || status === 'verified') && feedback && (
          <p className={cn(
            'text-sm leading-relaxed whitespace-pre-wrap',
            status === 'verified' ? 'text-green-700' : 'text-foreground',
          )}>
            {feedback}
            <span className="animate-pulse">▌</span>
          </p>
        )}

        {status === 'verified' && skillTags.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Skills Earned
            </p>
            <div className="flex flex-wrap gap-2">
              {skillTags.map((tag) => <SkillChip key={tag} name={tag} />)}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t space-y-2">
        {status === 'failed' && (
          <>
            <p className="text-xs text-center text-muted-foreground">Attempt {attempts}</p>
            <Button onClick={onRetry} className="w-full">▶ Run & Verify Again</Button>
          </>
        )}
        {status === 'verified' && (
          <Button onClick={onNextTask} variant="outline" className="w-full">→ Next Task</Button>
        )}
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: VerificationStatus }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {(status === 'idle' || status === 'running') && (
        <span className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          status === 'idle' ? 'bg-green-500' : 'bg-primary',
        )} />
      )}
      <span className={cn(
        'relative inline-flex rounded-full h-2.5 w-2.5',
        status === 'idle'     && 'bg-green-500',
        status === 'running'  && 'bg-primary',
        status === 'verified' && 'bg-green-500',
        status === 'failed'   && 'bg-destructive',
      )} />
    </span>
  )
}
