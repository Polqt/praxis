import { BadRequestException } from '@nestjs/common'

export function parseRepoFullName(repoFullName: string) {
  const parts = repoFullName.split('/')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new BadRequestException('Repository must be in owner/repo format')
  }

  return { owner: parts[0], repo: parts[1] }
}
