import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { WorkerModule } from './verification/worker/worker.module'
import { VerificationWorker } from './verification/worker/verification.worker'
import { WorkerHealthService } from './verification/worker/worker-health.service'
import { VerificationQueueService } from './verification/queue/queue.service'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule)
  app.get(VerificationWorker).start()
  app.get(WorkerHealthService).start()

  const queueService = app.get(VerificationQueueService)

  const scheduleStaleExpiry = () => {
    queueService.enqueueExpireStale().catch(() => undefined)
  }

  scheduleStaleExpiry()
  const staleInterval = setInterval(scheduleStaleExpiry, 30 * 60 * 1000)

  const shutdown = async () => {
    clearInterval(staleInterval)
    await app.close()
    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown())
  process.on('SIGTERM', () => void shutdown())
}

bootstrap().catch((error: unknown) => {
  process.stderr.write(`Worker bootstrap failed: ${error instanceof Error ? error.stack : String(error)}\n`)
  process.exit(1)
})
