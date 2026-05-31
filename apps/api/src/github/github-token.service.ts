import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const VERSION = 'v1'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

export class GitHubTokenService {
  private readonly key: Buffer

  constructor(rawKey: string) {
    const key = Buffer.from(rawKey, 'base64')
    if (key.length !== 32) {
      throw new Error('GitHub token encryption key must be a base64 encoded 32-byte key')
    }
    this.key = key
  }

  encrypt(token: string) {
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, this.key, iv)
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    return [
      VERSION,
      iv.toString('base64url'),
      authTag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join(':')
  }

  decrypt(encryptedToken: string) {
    const [version, iv, authTag, encrypted] = encryptedToken.split(':')
    if (version !== VERSION || !iv || !authTag || !encrypted) {
      throw new Error('Unsupported encrypted GitHub token format')
    }

    const decipher = createDecipheriv(ALGORITHM, this.key, Buffer.from(iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(authTag, 'base64url'))

    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  }
}
