import { Inject, Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import {
  DEFAULT_JOB_OPTIONS,
  VERIFICATION_JOB_NAMES,
  VERIFICATION_QUEUE,
  VerificationJobName,
  VerificationJobPayload,
} from './queue.constants'

@Injectable()
export class VerificationQueueService {
  constructor(@Inject(VERIFICATION_QUEUE) private readonly queue: Queue<VerificationJobPayload>) {}

  enqueueIngestRepo(submissionId: string) {
    return this.enqueue(VERIFICATION_JOB_NAMES.ingestRepo, submissionId)
  }

  enqueueAnalyzeProject(submissionId: string) {
    return this.enqueue(VERIFICATION_JOB_NAMES.analyzeProject, submissionId)
  }

  enqueueGenerateReport(submissionId: string) {
    return this.enqueue(VERIFICATION_JOB_NAMES.generateReport, submissionId)
  }

  enqueueAwardSkills(submissionId: string) {
    return this.enqueue(VERIFICATION_JOB_NAMES.awardSkills, submissionId)
  }

  enqueueExpireStale() {
    return this.queue.add(
      VERIFICATION_JOB_NAMES.expireStaleSubmission,
      { submissionId: '' },
      { jobId: 'expire-stale-recurring', removeOnComplete: true },
    )
  }

  private enqueue(name: VerificationJobName, submissionId: string) {
    return this.queue.add(name, { submissionId }, {
      ...DEFAULT_JOB_OPTIONS,
      jobId: `${name}-${submissionId}`,
    })
  }
}
