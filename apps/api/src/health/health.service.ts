import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import * as jwt from 'jsonwebtoken'
import { DatabaseService } from '../database/database.service'
import { JwksService } from '../auth/jwks.service'
import { VERIFICATION_QUEUE_NAME } from '../verification/queue/queue.constants'
import { redisConnectionOptions } from '../verification/queue/redis-connection'

export interface ComponentResult {
  status: 'ok' | 'fail'
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
    private readonly jwks: JwksService,
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

  async auth(authorization?: string) {
    const configuredAlgorithms = ['ES256', 'RS256']
    const hasHs256Secret = Boolean(this.config.get<string>('supabase.jwtSecret'))
    if (hasHs256Secret) configuredAlgorithms.push('HS256')

    let jwksStatus: ComponentResult = { status: 'ok' }
    let jwks = this.jwks.diagnostics()
    try {
      jwks = await this.jwks.refreshForHealth()
    } catch (err) {
      jwksStatus = { status: 'fail', message: err instanceof Error ? err.message : 'unknown' }
    }

    const token = await this.validateSampleToken(authorization)

    return {
      status: jwksStatus.status === 'ok' && token.status !== 'invalid' ? 'ok' : 'degraded',
      supabase: {
        jwks,
        jwksStatus,
        configuredAlgorithms,
        hasHs256Secret,
      },
      token,
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

  private async validateSampleToken(authorization?: string) {
    if (!authorization?.startsWith('Bearer ')) {
      return { provided: false as const, status: 'not_provided' as const }
    }

    const token = authorization.split(' ')[1]
    const decoded = jwt.decode(token, { complete: true })
    if (!decoded || typeof decoded === 'string') {
      return { provided: true as const, status: 'invalid' as const, message: 'Token could not be decoded' }
    }

    const algorithm = decoded.header.alg
    const kid = decoded.header.kid ?? null

    try {
      let secret: jwt.Secret
      if (algorithm === 'HS256') {
        const jwtSecret = this.config.get<string>('supabase.jwtSecret')
        if (!jwtSecret) {
          return { provided: true as const, status: 'invalid' as const, alg: algorithm, kid, message: 'SUPABASE_JWT_SECRET is not configured' }
        }
        secret = jwtSecret
      } else if (algorithm === 'ES256' || algorithm === 'RS256') {
        if (!kid) {
          return { provided: true as const, status: 'invalid' as const, alg: algorithm, kid, message: 'Token missing kid' }
        }
        secret = await this.jwks.getKey(kid)
      } else {
        return { provided: true as const, status: 'invalid' as const, alg: algorithm, kid, message: 'Unsupported JWT algorithm' }
      }

      jwt.verify(token, secret, {
        algorithms: [algorithm as jwt.Algorithm],
        audience: 'authenticated',
      })
      return { provided: true as const, status: 'valid' as const, alg: algorithm, kid }
    } catch (err) {
      return {
        provided: true as const,
        status: 'invalid' as const,
        alg: algorithm,
        kid,
        message: err instanceof Error ? err.message : 'unknown',
      }
    }
  }
}
