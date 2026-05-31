import * as assert from 'node:assert/strict'
import { GitHubTokenService } from './github-token.service'

const base64Key = Buffer.alloc(32, 7).toString('base64')

const service = new GitHubTokenService(base64Key)
const encrypted = service.encrypt('gho_example_token')

assert.notEqual(encrypted, 'gho_example_token')
assert.match(encrypted, /^v1:/)
assert.equal(service.decrypt(encrypted), 'gho_example_token')

assert.throws(() => new GitHubTokenService('short-key'), /32-byte/)
