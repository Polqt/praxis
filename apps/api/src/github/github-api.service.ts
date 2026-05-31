import { Injectable, UnauthorizedException } from '@nestjs/common'
import { GitHubTokenMetadata, GitHubViewer } from './github.types'

@Injectable()
export class GitHubApiService {
  async getViewer(accessToken: string): Promise<GitHubViewer & GitHubTokenMetadata> {
    const response = await fetch('https://api.github.com/user', {
      headers: this.headers(accessToken),
    })

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
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: this.headers(accessToken),
    })

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
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${ref}`, {
      headers: this.headers(accessToken),
    })

    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error(`GitHub commit lookup failed with status ${response.status}`)
    }

    return response.json() as Promise<{ sha: string; author: { id: number | null; login: string | null } | null }>
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
