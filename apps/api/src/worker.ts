import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { WorkerModule } from './worker/worker.module'
import { WorkerHealthService } from './worker/worker-health.service'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule)
  app.get(WorkerHealthService).start()

  const shutdown = async () => {
    await app.close()
    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown())
  process.on('SIGTERM', () => void shutdown())
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
