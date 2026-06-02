import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import { DatabaseService } from '../database/database.service'
import { VERIFICATION_QUEUE_NAME } from '../verification/queue/queue.constants'
import { redisConnectionOptions } from '../verification/queue/redis-connection'

type ComponentStatus = 'ok' | 'fail'

interface ComponentResult {
  status: ComponentStatus
  message?: string
}

export interface ReadinessResult {
  status: 'ok' | 'degraded'
  components: {
    database: ComponentResult
    redis: ComponentResult
    worker: ComponentResult
  }
  queue?: {
    waiting: number
    active: number
    failed: number
  }
}

@Injectable()
export class HealthService implements OnModuleDestroy {
  private readonly redis: IORedis
  private readonly queue: Queue

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {
    const redisUrl = config.get<string>('redis.url')
    if (!redisUrl) throw new Error('REDIS_URL is required')
    this.redis = new IORedis(redisUrl, { maxRetriesPerRequest: null })
    this.queue = new Queue(VERIFICATION_QUEUE_NAME, {
      connection: redisConnectionOptions(redisUrl),
    })
  }

  async ready(): Promise<ReadinessResult> {
    const heartbeatKey = this.config.get<string>('verificationPipeline.workerHeartbeatKey')!

    const [database, redis, workerHeartbeat, queueCounts] = await Promise.all([
      this.checkDb(),
      this.checkRedis(),
      this.redis.get(heartbeatKey).catch(() => null),
      this.checkQueue(),
    ])

    const worker: ComponentResult = workerHeartbeat
      ? { status: 'ok' }
      : { status: 'fail', message: 'Worker heartbeat not found — worker may be down' }

    const allOk = database.status === 'ok' && redis.status === 'ok'
    return {
      status: allOk ? 'ok' : 'degraded',
      components: { database, redis, worker },
      queue: queueCounts ?? undefined,
    }
  }

  async onModuleDestroy() {
    await Promise.all([this.redis.quit(), this.queue.close()])
  }

  private async checkDb(): Promise<ComponentResult> {
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 2000),
      )
      await Promise.race([this.db.db.execute('select 1'), timeout])
      return { status: 'ok' }
    } catch (err) {
      return { status: 'fail', message: err instanceof Error ? err.message : 'unknown' }
    }
  }

  private async checkRedis(): Promise<ComponentResult> {
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 1000),
      )
      await Promise.race([this.redis.ping(), timeout])
      return { status: 'ok' }
    } catch (err) {
      return { status: 'fail', message: err instanceof Error ? err.message : 'unknown' }
    }
  }

  private async checkQueue() {
    try {
      const [waiting, active, failed] = await Promise.all([
        this.queue.getWaitingCount(),
        this.queue.getActiveCount(),
        this.queue.getFailedCount(),
      ])
      return { waiting, active, failed }
    } catch {
      return null
    }
  }
}
