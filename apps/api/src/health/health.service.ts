import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import IORedis from 'ioredis'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class HealthService implements OnModuleDestroy {
  private readonly redis: IORedis

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {
    const redisUrl = config.get<string>('redis.url')
    if (!redisUrl) throw new Error('REDIS_URL is required')
    this.redis = new IORedis(redisUrl, { maxRetriesPerRequest: null })
  }

  async check() {
    const heartbeatKey = this.config.get<string>('verificationPipeline.workerHeartbeatKey')!
    const [db, redis, workerHeartbeat] = await Promise.all([
      this.checkDb(),
      this.redis.ping().then(() => 'ok' as const).catch(() => 'fail' as const),
      this.redis.get(heartbeatKey),
    ])

    return {
      api: 'ok',
      db,
      redis,
      worker: workerHeartbeat ? 'ok' : 'fail',
    }
  }

  async onModuleDestroy() {
    await this.redis.quit()
  }

  private async checkDb() {
    try {
      await this.db.db.execute('select 1')
      return 'ok' as const
    } catch {
      return 'fail' as const
    }
  }
}
