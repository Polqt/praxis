export const VERIFICATION_QUEUE_NAME = 'verification'
export const VERIFICATION_QUEUE = Symbol('VERIFICATION_QUEUE')

export const VERIFICATION_JOB_NAMES = {
  ingestRepo: 'ingest-repo',
  executeTests: 'execute-tests',
  analyzeProject: 'analyze-project',
  generateReport: 'generate-report',
  awardSkills: 'award-skills',
  sendReportEmail: 'send-report-email',
  expireStaleSubmission: 'expire-stale-submission',
  reEnrichReport: 're-enrich-report',
} as const

export type VerificationJobName = typeof VERIFICATION_JOB_NAMES[keyof typeof VERIFICATION_JOB_NAMES]

export interface VerificationJobPayload {
  submissionId: string
  reportId?: string
}

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 10_000,
  },
  removeOnComplete: {
    count: 100,
  },
  removeOnFail: {
    count: 500,
  },
}

export const RE_ENRICH_JOB_OPTIONS = {
  attempts: 5,
  backoff: {
    type: 'fixed' as const,
    delay: 30 * 60 * 1000,
  },
  removeOnComplete: true,
  removeOnFail: {
    count: 500,
  },
}
