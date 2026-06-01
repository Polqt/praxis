'use client'

import { TERMINAL_MOCKUP } from '@/features/challenges/constants'

export function VerificationReportMockup() {
  const { project, author, commits, tests, deploy, aiGen, result } = TERMINAL_MOCKUP

  return (
    <div className="rounded-xl bg-[oklch(0.14_0.005_286)] overflow-hidden w-full max-w-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="size-3 rounded-full bg-red-500 inline-block" />
        <span className="size-3 rounded-full bg-amber-400 inline-block" />
        <span className="size-3 rounded-full bg-green-500 inline-block" />
        <span className="ml-2 text-[10px] uppercase tracking-widest text-white/30">
          Verification report
        </span>
      </div>
      <div className="px-5 py-5 font-mono text-[12px]">
        <div className="space-y-1.5">
          <Row label="project" value={project} />
          <Row label="author" value={`✓ ${author}`} valueClass="text-green-400" />
          <Row label="commits" value={commits} />
          <Row label="tests" value={`✓ ${tests}`} valueClass="text-green-400" />
          <Row label="deploy" value={`✓ ${deploy}`} valueClass="text-green-400" />
          <Row label="ai-gen" value={aiGen} valueClass="text-white/40" />
        </div>
        <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-white/30">result</span>
          <span className="text-[11px] font-medium bg-green-900/60 text-green-400 px-2.5 py-0.5 rounded-sm tracking-widest uppercase">
            {result}
          </span>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  valueClass = 'text-white/60',
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-white/30 shrink-0">{label}</span>
      <span className={`truncate text-right ${valueClass}`}>{value}</span>
    </div>
  )
}
