import type { ReportStatus } from '@/features/reports/types'

// Score color thresholds: >=8 green, 6-7 amber, <=5 red
export const SCORE_HIGH_THRESHOLD = 8
export const SCORE_MID_THRESHOLD = 6

export function scoreColorClass(score: number): string {
  if (score >= SCORE_HIGH_THRESHOLD) return 'bg-green-500'
  if (score >= SCORE_MID_THRESHOLD) return 'bg-amber-500'
  return 'bg-red-500'
}

export const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string }> = {
  verified: {
    label: 'Verified',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  insufficient: {
    label: 'Insufficient',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}
