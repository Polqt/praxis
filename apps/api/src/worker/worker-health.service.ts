import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import IORedis from 'ioredis'

@Injectable()
export class WorkerHealthService implements OnModuleDestroy {
  private readonly redis: IORedis
  private readonly key: string
  private readonly ttlSeconds: number
  private interval?: NodeJS.Timeout

  constructor(config: ConfigService) {
    const redisUrl = config.get<string>('redis.url')
    if (!redisUrl) throw new Error('REDIS_URL is required')

    this.redis = new IORedis(redisUrl, { maxRetriesPerRequest: null })
    this.key = config.get<string>('verificationPipeline.workerHeartbeatKey')!
    this.ttlSeconds = config.get<number>('verificationPipeline.workerHeartbeatTtlSeconds')!
  }

  start() {
    void this.beat()
    this.interval = setInterval(() => void this.beat(), Math.max(1, Math.floor(this.ttlSeconds / 2)) * 1000)
  }

  async beat() {
    await this.redis.set(this.key, new Date().toISOString(), 'EX', this.ttlSeconds)
  }

  async onModuleDestroy() {
    if (this.interval) clearInterval(this.interval)
    await this.redis.quit()
  }
}
