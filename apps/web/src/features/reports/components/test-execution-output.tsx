'use client'

import { useState } from 'react'
import { IconChevronDown, IconChevronRight, IconTerminal2 } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExecutionOutput {
  language: string
  testCommand: string
  exitCode: number
  passed: number
  failed: number
  skipped: number
  durationMs: number | null
  stdout: string | null
  stderr: string | null
  timedOut: boolean
}

type Props = {
  execution: ExecutionOutput
}

export function TestExecutionOutput({ execution }: Props) {
  const [open, setOpen] = useState(false)

  const hasOutput = execution.stdout?.trim() || execution.stderr?.trim()
  const statusColor = execution.exitCode === 0 ? 'text-green-600' : 'text-destructive'
  const durationLabel = execution.durationMs ? `${(execution.durationMs / 1000).toFixed(1)}s` : null

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <IconTerminal2 size={14} className="text-muted-foreground shrink-0" />
        <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex-1">
          Test execution output
        </span>
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <span className={statusColor}>
            {execution.timedOut ? 'Timed out' : `Exit ${execution.exitCode}`}
          </span>
          <span className="text-muted-foreground">{execution.language}</span>
          {durationLabel && <span className="text-muted-foreground">{durationLabel}</span>}
          {open ? <IconChevronDown size={13} className="text-muted-foreground" /> : <IconChevronRight size={13} className="text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-border space-y-3">
              <div className="flex gap-4 pt-3 text-xs text-muted-foreground">
                <span className="font-mono">{execution.testCommand}</span>
                {execution.passed > 0 && <span className="text-green-600">{execution.passed} passed</span>}
                {execution.failed > 0 && <span className="text-destructive">{execution.failed} failed</span>}
                {execution.skipped > 0 && <span>{execution.skipped} skipped</span>}
              </div>
              {hasOutput ? (
                <>
                  {execution.stdout?.trim() && (
                    <pre className="text-[11px] font-mono bg-muted/60 rounded-md p-3 overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed">
                      {execution.stdout.trim()}
                    </pre>
                  )}
                  {execution.stderr?.trim() && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">stderr</p>
                      <pre className="text-[11px] font-mono bg-destructive/5 border border-destructive/20 rounded-md p-3 overflow-x-auto max-h-32 whitespace-pre-wrap leading-relaxed text-destructive/80">
                        {execution.stderr.trim()}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground pt-1">No output captured.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
