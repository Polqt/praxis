'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import type { TaskWithStatus } from '@praxis/shared'
import { CodeEditor } from '@/components/CodeEditor'
import { CoachPanel } from '@/components/CoachPanel'
import { VerifiedOverlay } from '@/components/VerifiedOverlay'
import { StatusPill } from '@/components/StatusPill'
import { useVerification } from '@/hooks/useVerification'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function TaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params)
  const router = useRouter()
  const [task, setTask] = useState<TaskWithStatus | null>(null)
  const [code, setCode] = useState('')
  const [activeTab, setActiveTab] = useState<'description' | 'editor'>('description')
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  const { status, feedback, rawOutput, attempts, verify, reset } = useVerification(taskId)

  useEffect(() => {
    apiClient.getTask(taskId)
      .then((t) => {
        setTask(t)
        setCode(t.latestCode ?? t.starterCode)
      })
      .catch(() => router.push('/tasks'))
  }, [taskId, router])

  useEffect(() => {
    if (status === 'verified') setShowOverlay(true)
  }, [status])

  if (!task) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-6 w-32 rounded bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {showOverlay && (
        <VerifiedOverlay
          skillTags={task.skillTags}
          onDismiss={() => setShowOverlay(false)}
        />
      )}

      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b bg-card shrink-0">
        <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Tasks
        </Link>
        <span className="font-semibold text-foreground">{task.title}</span>
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="outline">{task.language.toUpperCase()}</Badge>
          <StatusPill status={task.status} />
        </div>
      </div>

      {/* Main panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="flex flex-col" style={{ width: '55%' }}>
          {/* Tabs */}
          <div className="flex border-b bg-card shrink-0">
            {(['description', 'editor'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
                  activeTab === tab
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'description' ? (
              <div className="p-6">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground font-sans">
                  {task.description}
                </pre>
              </div>
            ) : (
              <div className="h-full p-3">
                <CodeEditor value={code} onChange={setCode} language={task.language} />
              </div>
            )}
          </div>

          {/* Bottom action bar */}
          <div className="border-t bg-card shrink-0">
            <div className="flex items-center gap-3 px-4 py-3">
              <Button
                onClick={() => { setActiveTab('editor'); verify(code) }}
                disabled={status === 'running'}
              >
                {status === 'running' ? '⟳ Running...' : '▶ Run & Verify'}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setCode(task.starterCode); reset() }}
              >
                ↺ Reset
              </Button>
            </div>

            {/* Terminal toggle */}
            <div className="border-t">
              <button
                onClick={() => setTerminalOpen((o) => !o)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{terminalOpen ? '▾' : '▸'}</span> TERMINAL
              </button>
              {terminalOpen && (
                <div className="px-4 pb-3 max-h-40 overflow-auto bg-muted font-mono text-xs text-muted-foreground">
                  <pre>{rawOutput || '> No output yet'}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-hidden">
          <CoachPanel
            status={status}
            feedback={feedback}
            attempts={attempts}
            skillTags={task.skillTags}
            onRetry={() => verify(code)}
            onNextTask={() => router.push('/tasks')}
          />
        </div>
      </div>
    </div>
  )
}
