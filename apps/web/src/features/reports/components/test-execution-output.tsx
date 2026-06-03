'use client'

import { useState } from 'react'
import { IconChevronDown, IconChevronRight, IconTerminal2, IconAlertTriangle } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

// Mirrors the caps in repository-execution.service.ts
const STDOUT_CAP = 5000
const STDERR_CAP = 2000

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

  const stdout = execution.stdout?.trim() ?? ''
  const stderr = execution.stderr?.trim() ?? ''
  const hasOutput = stdout || stderr
  const stdoutTruncated = (execution.stdout?.length ?? 0) >= STDOUT_CAP
  const stderrTruncated = (execution.stderr?.length ?? 0) >= STDERR_CAP
  const statusColor = execution.timedOut || execution.exitCode !== 0 ? 'text-destructive' : 'text-green-600'
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
              {/* Timeout banner — shown prominently when execution was killed */}
              {execution.timedOut && (
                <div className="flex items-center gap-2 mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                  <IconAlertTriangle size={13} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Test execution timed out. The test runner exceeded the time limit — scores are based on file detection only.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-3 text-xs text-muted-foreground">
                <span className="font-mono break-all">{execution.testCommand}</span>
                {execution.passed > 0 && <span className="text-green-600">{execution.passed} passed</span>}
                {execution.failed > 0 && <span className="text-destructive">{execution.failed} failed</span>}
                {execution.skipped > 0 && <span>{execution.skipped} skipped</span>}
              </div>

              {hasOutput ? (
                <>
                  {stdout && (
                    <div>
                      <pre className="text-[11px] font-mono bg-muted/60 rounded-md p-3 overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed">
                        {stdout}
                      </pre>
                      {stdoutTruncated && (
                        <p className="text-[10px] text-muted-foreground mt-1 italic">… output truncated at 5000 characters</p>
                      )}
                    </div>
                  )}
                  {stderr && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">stderr</p>
                      <pre className="text-[11px] font-mono bg-destructive/5 border border-destructive/20 rounded-md p-3 overflow-x-auto max-h-32 whitespace-pre-wrap leading-relaxed text-destructive/80">
                        {stderr}
                      </pre>
                      {stderrTruncated && (
                        <p className="text-[10px] text-muted-foreground mt-1 italic">… output truncated at 2000 characters</p>
                      )}
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
