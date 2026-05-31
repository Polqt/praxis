import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import { VERIFICATION_QUEUE, VERIFICATION_QUEUE_NAME, VerificationJobPayload } from './queue.constants'
import { VerificationQueueService } from './queue.service'
import { redisConnectionOptions } from './redis-connection'

@Module({
  providers: [
    {
      provide: VERIFICATION_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('redis.url')
        if (!redisUrl) throw new Error('REDIS_URL is required')

        return new Queue<VerificationJobPayload>(VERIFICATION_QUEUE_NAME, {
          connection: redisConnectionOptions(redisUrl),
        })
      },
    },
    VerificationQueueService,
  ],
  exports: [VERIFICATION_QUEUE, VerificationQueueService],
})
export class QueueModule {}
