import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createPublicKey, KeyObject } from 'node:crypto'

interface JwkKey {
  kid: string
  kty: string
  crv?: string
  x?: string
  y?: string
  n?: string
  e?: string
  alg: string
  use: string
}

const TTL_MS = 60 * 60 * 1000 // 1 hour

@Injectable()
export class JwksService implements OnModuleInit {
  private readonly logger = new Logger(JwksService.name)
  private keys: Map<string, KeyObject> = new Map()
  private fetchedAt = 0
  private readonly jwksUrl: string

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('supabase.jwksUrl')
    if (!url) throw new Error('SUPABASE_JWKS_URL is required')
    this.jwksUrl = url
  }

  async onModuleInit() {
    await this.fetchKeys()
  }

  async getKey(kid: string): Promise<KeyObject> {
    if (Date.now() - this.fetchedAt > TTL_MS) {
      await this.fetchKeys()
    }
    const key = this.keys.get(kid)
    if (!key) throw new Error(`JWKS: no key found for kid ${kid}`)
    return key
  }

  private async fetchKeys() {
    this.logger.log(`Fetching JWKS from ${this.jwksUrl}`)
    const response = await fetch(this.jwksUrl)
    if (!response.ok) {
      throw new Error(`JWKS fetch failed: ${response.status} ${this.jwksUrl}`)
    }
    const { keys } = await response.json() as { keys: JwkKey[] }
    const map = new Map<string, KeyObject>()
    for (const jwk of keys) {
      const keyObject = createPublicKey({ key: jwk as any, format: 'jwk' })
      map.set(jwk.kid, keyObject)
    }
    this.keys = map
    this.fetchedAt = Date.now()
    this.logger.log(`JWKS loaded ${map.size} key(s)`)
  }
}
