'use client'

import { useState } from 'react'
import { IconChevronDown, IconChevronRight, IconTerminal2, IconAlertTriangle } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EXECUTION_FAILURE_PREVIEW_CAP,
  EXECUTION_PHASE_PREVIEW_CAP,
  EXECUTION_STDERR_CAP,
  EXECUTION_STDOUT_CAP,
} from '@/features/reports/constants'
import { deriveExecutionView } from '@/features/reports/utils/derive-execution-view'
import type {
  CommandResult,
  ExecutionOutput,
} from '@/features/reports/types'

type Props = {
  execution: ExecutionOutput
}

function PhaseFailureBanner({ label, result }: { label: string; result: CommandResult }) {
  const errText = result.stderr?.trim() || result.stdout?.trim()
  return (
    <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <IconAlertTriangle size={12} className="text-amber-600 shrink-0" />
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest">{label} failed</p>
      </div>
      {errText && (
        <pre className="text-[11px] font-mono text-amber-900 whitespace-pre-wrap break-all max-h-24 overflow-y-auto mt-1">
          {errText.slice(0, EXECUTION_FAILURE_PREVIEW_CAP)}
          {errText.length > EXECUTION_FAILURE_PREVIEW_CAP ? '...' : ''}
        </pre>
      )}
    </div>
  )
}

export function TestExecutionOutput({ execution }: Props) {
  const {
    buildFailed,
    displayedPhases,
    durationLabel,
    hasOutput,
    hasResults,
    installFailed,
    noTests,
    statusClassName,
    stderr,
    stderrTruncated,
    stdout,
    stdoutTruncated,
  } = deriveExecutionView(execution)
  const [open, setOpen] = useState(hasResults || installFailed || buildFailed)

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
          Sandbox execution output
        </span>
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <span className={statusClassName}>
            {execution.timedOut ? 'Timed out' : `Exit ${execution.exitCode}`}
          </span>
          <span className="text-muted-foreground">{execution.framework ?? execution.language}</span>
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
              {/* Timeout banner */}
              {execution.timedOut && (
                <div className="flex items-center gap-2 mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                  <IconAlertTriangle size={13} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Test execution timed out. The test runner exceeded the time limit — scores are based on file detection only.
                  </p>
                </div>
              )}

              {/* Install failure banner — shown when install failed and 0 tests ran */}
              {installFailed && execution.installResult && (
                <PhaseFailureBanner label="Dependency install" result={execution.installResult} />
              )}

              {/* Build failure banner — shown when build failed and 0 tests ran */}
              {buildFailed && execution.buildResult && (
                <PhaseFailureBanner label="Build" result={execution.buildResult} />
              )}

              {/* No tests and no failures = test runner likely didn't start */}
              {noTests && !installFailed && !buildFailed && execution.exitCode !== 0 && (
                <div className="flex items-center gap-2 mt-3 rounded-md bg-muted border border-border px-3 py-2">
                  <IconAlertTriangle size={13} className="text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Test runner may have failed to start — 0 tests detected with a non-zero exit code.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-3 text-xs text-muted-foreground">
                <span className="font-mono break-all">{execution.testCommand}</span>
                {execution.passed > 0 && <span className="text-green-600">{execution.passed} passed</span>}
                {execution.failed > 0 && <span className="text-destructive">{execution.failed} failed</span>}
                {execution.skipped > 0 && <span>{execution.skipped} skipped</span>}
              </div>

              {execution.publicSummary && (
                <p className="text-xs text-muted-foreground">{execution.publicSummary}</p>
              )}

              {displayedPhases.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {displayedPhases.map((item) => {
                    const logPreview = `${'stderr' in item ? item.stderr ?? '' : ''}\n${'stdout' in item ? item.stdout ?? '' : ''}`.trim()
                    const duration = 'durationMs' in item && typeof item.durationMs === 'number'
                      ? `${(item.durationMs / 1000).toFixed(1)}s`
                      : null
                    return (
                    <div key={`${item.phase}-${item.label}`} className="rounded-md border bg-muted/30 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.phase}</span>
                        <span className={item.timedOut || item.exitCode !== 0 ? 'text-[11px] text-destructive' : 'text-[11px] text-green-600'}>
                          {item.timedOut ? 'Timed out' : item.exitCode === 0 ? 'Passed' : `Exit ${item.exitCode}`}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-mono break-all">{item.label}</p>
                      {duration && <p className="mt-1 text-[11px] text-muted-foreground">{duration}</p>}
                      {logPreview && (
                        <pre className="mt-2 max-h-20 overflow-y-auto whitespace-pre-wrap break-all rounded bg-background/70 p-2 text-[10px] text-muted-foreground">
                          {logPreview.slice(0, EXECUTION_PHASE_PREVIEW_CAP)}
                          {logPreview.length > EXECUTION_PHASE_PREVIEW_CAP ? '...' : ''}
                        </pre>
                      )}
                    </div>
                  )})}
                </div>
              )}

              {hasOutput ? (
                <>
                  {stdout && (
                    <div>
                      <pre className="text-[11px] font-mono bg-muted/60 rounded-md p-3 overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed">
                        {stdout}
                      </pre>
                      {stdoutTruncated && (
                        <p className="text-[10px] text-muted-foreground mt-1 italic">
                          Output truncated at {EXECUTION_STDOUT_CAP} characters
                        </p>
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
                        <p className="text-[10px] text-muted-foreground mt-1 italic">
                          Output truncated at {EXECUTION_STDERR_CAP} characters
                        </p>
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
