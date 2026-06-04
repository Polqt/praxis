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

  diagnostics() {
    const url = new URL(this.jwksUrl)
    return {
      jwksHost: url.host,
      keyCount: this.keys.size,
      fetchedAt: this.fetchedAt ? new Date(this.fetchedAt).toISOString() : null,
      ageSeconds: this.fetchedAt ? Math.round((Date.now() - this.fetchedAt) / 1000) : null,
    }
  }

  async refreshForHealth() {
    await this.fetchKeys()
    return this.diagnostics()
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
      const keyObject = createPublicKey({ key: jwk as unknown as import('node:crypto').JsonWebKey, format: 'jwk' })
      map.set(jwk.kid, keyObject)
    }
    this.keys = map
    this.fetchedAt = Date.now()
    this.logger.log(`JWKS loaded ${map.size} key(s)`)
  }
}
