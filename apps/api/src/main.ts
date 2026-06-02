import 'reflect-metadata'
import { NestFactory, HttpAdapterHost } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/global-exception.filter'
import { WorkerHealthService } from './verification/worker/worker-health.service'
import { VerificationQueueService } from './verification/queue/queue.service'
import { VerificationWorker } from './verification/worker/verification.worker'

async function bootstrap() {
  const corsOrigin = process.env.CORS_ORIGIN
  if (!corsOrigin) throw new Error('CORS_ORIGIN environment variable is required')

  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const logger = new Logger('Bootstrap')

  app.setGlobalPrefix('api')
  app.enableCors({ origin: corsOrigin })

  app.use((req: { requestId: string }, _res: unknown, next: () => void) => {
    req.requestId = randomUUID()
    next()
  })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter))

  const port = process.env.PORT ?? 4000
  await app.listen(port)
  logger.log(`API listening on port ${port}`)

  app.get(VerificationWorker).start()
  app.get(WorkerHealthService).start()

  const queueService = app.get(VerificationQueueService)
  const scheduleStaleExpiry = () => { queueService.enqueueExpireStale().catch(() => undefined) }
  scheduleStaleExpiry()
  const staleInterval = setInterval(scheduleStaleExpiry, 30 * 60 * 1000)

  process.on('SIGTERM', () => { clearInterval(staleInterval) })
}

bootstrap()
