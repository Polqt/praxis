import { Injectable, UnauthorizedException } from '@nestjs/common'
import { GitHubTokenMetadata, GitHubViewer } from './github.types'

class GitHubRateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super(`GitHub rate limit hit — retry after ${retryAfterSeconds}s`)
    this.name = 'GitHubRateLimitError'
  }
}

@Injectable()
export class GitHubApiService {
  async getViewer(accessToken: string): Promise<GitHubViewer & GitHubTokenMetadata> {
    const response = await this.githubFetch('https://api.github.com/user', accessToken)

    if (response.status === 401) {
      throw new UnauthorizedException('Invalid GitHub access token')
    }
    if (!response.ok) {
      throw new Error(`GitHub user lookup failed with status ${response.status}`)
    }

    const body = await response.json() as { id: number; login: string; email: string | null }
    const scopes = response.headers.get('x-oauth-scopes')
      ?.split(',')
      .map((scope) => scope.trim())
      .filter(Boolean) ?? []

    return {
      id: body.id,
      login: body.login,
      email: body.email,
      scopes,
    }
  }

  async getRepository(accessToken: string, owner: string, repo: string) {
    const response = await this.githubFetch(`https://api.github.com/repos/${owner}/${repo}`, accessToken)

    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error(`GitHub repository lookup failed with status ${response.status}`)
    }

    return response.json() as Promise<{
      id: number
      full_name: string
      owner: { id: number; login: string }
      permissions?: { admin?: boolean; maintain?: boolean; push?: boolean; triage?: boolean; pull?: boolean }
      default_branch: string
    }>
  }

  async getCommit(accessToken: string, owner: string, repo: string, ref: string) {
    const response = await this.githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${ref}`,
      accessToken,
    )

    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error(`GitHub commit lookup failed with status ${response.status}`)
    }

    return response.json() as Promise<{ sha: string; author: { id: number | null; login: string | null } | null }>
  }

  async listUserRepos(accessToken: string): Promise<string[]> {
    const response = await this.githubFetch(
      'https://api.github.com/user/repos?sort=pushed&per_page=100&type=owner',
      accessToken,
    )
    if (!response.ok) return []
    const body = await response.json() as Array<{ full_name: string }>
    return body.map((r) => r.full_name)
  }

  async getTree(accessToken: string, owner: string, repo: string, commitSha: string) {
    const response = await this.githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`,
      accessToken,
    )

    if (!response.ok) {
      throw new Error(`GitHub tree lookup failed with status ${response.status}`)
    }

    return response.json() as Promise<{
      tree: Array<{ path: string; type: 'blob' | 'tree'; size?: number; sha: string }>
      truncated: boolean
    }>
  }

  async getFileContent(accessToken: string, owner: string, repo: string, path: string, ref: string) {
    const response = await this.githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${ref}`,
      accessToken,
    )

    if (!response.ok) {
      throw new Error(`GitHub file lookup failed with status ${response.status}`)
    }

    const body = await response.json() as { encoding?: string; content?: string }
    if (body.encoding !== 'base64' || !body.content) return ''
    return Buffer.from(body.content, 'base64').toString('utf8')
  }

  private async githubFetch(url: string, accessToken: string): Promise<Response> {
    const response = await fetch(url, {
      headers: this.headers(accessToken),
      signal: AbortSignal.timeout(30_000),
    })

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('retry-after') ?? '60', 10)
      throw new GitHubRateLimitError(retryAfter)
    }

    return response
  }

  private headers(accessToken: string) {
    return {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Praxis',
    }
  }
}
